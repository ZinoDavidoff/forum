import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("stats")
  async getStats() {
    return this.usersService.getCommunityStats();
  }

  @Get()
  findAll(@Query("page") page: number = 1, @Query("limit") limit: number = 20) {
    return this.usersService.findAll(page, limit);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }

  @Get("me/bookmarks")
  @UseGuards(JwtAuthGuard)
  getBookmarks(
    @Request() req,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20
  ) {
    return this.usersService.getBookmarks(req.user.id, page, limit);
  }

  @Get("me/bookmarks/:threadId")
  @UseGuards(JwtAuthGuard)
  isBookmarked(@Request() req, @Param("threadId") threadId: string) {
    return this.usersService.isBookmarked(req.user.id, threadId);
  }

  @Post("me/bookmarks/:threadId")
  @UseGuards(JwtAuthGuard)
  addBookmark(@Request() req, @Param("threadId") threadId: string) {
    return this.usersService.addBookmark(req.user.id, threadId);
  }

  @Delete("me/bookmarks/:threadId")
  @UseGuards(JwtAuthGuard)
  removeBookmark(@Request() req, @Param("threadId") threadId: string) {
    return this.usersService.removeBookmark(req.user.id, threadId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Put("me")
  @UseGuards(JwtAuthGuard)
  update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }
}
