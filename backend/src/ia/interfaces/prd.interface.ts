export interface PrdResponse {
  titulo: string;

  resumenEjecutivo: string;

  objetivos: string[];

  alcance: {
    dentro: string[];
    fuera: string[];
  };

  actores: string[];

  requisitosFuncionales: string[];
}