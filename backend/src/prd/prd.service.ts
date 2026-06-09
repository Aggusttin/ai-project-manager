import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prd } from './prd.entity';
import { CreatePrdDto } from './dto/create-prd.dto';
import { UserStory } from '../user-stories/user-story.entity';

@Injectable()
export class PrdService {
  constructor(
    @InjectRepository(Prd) private readonly prdRepository: Repository<Prd>,
    @InjectRepository(UserStory) private readonly usRepository: Repository<UserStory>,
  ) {}

  async create(createPrdDto: CreatePrdDto): Promise<Prd> {
    const stories = await this.usRepository.findByIds(createPrdDto.user_stories_ids);
    const nuevoPrd = this.prdRepository.create({
      titulo: createPrdDto.titulo,
      descripcion: createPrdDto.descripcion,
      version: createPrdDto.version,
      proyecto_id: createPrdDto.proyecto_id,
      userStories: stories,
    });
    return await this.prdRepository.save(nuevoPrd);
  }

  async findOne(id: number): Promise<Prd> {
    const prd = await this.prdRepository.findOne({
      where: { id },
      relations: ['userStories', 'proyecto'],
    });
    if (!prd) throw new NotFoundException(`PRD con ID ${id} no encontrado`);
    return prd; // 👈 Ahora ya no es null, siempre es un Prd
  }

  async findByProyectoId(proyectoId: number): Promise<Prd> {
    const prd = await this.prdRepository.findOne({
      where: { proyecto_id: proyectoId }, // Asegúrate que el campo sea proyecto_id
      relations: ['userStories', 'proyecto'],
    });
    
    if (!prd) {
      throw new NotFoundException(`No se encontró un PRD para el proyecto con ID ${proyectoId}`);
    }
    return prd;
  }
}