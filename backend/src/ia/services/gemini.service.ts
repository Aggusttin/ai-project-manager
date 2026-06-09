import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey: string;
  
  // Lista actualizada con los modelos que tu API key reconoce
  private readonly modelosPrioridad = [
    'gemini-3.5-flash', 
    'gemini-3.1-flash-lite', 
    'gemini-2.5-flash', 
    'gemini-2.0-flash'
  ];

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY')?.trim() || '';
  }

  async llamarGemini(prompt: string, esperaJson = true): Promise<any> {
    let lastError;
    for (const modelName of this.modelosPrioridad) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;
        
        const response = await axios.post(url, {
          contents: [{ parts: [{ text: prompt }] }]
        });
        
        const text = response.data.candidates[0].content.parts[0].text;
        return esperaJson ? this.limpiarRespuesta(text) : text.trim();
      } catch (error) {
        lastError = error.response?.data?.error?.message || error.message;
        this.logger.warn(`El modelo ${modelName} falló: ${lastError}. Probando siguiente...`);
      }
    }
    throw new InternalServerErrorException(`Gemini no disponible: ${lastError}`);
  }

  private limpiarRespuesta(text: string): any {
    try {
      const cleanText = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanText);
    } catch (e) {
      this.logger.error('Error al parsear el JSON de Gemini', text);
      throw new InternalServerErrorException('La IA no devolvió un JSON válido');
    }
  }

  // MÉTODO FALTANTE QUE CAUSABA EL ERROR
  async generarPrd(proyecto: any) {
    const prompt = `Genera un Product Requirements Document (PRD) en formato JSON puro.
    Proyecto: ${proyecto.nombre}
    Descripción: ${proyecto.descripcion}
    Estructura JSON: { "titulo": "string", "resumenEjecutivo": "string", "objetivos": ["string"], "alcance": { "dentro": ["string"], "fuera": ["string"] }, "actores": ["string"], "requisitosFuncionales": ["string"] }.
    Devuelve SOLO el JSON sin texto adicional.`;
    return await this.llamarGemini(prompt, true);
  }

  async estimarHistoria(descripcion: string): Promise<number> {
    const prompt = `Analiza la siguiente User Story y devuelve SOLO un número (Fibonacci: 1, 2, 3, 5, 8, 13) que represente su complejidad. No escribas nada más.
    User Story: ${descripcion}`;
    const respuesta = await this.llamarGemini(prompt, false);
    const numero = parseInt(respuesta);
    return isNaN(numero) ? 1 : numero;
  }

  async generarUserStories(proyecto: any) {
    const prompt = `Actúa como un API generadora de JSON. Genera 5 User Stories para el proyecto "${proyecto.nombre}". Devuelve EXCLUSIVAMENTE un JSON array. Estructura: [ { "titulo": "string", "descripcion": "string", "prioridad": 1 } ].`;
    return await this.llamarGemini(prompt, true);
  }

  async listarModelosDisponibles(): Promise<any> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`;
    const { data } = await axios.get(url);
    return data;
  }
}