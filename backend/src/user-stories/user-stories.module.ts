import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserStory } from './user-story.entity';
import { UserStoriesService } from './user-stories.service';
import { UserStoriesController } from './user-stories.controller';
import { Proyecto } from '../proyectos/proyecto.entity'; // 👈 IMPORTANTE
import { PrdModule } from '../prd/prd.module';
import { IaModule } from '../ia/ia.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserStory, Proyecto]),
    PrdModule, 
    IaModule
  ],
  controllers: [UserStoriesController],
  providers: [UserStoriesService],
  exports: [UserStoriesService],
})
export class UserStoriesModule {}