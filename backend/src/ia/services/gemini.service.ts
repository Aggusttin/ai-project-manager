import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private model;

  constructor(
    private readonly configService: ConfigService,
  ) {
    const apiKey =
      this.configService.get<string>(
        'GEMINI_API_KEY',
      );

    const modelName =
      this.configService.get<string>(
        'GEMINI_MODEL',
      ) || 'gemini-2.0-flash';

    const genAI =
      new GoogleGenerativeAI(apiKey!);

    this.model =
      genAI.getGenerativeModel({
        model: modelName,
      });
  }

  async generarPrd(
    proyecto: any,
  ) {
    const prompt = `
Genera un Product Requirements Document (PRD) en formato JSON.

Proyecto:
Nombre: ${proyecto.nombre}

Descripción:
${proyecto.descripcion}

Devuelve exclusivamente JSON con esta estructura:

{
  "titulo": "",
  "resumenEjecutivo": "",
  "objetivos": [],
  "alcance": {
    "dentro": [],
    "fuera": []
  },
  "actores": [],
  "requisitosFuncionales": []
}
`;

    const result =
      await this.model.generateContent(
        prompt,
      );

    const text =
      result.response.text();

    return JSON.parse(
      text.replace(
        /```json|```/g,
        '',
      ),
    );
  }
}