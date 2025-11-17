import { Controller, Post, Delete, Param, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReactionType } from './reaction.entity';

@Controller('reactions')
export class ReactionsController {
  constructor(private reactionsService: ReactionsService) {}

  @Post(':postId')
  @UseGuards(JwtAuthGuard)
  addReaction(
    @Request() req,
    @Param('postId') postId: string,
    @Body('type') type: ReactionType,
  ) {
    return this.reactionsService.addReaction(req.user.id, postId, type);
  }

  @Delete(':postId')
  @UseGuards(JwtAuthGuard)
  removeReaction(@Request() req, @Param('postId') postId: string) {
    return this.reactionsService.removeReaction(req.user.id, postId);
  }

  @Get('post/:postId')
  getPostReactions(@Param('postId') postId: string) {
    return this.reactionsService.getPostReactions(postId);
  }
}
