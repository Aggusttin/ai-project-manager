import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prd } from './prd.entity';
import { PrdService } from './prd.service';
import { PrdController } from './prd.controller';
import { UserStory } from '../user-stories/user-story.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prd, UserStory])],
  providers: [PrdService],
  controllers: [PrdController],
})
export class PrdModule {}