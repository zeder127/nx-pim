export interface ICardBoard {
  dds?: unknown;
  id: string;
  name: string;
  columnHeaders: IColumnHeader[];
  rowHeaders: IRowHeader[];
  cards: ICard[];
  connections: IConnection[];
  matrix?: unknown;
}

interface IHeader {
  text: string;
  description: string;
  id: string;
}

export interface IColumnHeader extends IHeader {
  linkedWitId: number;
}

export interface IRowHeader extends IHeader {
  linkedIterationId: number;
}

export interface ICard {
  id?: string;
  linkedWitId: number;
  x: number;
  y: number;
  text: string;
}

export interface ICards {
  id: string;
  linkedWitId: number;
  x: number;
  y: number;
  text: string;
}

export interface IConnection {
  startPointId: string;
  endPointId: string;
}
