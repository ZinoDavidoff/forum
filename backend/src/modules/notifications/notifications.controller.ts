import { Controller, Get, Put, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findUserNotifications(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.notificationsService.findUserNotifications(req.user.id, page, limit);
  }

  @Put(':id/read')
  markAsRead(@Request() req, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Put('read-all')
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}
