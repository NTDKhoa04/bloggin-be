import OpenAI from 'openai';
import { generateText } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import Blockquote from '@tiptap/extension-blockquote';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import CodeBlock from '@tiptap/extension-code-block';
import Link from '@tiptap/extension-link';
import { TextStyleKit } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import { TableKit } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import FontFamily from '@tiptap/extension-font-family';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

import { Injectable, UnauthorizedException } from '@nestjs/common';

function normalizePlain(s: string): string {
  return s
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

@Injectable()
export class SentimentAnalyzeService {
  async analyzeSentiment(comment: string): Promise<boolean> {
    try {
      console.log("Check violation");

      const moderation = await openai.moderations.create({
        model: 'omni-moderation-latest',
        input: comment,
      });

      console.log("Check violation", moderation);

      if (moderation.results[0].flagged) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException(error);
    }
  }
  jsonToString(data: string): string {
    const json = JSON.parse(data);
    const text = generateText(
      json,
      [
        StarterKit.configure({
          document: false,
          heading: false,
          blockquote: false,
          horizontalRule: false,
          codeBlock: false,
        }),
        Document,
        Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
        Blockquote,
        HorizontalRule,
        CodeBlock,
        Link.configure({ openOnClick: false }),
        TextStyleKit,
        Color,
        Underline,
        Highlight.configure({ multicolor: true }),
        Subscript,
        Superscript,
        Typography,
        FontFamily,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        TableKit,
        TableRow,
        TableHeader,
        TableCell,
        Image,
        Placeholder.configure({ placeholder: '' }),
      ],
      { blockSeparator: '\n' },
    );

    return normalizePlain(text);
  }
}
