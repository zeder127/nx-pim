export interface CardBoard {
  id: string;
  name: string;
  columnHeaders: ColumnHeader[];
  rowHeaders: RowHeader[];
  cards: Card[];
  connections: Connection[];
}

interface Header {
  text: string;
  description: string;
  id: string;
}

export interface ColumnHeader extends Header {
  linkedWitId: number;
}

export interface RowHeader extends Header {
  linkedIterationId: number;
}

export interface Card {
  id?: string; // should be required
  linkedWitId: number;
  x: number;
  y: number;
  text: string;
}

export interface Connection {
  startPointId: string;
  endPointId: string;
}
