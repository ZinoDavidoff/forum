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
import { ThreadsService } from "./threads.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateThreadDto } from "./dto/create-thread.dto";
import { UpdateThreadDto } from "./dto/update-thread.dto";

@Controller("threads")
export class ThreadsController {
  constructor(private threadsService: ThreadsService) {}

  @Get()
  findAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
    @Query("categoryId") categoryId?: string,
    @Query("search") search?: string
  ) {
    return this.threadsService.findAll(page, limit, categoryId, search);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.threadsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createThreadDto: CreateThreadDto) {
    return this.threadsService.create(createThreadDto, req.user.id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  update(
    @Request() req,
    @Param("id") id: string,
    @Body() updateThreadDto: UpdateThreadDto
  ) {
    return this.threadsService.update(id, updateThreadDto, req.user.id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param("id") id: string) {
    return this.threadsService.remove(id, req.user.id);
  }
}
