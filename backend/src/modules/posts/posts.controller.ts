import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { PostsService } from "./posts.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";

@Controller("posts")
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get("thread/:threadId")
  findByThread(
    @Param("threadId") threadId: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20
  ) {
    return this.postsService.findByThread(threadId, page, limit);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.postsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto, req.user.id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  update(
    @Request() req,
    @Param("id") id: string,
    @Body() updatePostDto: UpdatePostDto
  ) {
    return this.postsService.update(id, updatePostDto, req.user.id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param("id") id: string) {
    return this.postsService.remove(id, req.user.id);
  }
}
