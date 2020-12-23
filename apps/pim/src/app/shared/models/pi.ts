import { CardBoard } from '@pim/data';

export interface Pi {
  id: string;
  name: string;
  programBoardId: string;
  teamBoardIds: string[];

  // properties evaluated at runtime
  programBoard?: CardBoard;
  teamBoards?: CardBoard[];
}
