import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesGateway } from './messages.gateway';
import { Message } from './message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessagesService, MessagesGateway],
  controllers: [MessagesController],
})
export class MessagesModule {}
