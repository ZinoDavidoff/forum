import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("messages")
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  sendMessage(
    @Request() req,
    @Body("recipientId") recipientId: string,
    @Body("content") content: string
  ) {
    return this.messagesService.sendMessage(req.user.id, recipientId, content);
  }

  @Get("conversations")
  getUserConversations(@Request() req) {
    return this.messagesService.getUserConversations(req.user.id);
  }

  @Get("conversation/:userId")
  getConversation(
    @Request() req,
    @Param("userId") userId: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 50
  ) {
    return this.messagesService.getConversation(
      req.user.id,
      userId,
      page,
      limit
    );
  }

  @Put(":id/read")
  markAsRead(@Request() req, @Param("id") id: string) {
    return this.messagesService.markAsRead(id, req.user.id);
  }
}
