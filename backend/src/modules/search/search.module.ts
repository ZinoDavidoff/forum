import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { Thread } from '../threads/thread.entity';
import { Post } from '../posts/post.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Thread, Post, User])],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
