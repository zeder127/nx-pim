import { IFluidHandle } from '@fluidframework/core-interfaces';
import { SharedMatrix } from '@fluidframework/matrix';
import { SharedObjectSequence } from '@fluidframework/sequence';

// TODO to remove
export interface ICardBoard {
  id: string;
  name: string;
  columnHeaders: IColumnHeader[];
  rowHeaders: IRowHeader[];
  cards: ICard[];
  connections: IConnection[];
}

export interface CardBoard {
  id: string;
  name: string;
  columnHeaders: SharedObjectSequence<IColumnHeader>;
  rowHeaders: SharedObjectSequence<IRowHeader>;
  cells: SharedMatrix<IFluidHandle<SharedObjectSequence<ICard>>>;
  connections: SharedObjectSequence<IConnection>;
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

// TODO remove Cell extension
export interface ICard extends Cell {
  id?: string;
  linkedWitId: number;
  text: string;
}

/**
 * Interface for SpecMap
 */
export interface SpecMapItem extends Cell {
  id: number;
  text: string;
  description: string;
}

export interface IConnection {
  startPointId: string;
  endPointId: string;
}

export interface Cell {
  x: number;
  y: number;
}
