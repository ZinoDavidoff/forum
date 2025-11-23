import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReactionsService } from "./reactions.service";
import { ReactionsController } from "./reactions.controller";
import { Reaction } from "./reaction.entity";
import { Post } from "../posts/post.entity";
import { Thread } from "../threads/thread.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Reaction, Post, Thread])],
  providers: [ReactionsService],
  controllers: [ReactionsController],
})
export class ReactionsModule {}
