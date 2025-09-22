import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SuccessResponse } from 'src/shared/classes/success-response.class';

@Controller({
  path: 'search',
  version: '1',
})
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async getSearchResultsByQueryAsync(@Query('query') query: string) {
    const results = await this.searchService.searchAsync(query);
    return new SuccessResponse('Search success', results);
  }
}
