import { Injectable } from '@nestjs/common';

@Injectable()
export class ContextBuilderPipeline {
  construirContexto(
    recursos: {
      nombreArchivo: string;
      contenido: string;
      tipo: string;
    }[],
  ): string {
    return recursos
      .map(
        (r) => `
==========================
ARCHIVO: ${r.nombreArchivo}
TIPO: ${r.tipo}
==========================

${r.contenido}
`,
      )
      .join('\n');
  }
}