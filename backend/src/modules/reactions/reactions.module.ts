import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { Reaction } from './reaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction])],
  providers: [ReactionsService],
  controllers: [ReactionsController],
})
export class ReactionsModule {}
