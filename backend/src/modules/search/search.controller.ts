import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  searchAll(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.searchService.searchAll(query, page, limit);
  }

  @Get('threads')
  searchThreads(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.searchService.searchThreads(query, page, limit);
  }

  @Get('posts')
  searchPosts(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.searchService.searchPosts(query, page, limit);
  }

  @Get('users')
  searchUsers(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.searchService.searchUsers(query, page, limit);
  }
}
