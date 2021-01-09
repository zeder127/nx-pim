import { IFluidHandle } from '@fluidframework/core-interfaces';
import { IFluidDataStoreRuntime } from '@fluidframework/datastore-definitions';
import { SharedMatrix } from '@fluidframework/matrix';
import { SequenceDeltaEvent, SharedObjectSequence } from '@fluidframework/sequence';
import { ICard } from '../card-board';

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
    cells: ICard[]
  ): SharedMatrix<IFluidHandle<SharedObjectSequence<ICard>>> {
    const { rowSize, colSize } = this.getRowAndColSize(cells);
    matrix.insertRows(0, rowSize);
    matrix.insertCols(0, colSize);
    for (let rowIndex = 0; rowIndex < rowSize; rowIndex++) {
      for (let colIndex = 0; colIndex < colSize; colIndex++) {
        const newSeq = SharedObjectSequence.create<ICard>(runtime);
        const cardsForCell = cells.filter(
          (c) => c.y === rowIndex + 1 && c.x === colIndex + 1 // x, y start with 1
        );
        if (cardsForCell.length > 0) {
          newSeq.insert(0, cardsForCell);
        }
        matrix.setCell(
          rowIndex,
          colIndex,
          newSeq.handle as IFluidHandle<SharedObjectSequence<ICard>>
        );
      }
    }
    return matrix;
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
