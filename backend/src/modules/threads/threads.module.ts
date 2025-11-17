import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThreadsService } from "./threads.service";
import { ThreadsController } from "./threads.controller";
import { Thread } from "./thread.entity";
import { Post } from "../posts/post.entity";
import { UsersModule } from "../users/users.module";
import { CategoriesModule } from "../categories/categories.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Thread, Post]),
    UsersModule,
    CategoriesModule,
  ],
  providers: [ThreadsService],
  controllers: [ThreadsController],
  exports: [ThreadsService],
})
export class ThreadsModule {}
