import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReputationService } from './reputation.service';
import { Badge } from './badge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Badge])],
  providers: [ReputationService],
  exports: [ReputationService],
})
export class ReputationModule {}
