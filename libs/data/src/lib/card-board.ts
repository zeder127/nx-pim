import { IFluidHandle } from '@fluidframework/core-interfaces';
import { IFluidDataStoreRuntime } from '@fluidframework/datastore-definitions';
import { SharedMap } from '@fluidframework/map';
import { SharedMatrix } from '@fluidframework/matrix';
import { SharedObjectSequence } from '@fluidframework/sequence';

export interface ICardBoard {
  id: string;
  name: string;
  columnHeaders: IColumnHeader[];
  rowHeaders: IRowHeader[];
  cards: ICard[];
  connections: IConnection[];
}

export interface CardBoardDDS {
  id: string;
  name: string;
  columnHeaders: SharedObjectSequence<IColumnHeader>;
  rowHeaders: SharedObjectSequence<IRowHeader>;
  grid: SharedMatrix<IFluidHandle<SharedObjectSequence<ICard>>>;
  connections: SharedMap;
  coworkers: SharedMap;
  runtime: IFluidDataStoreRuntime;
}

interface IHeader {
  title: string;
  description?: string;
}

export interface IColumnHeader extends IHeader {
  linkedSourceId: string | number;
}

export interface IRowHeader extends IHeader {
  linkedIterationId: string;
}

// TODO remove Cell extension
export interface ICard extends Cell {
  id?: string;
  linkedWitId: number;
  text: string;
  type: CardType;
}

export enum CardType {
  Feature = 'feature',
  Enabler = 'enabler',
  Delivery = 'delivery',
  Milestone = 'milestone',
  PBI = 'pbi',
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

export enum SyncType {
  Insert = 'insert',
  Remove = 'remove',
  Move = 'move', // TODO useless?
  ValueChange = 'valueChange',
}

export interface SyncEvent {
  type: SyncType;
  cards: ICard[];
  linkedIterationId: string;
  linkedSourceId: string | number;
}

export interface SyncInsertEvent extends SyncEvent {
  type: SyncType.Insert;
}

export interface SyncRemoveEvent extends SyncEvent {
  type: SyncType.Remove;
}
