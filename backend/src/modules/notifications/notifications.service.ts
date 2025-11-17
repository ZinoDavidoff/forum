import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification, NotificationType } from "./notification.entity";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    senderId?: string
  ) {
    const notification = this.notificationsRepository.create({
      user: { id: userId } as any,
      type,
      title,
      message,
      link,
      senderId,
    });

    return await this.notificationsRepository.save(notification);
  }

  async findUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const [notifications, total] =
      await this.notificationsRepository.findAndCount({
        where: { user: { id: userId } },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: "DESC" },
      });

    return {
      data: notifications,
      total,
      page,
      lastPage: Math.ceil(total / limit),
      unreadCount: notifications.filter((n) => !n.isRead).length,
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (notification) {
      notification.isRead = true;
      await this.notificationsRepository.save(notification);
    }

    return notification;
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true }
    );

    return { message: "All notifications marked as read" };
  }
}
