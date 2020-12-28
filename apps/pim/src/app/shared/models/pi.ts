import { CardBoard } from '@pim/data';

export interface Pi {
  id: string;
  name: string;
  programBoardId: string;
  teamBoardIds: string[];
}

export interface PiWithDetails extends Pi {
  programBoard: CardBoard;
  teamBoards: CardBoard[];
}

export interface PiChange {
  /**
   * id of PI
   */
  id: string;
  /**
   * key of property that has been changed
   */
  key: string;
  /**
   * new value after change
   */
  value: unknown;
}
