import { IFluidHandle } from '@fluidframework/core-interfaces';
import { IFluidDataStoreRuntime } from '@fluidframework/datastore-definitions';
import { SharedMatrix } from '@fluidframework/matrix';
import { SequenceDeltaEvent, SharedObjectSequence } from '@fluidframework/sequence';
import { ICard, ICardBoard } from '../card-board';

export class PimDataObjectHelper {
  /**
   * Initialize a SharedMatrix with the given value and set rowCount and colCount.
   * @param runtime current fluid runtime object
   * @param matrix SharedMatrix to be initialized
   * @param cells array of source value
   */
  public static initialMatrixWithValue(
    runtime: IFluidDataStoreRuntime,
    matrix: SharedMatrix<IFluidHandle<SharedObjectSequence<ICard>>>,
    board: ICardBoard
  ): SharedMatrix<IFluidHandle<SharedObjectSequence<ICard>>> {
    const rowSize = board.rowHeaders.length;
    const colSize = board.columnHeaders.length;
    matrix.insertRows(0, rowSize);
    matrix.insertCols(0, colSize);
    for (let rowIndex = 0; rowIndex < rowSize; rowIndex++) {
      for (let colIndex = 0; colIndex < colSize; colIndex++) {
        const cardsForCell = board.cards.filter(
          (c) => c.y === rowIndex + 1 && c.x === colIndex + 1 // x, y start with 1
        );
        PimDataObjectHelper.initialCellWithValue(
          runtime,
          matrix,
          rowIndex,
          colIndex,
          cardsForCell
        );
      }
    }
    return matrix;
  }

  private static initialCellWithValue(
    runtime: IFluidDataStoreRuntime,
    matrix: SharedMatrix<IFluidHandle<SharedObjectSequence<ICard>>>,
    rowIndex: number,
    colIndex: number,
    cards?: ICard[]
  ) {
    const newSeq = SharedObjectSequence.create<ICard>(runtime);

    if (cards?.length > 0) {
      newSeq.insert(0, cards);
    }
    matrix.setCell(
      rowIndex,
      colIndex,
      newSeq.handle as IFluidHandle<SharedObjectSequence<ICard>>
    );
  }

  public static getRowAndColSize(cells: ICard[]): { rowSize: number; colSize: number } {
    let rowSize = 0;
    let colSize = 0;
    cells.forEach((c) => {
      if (c.y > rowSize) rowSize = c.y;
      if (c.x > colSize) colSize = c.x;
    });
    return { rowSize, colSize };
  }

  public static getItemsFromSequenceDeltaEvent<T>(event: SequenceDeltaEvent): T[] {
    let items: T[] = [];
    event.deltaArgs.deltaSegments.forEach((deltaSeg) => {
      const tArray: T[] = deltaSeg.segment.toJSONObject().items;
      items = items.concat(tArray);
    });
    return items;
  }
}
