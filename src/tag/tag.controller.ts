import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';

@Controller({ path: 'tag', version: '1' })
export class TagController {
  constructor(private tagService: TagService) {}

  @Post()
  async create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create(createTagDto);
  }

  @Get()
  async findAll(@Query('name') name?: string) {
    return this.tagService.findAll(name);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tagService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tagService.remove(id);
  }
}
