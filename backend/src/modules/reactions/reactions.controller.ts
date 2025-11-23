import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  Get,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ReactionsService } from "./reactions.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ReactionType, TargetType } from "./reaction.entity";

@Controller("reactions")
export class ReactionsController {
  constructor(private reactionsService: ReactionsService) {}

  @Post("post/:postId")
  @UseGuards(JwtAuthGuard)
  addPostReaction(
    @Request() req,
    @Param("postId") postId: string,
    @Body("type") type: ReactionType
  ) {
    return this.reactionsService.addReaction(
      req.user.id,
      postId,
      type,
      TargetType.POST
    );
  }

  @Post("thread/:threadId")
  @UseGuards(JwtAuthGuard)
  addThreadReaction(
    @Request() req,
    @Param("threadId") threadId: string,
    @Body("type") type: ReactionType
  ) {
    return this.reactionsService.addReaction(
      req.user.id,
      threadId,
      type,
      TargetType.THREAD
    );
  }

  @Delete("post/:postId")
  @UseGuards(JwtAuthGuard)
  removePostReaction(@Request() req, @Param("postId") postId: string) {
    return this.reactionsService.removeReaction(
      req.user.id,
      postId,
      TargetType.POST
    );
  }

  @Delete("thread/:threadId")
  @UseGuards(JwtAuthGuard)
  removeThreadReaction(@Request() req, @Param("threadId") threadId: string) {
    return this.reactionsService.removeReaction(
      req.user.id,
      threadId,
      TargetType.THREAD
    );
  }

  @Get("user/post/:postId")
  @UseGuards(JwtAuthGuard)
  getUserPostReaction(@Request() req, @Param("postId") postId: string) {
    return this.reactionsService.getUserReaction(
      req.user.id,
      postId,
      TargetType.POST
    );
  }

  @Get("user/thread/:threadId")
  @UseGuards(JwtAuthGuard)
  getUserThreadReaction(@Request() req, @Param("threadId") threadId: string) {
    return this.reactionsService.getUserReaction(
      req.user.id,
      threadId,
      TargetType.THREAD
    );
  }

  @Get("post/:postId")
  getPostReactions(@Param("postId") postId: string) {
    return this.reactionsService.getPostReactions(postId);
  }

  @Get("thread/:threadId")
  getThreadReactions(@Param("threadId") threadId: string) {
    return this.reactionsService.getThreadReactions(threadId);
  }
}
