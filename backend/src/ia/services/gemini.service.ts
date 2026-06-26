import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import axios from 'axios';

@Injectable()
export class GeminiService {
  private readonly logger =
    new Logger(
      GeminiService.name,
    );

  private readonly apiKey: string;

  private readonly modelosPrioridad = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
  ];

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.apiKey =
      this.configService
        .get<string>(
          'GEMINI_API_KEY',
        )
        ?.trim() || '';
  }

  // =====================================================
  // MÉTODO BASE
  // =====================================================

  async llamarGemini(
    prompt: string,
    esperaJson = true,
  ): Promise<any> {
    let lastError;

    for (const modelName of this
      .modelosPrioridad) {
      try {
        const url =
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;

        const response =
          await axios.post(
            url,
            {
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
            },
          );

        const text =
          response.data
            ?.candidates?.[0]
            ?.content?.parts?.[0]
            ?.text;

        if (!text) {
          throw new Error(
            'Respuesta vacía de Gemini',
          );
        }

        return esperaJson
          ? this.limpiarRespuesta(
              text,
            )
          : text.trim();
      } catch (error: any) {
        lastError =
          error?.response?.data
            ?.error?.message ||
          error?.message;

        this.logger.warn(
          `Modelo ${modelName} falló: ${lastError}`,
        );
      }
    }

    throw new InternalServerErrorException(
      `Gemini no disponible: ${lastError}`,
    );
  }

  // =====================================================
  // LIMPIAR JSON
  // =====================================================

  private limpiarRespuesta(
    text: string,
  ): any {
    try {
      const cleanText =
        text
          .replace(
            /```json|```/g,
            '',
          )
          .trim();

      return JSON.parse(
        cleanText,
      );
    } catch (error) {
      this.logger.error(
        'JSON inválido generado por Gemini',
        text,
      );

      throw new InternalServerErrorException(
        'La IA devolvió un JSON inválido',
      );
    }
  }

  // =====================================================
  // CONTEXTO
  // =====================================================

  private construirContexto(
    contexto: any[] = [],
  ): string {
    return contexto
      .map(
        (archivo) => `
==================================================
ARCHIVO: ${archivo.nombreArchivo}
TIPO: ${archivo.tipo}

${archivo.contenido}
==================================================
`,
      )
      .join('\n');
  }

  // =====================================================
  // USER STORIES
  // =====================================================

  async generarUserStories(
    proyecto: any,
    contexto: any[] = [],
  ) {
    const contextoTexto =
      this.construirContexto(
        contexto,
      );

    const prompt = `
Actúa como Product Owner Senior.

Analiza toda la documentación.

Proyecto:
${proyecto.nombre}

Descripción:
${proyecto.descripcion}

Contexto:

${contextoTexto}

Genera historias de usuario.

Devuelve únicamente JSON.

[
  {
    "titulo":"",
    "descripcion":"",
    "prioridad":"Alta",
    "criteriosAceptacion":[]
  }
]
`;

    return await this.llamarGemini(
      prompt,
      true,
    );
  }

  // =====================================================
  // CANÓNICA
  // =====================================================

  async seleccionarCanonica(
    historias: any[],
  ) {
    const prompt = `
Analiza estas historias.

Selecciona cuál debería utilizarse como referencia canónica para estimar el proyecto.

Devuelve únicamente JSON.

{
  "indice":0,
  "motivo":""
}

Historias:

${JSON.stringify(
      historias,
      null,
      2,
    )}
`;

    return await this.llamarGemini(
      prompt,
      true,
    );
  }

  // =====================================================
  // ESTIMAR HISTORIA
  // =====================================================

  async estimarHistoria(
    descripcion: string,
  ): Promise<number> {
    const prompt = `
Actúa como Scrum Master Senior.

Analiza la siguiente User Story.

Devuelve únicamente un número Fibonacci.

Valores permitidos:

1
2
3
5
8
13
21
34

Historia:

${descripcion}
`;

    const respuesta =
      await this.llamarGemini(
        prompt,
        false,
      );

    const numero =
      parseInt(respuesta);

    return isNaN(numero)
      ? 1
      : numero;
  }

  // =====================================================
  // ESTIMAR PROYECTO COMPLETO
  // =====================================================

  async estimarProyecto(
    historias: any[],
  ) {
    const prompt = `
Actúa como Scrum Master Senior.

Calcula estimación total.

Historias:

${JSON.stringify(
      historias,
      null,
      2,
    )}

Devuelve únicamente JSON.

{
  "totalPuntos":0,
  "sprintsEstimados":0,
  "duracionSemanas":0
}
`;

    return await this.llamarGemini(
      prompt,
      true,
    );
  }

  // =====================================================
  // PRD FINAL
  // =====================================================

  async generarPrd(
    proyecto: any,
    contexto: any[] = [],
    historias: any[] = [],
  ) {
    const contextoTexto =
      this.construirContexto(
        contexto,
      );

    const prompt = `
Actúa como Product Manager Senior.

Genera un Product Requirements Document completo.

Proyecto:
${proyecto.nombre}

Descripción:
${proyecto.descripcion}

Contexto:

${contextoTexto}

Historias aprobadas:

${JSON.stringify(
      historias,
      null,
      2,
    )}

Devuelve únicamente JSON.

{
  "titulo":"",
  "resumenEjecutivo":"",
  "objetivos":[],
  "alcance":{
    "dentro":[],
    "fuera":[]
  },
  "actores":[],
  "requisitosFuncionales":[],
  "arquitectura":[],
  "stackTecnologico":[],
  "modulos":[],
  "sprints":[]
}
`;
    return await this.llamarGemini(
      prompt,
      true,
    );
  }

  // =====================================================
  // MODELOS DISPONIBLES
  // =====================================================

  async listarModelosDisponibles() {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`;

    const { data } =
      await axios.get(url);

    return data;
  }
}