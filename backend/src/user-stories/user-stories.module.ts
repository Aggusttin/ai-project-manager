import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserStory } from './user-story.entity';
import { UserStoriesService } from './user-stories.service';
import { UserStoriesController } from './user-stories.controller';
import { Proyecto } from '../proyectos/proyecto.entity'; // 👈 IMPORTANTE

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserStory,
      Proyecto,
    ]),
  ],
  controllers: [UserStoriesController],
  providers: [UserStoriesService],
})
export class UserStoriesModule {}