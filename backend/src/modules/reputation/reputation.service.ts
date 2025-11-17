import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from './badge.entity';

@Injectable()
export class ReputationService {
  constructor(
    @InjectRepository(Badge)
    private badgesRepository: Repository<Badge>,
  ) {}

  async createBadge(name: string, description: string, icon: string, requirement: string, points: number = 0) {
    const badge = this.badgesRepository.create({
      name,
      description,
      icon,
      requirement,
      points,
    });

    return await this.badgesRepository.save(badge);
  }

  async getAllBadges() {
    return await this.badgesRepository.find();
  }
}
