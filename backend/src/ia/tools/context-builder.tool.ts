import { Injectable } from '@nestjs/common';

@Injectable()
export class ContextBuilderTool {
  compactarTexto(
    textos: string[],
    maxChars = 50000,
  ): string {
    const combinado =
      textos.join('\n\n');

    if (
      combinado.length <= maxChars
    ) {
      return combinado;
    }

    return combinado.substring(
      0,
      maxChars,
    );
  }
}