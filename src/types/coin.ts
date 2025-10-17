// COIN element types for future use
export type COINElementType = 'circle' | 'participant' | 'interaction' | 'product';

export interface COINElement {
  id: string;
  type: COINElementType;
  position: { x: number; y: number };
  properties: Record<string, any>;
}

export interface COIN {
  id: string;
  name: string;
  created: Date;
  modified: Date;
  elements: COINElement[];
  metadata: {
    tags: string[];
    description?: string;
  };
}