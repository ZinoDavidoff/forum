import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from "./message.entity";

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>
  ) {}

  async sendMessage(senderId: string, recipientId: string, content: string) {
    const message = this.messagesRepository.create({
      sender: { id: senderId } as any,
      recipient: { id: recipientId } as any,
      content,
    });

    return await this.messagesRepository.save(message);
  }

  async getConversation(
    userId: string,
    otherUserId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const [messages, total] = await this.messagesRepository.findAndCount({
      where: [
        { sender: { id: userId }, recipient: { id: otherUserId } },
        { sender: { id: otherUserId }, recipient: { id: userId } },
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
      relations: ["sender", "recipient"],
    });

    return {
      data: messages.reverse(),
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async getUserConversations(userId: string) {
    const messages = await this.messagesRepository
      .createQueryBuilder("message")
      .leftJoinAndSelect("message.sender", "sender")
      .leftJoinAndSelect("message.recipient", "recipient")
      .where("message.senderId = :userId OR message.recipientId = :userId", {
        userId,
      })
      .orderBy("message.createdAt", "DESC")
      .getMany();

    const conversations = new Map();

    messages.forEach((msg) => {
      const otherId =
        msg.sender.id === userId ? msg.recipient.id : msg.sender.id;
      if (!conversations.has(otherId)) {
        conversations.set(otherId, {
          user: msg.sender.id === userId ? msg.recipient : msg.sender,
          lastMessage: msg,
          unreadCount: 0,
        });
      }
      if (!msg.isRead && msg.recipient.id === userId) {
        conversations.get(otherId).unreadCount++;
      }
    });

    return Array.from(conversations.values());
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId, recipient: { id: userId } },
    });

    if (message) {
      message.isRead = true;
      message.readAt = new Date();
      await this.messagesRepository.save(message);
    }

    return message;
  }
}
