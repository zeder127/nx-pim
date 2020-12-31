import { ICard, ICardBoard, IColumnHeader, IConnection, IRowHeader } from '@pim/data';
import { v4 as uuidv4 } from 'uuid';

export class CardBoard implements ICardBoard {
  id: string;
  name: string;
  columnHeaders: IColumnHeader[];
  rowHeaders: IRowHeader[];
  cards: ICard[];
  connections: IConnection[];

  constructor(cardBoard: ICardBoard) {
    this.id = cardBoard.id ?? uuidv4();
    this.name = cardBoard.name ?? 'New Board';
    this.cards = cardBoard.cards ?? [];
    this.columnHeaders = cardBoard.columnHeaders ?? [];
    this.rowHeaders = cardBoard.rowHeaders ?? [];
    this.connections = cardBoard.connections ?? [];
  }

  public insertCard() {}
}
