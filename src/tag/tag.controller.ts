import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import {
  PaginationDto,
  PaginationSchema,
} from 'src/shared/classes/pagination.dto';
import { ZodValidationPipe } from 'src/shared/pipes/zod.pipe';
import { LoggedInOnly } from 'src/auth/guards/authenticated.guard';

@Controller({ path: 'tag', version: '1' })
export class TagController {
  constructor(private tagService: TagService) {}

  @UseGuards(LoggedInOnly)
  @Post()
  async create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create(createTagDto);
  }

  @Get()
  async findAll(
    @Query(new ZodValidationPipe(PaginationSchema)) pagination: PaginationDto,
    @Query('name') name?: string,
  ) {
    return this.tagService.findAll(pagination, name);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tagService.findOne(id);
  }

  @UseGuards(LoggedInOnly)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tagService.remove(id);
  }
}
