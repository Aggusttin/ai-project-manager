import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenEstimatorTool {
  estimarTokens(
    texto: string,
  ): number {
    return Math.ceil(
      texto.length / 4,
    );
  }
}