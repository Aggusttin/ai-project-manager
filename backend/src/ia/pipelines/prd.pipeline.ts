export class PrdPipeline {
  static construirContexto(
    proyecto: any,
    recursos: string[],
  ): string {
    return `
Proyecto:
${proyecto.nombre}

Descripción:
${proyecto.descripcion}

Recursos:
${recursos.join('\n')}
`;
  }
}