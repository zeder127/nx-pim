import { ICard, ICardBoard, IColumnHeader, IConnection, IRowHeader } from '@pim/data';
import { v4 as uuidv4 } from 'uuid';
import { Constants } from '../../constants';

export class CardBoard implements ICardBoard {
  id: string;
  name: string;
  columnHeaders: IColumnHeader[];
  rowHeaders: IRowHeader[];
  cards: ICard[];
  connections: IConnection[];

  constructor(cardBoard: ICardBoard) {
    this.id = cardBoard.id ?? uuidv4();
    this.name = cardBoard.name ?? Constants.Default_Card_Name;
    this.cards = cardBoard.cards ?? [];
    this.columnHeaders = cardBoard.columnHeaders ?? [];
    this.rowHeaders = cardBoard.rowHeaders ?? [];
    this.connections = cardBoard.connections ?? [];
  }

  public insertCard() {
    //
  }
}
