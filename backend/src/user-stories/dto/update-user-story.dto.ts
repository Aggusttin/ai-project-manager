import { PartialType } from '@nestjs/mapped-types';
import { CreateUserStoryDto } from './create-user-story.dto';

export class UpdateUserStoryDto extends PartialType(CreateUserStoryDto) {}