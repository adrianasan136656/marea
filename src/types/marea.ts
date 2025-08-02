export type Sound = {
  id: string;
  label: string;
  uri: string;
};

export type Marea = {
  id: string;
  nombre: string;
  color: string;
  intensidad: number;
  descripcion?: string;
  sonidos: Sound[];
  fecha: string;
  fechaActualizada: string;
};

