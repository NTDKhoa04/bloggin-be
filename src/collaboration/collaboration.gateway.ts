import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { CollaboratorService } from 'src/collaborator/collaborator.service';
import { DraftService } from 'src/draft/draft.service';
import * as Y from 'yjs';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  draftId?: string;
  userRole?: 'owner' | 'editor' | 'viewer' | null;
}

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000', // Development
      'https://www.bloggin.blog', // Production
      'https://bloggin.blog', // Production (without www)
    ],
    credentials: true,
  },
  namespace: '/collaboration',
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CollaborationGateway.name);
  private draftYDocs: Map<string, Y.Doc> = new Map();
  private saveTimers: Map<string, NodeJS.Timeout> = new Map();
  // Track active users per draft: Map<draftId, Map<socketId, userInfo>>
  private activeUsers: Map<
    string,
    Map<string, { socketId: string; userId: string; role: string }>
  > = new Map();

  constructor(
    private readonly collaboratorService: CollaboratorService,
    private readonly draftService: DraftService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      this.logger.log(`Client attempting to connect: ${client.id}`);

      // Extract authentication from handshake
      const userId = client.handshake.auth?.userId;
      const draftId = client.handshake.query?.draftId as string;

      if (!userId || !draftId) {
        this.logger.warn(
          `Connection rejected: Missing userId or draftId for client ${client.id}`,
        );
        client.disconnect();
        return;
      }

      // Check user's role and permissions
      const userRole = await this.collaboratorService.getUserRole(
        draftId,
        userId,
      );

      if (!userRole) {
        this.logger.warn(
          `Connection rejected: User ${userId} has no access to post ${draftId}`,
        );
        client.disconnect();
        return;
      }

      // Attach metadata to socket
      client.userId = userId;
      client.draftId = draftId;
      client.userRole = userRole;

      // Join the post-specific room
      client.join(`draft:${draftId}`);

      this.logger.log(
        `Client ${client.id} connected to post ${draftId} as ${userRole}`,
      );

      // Initialize or get existing Y.Doc
      let yDoc = this.draftYDocs.get(draftId);
      if (!yDoc) {
        this.logger.log(`🔄 Initializing new Y.Doc for draft ${draftId}`);
        yDoc = new Y.Doc();

        // Load existing content from database if available
        this.logger.log(`📥 Loading draft ${draftId} from database...`);
        const draft = await this.draftService.findOne(draftId);
        if (draft?.data?.yjsContent) {
          const state = Buffer.from(draft.data.yjsContent, 'base64');
          Y.applyUpdate(yDoc, new Uint8Array(state));
          this.logger.log(
            `✅ Loaded existing Y.Doc state for draft ${draftId} (${state.length} bytes)`,
          );
        } else {
          this.logger.log(
            `ℹ️ No existing yjsContent for draft ${draftId}, starting with empty Y.Doc`,
          );
        }

        this.draftYDocs.set(draftId, yDoc);
        this.logger.log(`✅ Y.Doc cached in memory for draft ${draftId}`);
      } else {
        this.logger.log(
          `♻️ Reusing existing Y.Doc from memory for draft ${draftId}`,
        );
      }

      // Track active user
      if (!this.activeUsers.has(draftId)) {
        this.activeUsers.set(draftId, new Map());
      }
      const roomUsers = this.activeUsers.get(draftId)!;
      const userInfo = {
        socketId: client.id,
        userId,
        role: userRole,
      };
      roomUsers.set(client.id, userInfo);

      this.logger.log(
        `👤 User ${userId} added to active users for draft ${draftId}`,
      );

      // Notify others that user joined
      client.to(`draft:${draftId}`).emit('user-joined', {
        userId,
        role: userRole,
        socketId: client.id,
      });
      this.logger.log(`📢 Emitted user-joined to room draft:${draftId}`);

      // Send active users list to newly connected client
      const activeUsersList = Array.from(roomUsers.values());
      client.emit('active-users', activeUsersList);
      this.logger.log(
        `📋 Sent active-users list (${activeUsersList.length} users) to client ${client.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error during connection: ${error.message}`,
        error.stack,
      );
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    if (client.draftId && client.userId) {
      // Remove from active users tracking
      const roomUsers = this.activeUsers.get(client.draftId);
      if (roomUsers) {
        roomUsers.delete(client.id);
        this.logger.log(
          `👤 Removed user ${client.userId} from active users for draft ${client.draftId}`,
        );

        // Clean up empty room tracking
        if (roomUsers.size === 0) {
          this.activeUsers.delete(client.draftId);
          this.logger.log(
            `🧹 Cleaned up empty active users map for draft ${client.draftId}`,
          );
        }
      }

      // Notify others in the room
      client.to(`draft:${client.draftId}`).emit('user-left', {
        userId: client.userId,
        socketId: client.id,
      });
      this.logger.log(`📢 Emitted user-left to room draft:${client.draftId}`);

      // Check if there are any remaining clients in this post's room
      // Safety check: ensure server and adapter are initialized
      if (this.server?.sockets?.adapter?.rooms) {
        const room = this.server.sockets.adapter.rooms.get(
          `draft:${client.draftId}`,
        );
        if (!room || room.size === 0) {
          // Save the document state one last time before cleanup
          await this.saveYDocToDatabase(client.draftId);
          this.logger.log(
            `No more clients for draft ${client.draftId}, saved state`,
          );
        }
      } else {
        // Fallback: always save if we can't check room size
        await this.saveYDocToDatabase(client.draftId);
        this.logger.log(
          `Client disconnected from draft ${client.draftId}, saved state (adapter unavailable)`,
        );
      }
    }
  }

  @SubscribeMessage('yjs-update')
  async handleYjsUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { update: string },
  ) {
    const { draftId, userId, userRole } = client;

    this.logger.log(
      `Received yjs-update from ${userId} (${userRole}) for draft ${draftId}`,
    );

    if (!draftId || !userId) {
      this.logger.warn(`Missing draftId or userId in yjs-update`);
      return;
    }

    // Check write permission (only owner and editor can send updates)
    if (userRole === 'viewer') {
      this.logger.warn(
        `Viewer ${userId} attempted to send update to draft ${draftId}`,
      );
      client.emit('error', { message: 'Viewers cannot edit the document' });
      return;
    }

    try {
      const yDoc = this.draftYDocs.get(draftId);
      if (!yDoc) {
        this.logger.error(`Y.Doc not found for draft ${draftId}`);
        return;
      }

      // Apply update to server's Y.Doc
      const update = Buffer.from(data.update, 'base64');
      Y.applyUpdate(yDoc, new Uint8Array(update));

      this.logger.log(`Broadcasting yjs-update to room draft:${draftId}`);

      // Broadcast update to all other clients in the room
      client.to(`draft:${draftId}`).emit('yjs-update', {
        update: data.update,
        userId,
      });

      // Schedule a save operation
      this.scheduleSave(draftId);
    } catch (error) {
      this.logger.error(
        `Error handling yjs-update: ${error.message}`,
        error.stack,
      );
      client.emit('error', { message: 'Failed to process update' });
    }
  }

  @SubscribeMessage('awareness-update')
  async handleAwarenessUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { awareness: any },
  ) {
    const { draftId, userId } = client;

    this.logger.debug(
      `Received awareness-update from ${userId} for draft ${draftId}`,
    );

    if (!draftId || !userId) {
      return;
    }

    // Broadcast awareness (cursor position, selection, etc.) to other clients
    client.to(`draft:${draftId}`).emit('awareness-update', {
      awareness: data.awareness,
      userId,
    });
  }

  @SubscribeMessage('request-sync')
  async handleRequestSync(@ConnectedSocket() client: AuthenticatedSocket) {
    const { draftId } = client;

    this.logger.log(
      `📥 Client ${client.id} requested sync for draft ${draftId}`,
    );

    if (!draftId) {
      this.logger.warn(
        `❌ No draftId for sync request from client ${client.id}`,
      );
      return;
    }

    const yDoc = this.draftYDocs.get(draftId);
    if (yDoc) {
      const state = Y.encodeStateAsUpdate(yDoc);
      const base64State = Buffer.from(state).toString('base64');
      client.emit('sync-update', {
        update: base64State,
      });
      this.logger.log(
        `📤 Sent sync-update to client ${client.id} (${state.length} bytes)`,
      );
    } else {
      this.logger.warn(
        `⚠️ No Y.Doc found for draft ${draftId} during sync request`,
      );
    }
  }

  @SubscribeMessage('get-active-users')
  handleGetActiveUsers(@ConnectedSocket() client: AuthenticatedSocket) {
    const { draftId } = client;

    this.logger.log(
      `📋 Client ${client.id} requested active users for draft ${draftId}`,
    );

    if (!draftId) {
      return;
    }

    const roomUsers = this.activeUsers.get(draftId);
    const activeUsersList = roomUsers ? Array.from(roomUsers.values()) : [];

    client.emit('active-users', activeUsersList);
    this.logger.log(
      `📤 Sent active-users list (${activeUsersList.length} users) to client ${client.id}`,
    );
  }

  private async initializeYDoc(draftId: string): Promise<void> {
    if (this.draftYDocs.has(draftId)) {
      return; // Already initialized
    }

    const yDoc = new Y.Doc();

    // Load existing state from database
    try {
      const postResponse = await this.draftService.findOne(draftId);
      const post = postResponse.data;

      if (post?.yjsContent) {
        const state = Buffer.from(post.yjsContent, 'base64');
        Y.applyUpdate(yDoc, new Uint8Array(state));
        this.logger.log(`Loaded existing Y.Doc state for post ${draftId}`);
      } else {
        this.logger.log(`Initialized new Y.Doc for post ${draftId}`);
      }
    } catch (error) {
      this.logger.error(
        `Error loading Y.Doc state for post ${draftId}: ${error.message}`,
      );
    }

    this.draftYDocs.set(draftId, yDoc);
  }

  private scheduleSave(draftId: string) {
    // Clear existing timeout
    if (this.saveTimers.has(draftId)) {
      clearTimeout(this.saveTimers.get(draftId));
      this.logger.debug(`⏱️ Reset save timer for draft ${draftId}`);
    } else {
      this.logger.debug(
        `⏱️ Scheduled save for draft ${draftId} (will save in 2s)`,
      );
    }

    // Schedule save after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      this.logger.log(`💾 Save timer triggered for draft ${draftId}`);
      this.saveYDocToDatabase(draftId);
      this.saveTimers.delete(draftId);
    }, 2000);

    this.saveTimers.set(draftId, timeout);
  }

  private async saveYDocToDatabase(draftId: string) {
    const yDoc = this.draftYDocs.get(draftId);
    if (!yDoc) {
      this.logger.warn(`❌ Cannot save: Y.Doc not found for draft ${draftId}`);
      return;
    }

    try {
      this.logger.log(
        `💾 Saving Y.Doc state to database for draft ${draftId}...`,
      );
      const state = Y.encodeStateAsUpdate(yDoc);
      const base64State = Buffer.from(state).toString('base64');

      this.logger.debug(
        `📦 Encoded state size: ${state.length} bytes, base64: ${base64State.length} chars`,
      );

      await this.draftService.saveYjsContent(draftId, base64State);
      this.logger.log(
        `✅ Successfully saved Y.Doc state for draft ${draftId} to database`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to save Y.Doc for draft ${draftId}: ${error.message}`,
      );
    }
  }
}
