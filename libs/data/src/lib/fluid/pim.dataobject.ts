import { DataObject, DataObjectFactory } from '@fluidframework/aqueduct';
import { IFluidHandle } from '@fluidframework/core-interfaces';
import { IDirectory, IDirectoryValueChanged, SharedMap } from '@fluidframework/map';
import { SharedMatrix } from '@fluidframework/matrix';
import { ISequencedDocumentMessage } from '@fluidframework/protocol-definitions';
import { SequenceDeltaEvent, SharedObjectSequence } from '@fluidframework/sequence';
import { ICard, IColumnHeader, IConnection, IRowHeader } from '@pim/data';
import { Subject } from 'rxjs';
import { CardBoard } from '../card-board';
import { Constants } from '../constants';
import { Pi } from '../pi';
import { DemoBoard } from './demoBoard';
import { PimDataObjectHelper } from './helper';

const Key_Pis = 'pis';
const Key_Boards = 'boards';
const Key_Boards_Rows = 'rows';
const Key_Boards_Cols = 'cols';
const Key_Boards_Cards = 'cards';
const Key_Boards_Connectons = 'connections';

// prototype, to be changes in future
export class PimDataObject extends DataObject {
  private pisChangeSubject$ = new Subject();
  pisChange$ = this.pisChangeSubject$.asObservable();
  private pisDir: IDirectory;
  public boardRefsMap = new Map<string, CardBoard>();

  protected async initializingFirstTime() {
    this.root.createSubDirectory(Key_Pis);
    const users = SharedMap.create(this.runtime);
    this.root.set('users', users.handle);
  }

  protected async hasInitialized() {
    this.pisDir = this.root.getSubDirectory(Key_Pis);
    if (!this.pisDir) {
      alert(`FluidFramework: no such subdriectory -> ${Key_Pis}`);
      console.error(`FluidFramework: no such subdriectory -> ${Key_Pis}`, this.root);
      return;
    }
    [...this.pisDir.subdirectories()].forEach(async (v) => {
      await this.loadPi(v[1]);
    });

    this.root.on('valueChanged', (changed: IDirectoryValueChanged) => {
      const result = [...this.pisDir.subdirectories()].find(
        (v) => v[1].absolutePath === changed.path
      );
      if (result) {
        this.pisChangeSubject$.next();
        return;
      }
    });

    // work around for listening deleteSubDirectory event
    this.root.on('op', (message: ISequencedDocumentMessage) => {
      if (
        message.contents.type === 'deleteSubDirectory' &&
        message.contents.path === `/${Key_Pis}`
      ) {
        this.pisChangeSubject$.next();
      }
    });
  }

  /**
   * Create a new PI DDS.
   * @param pi model of a new PI
   */
  public createPi(pi: Pi) {
    const piDir = this.pisDir.createSubDirectory(pi.id);
    piDir.set('name', pi.name);
    piDir.set('programBoardId', pi.programBoardId);
    piDir.set('teamBoardIds', pi.teamBoardIds);

    const programBoardDir = piDir
      .createSubDirectory(Key_Boards)
      .createSubDirectory(pi.programBoardId);
    programBoardDir.set('name', Constants.Default_Programm_Board_Name);
    const rowsSequence = this.createSequenceInDirectory<IRowHeader>(
      Key_Boards_Rows,
      programBoardDir
    );
    const colsSequence = this.createSequenceInDirectory<IColumnHeader>(
      Key_Boards_Cols,
      programBoardDir
    );
    const connectionsSequence = this.createSequenceInDirectory<IConnection>(
      Key_Boards_Connectons,
      programBoardDir
    );
    let cardsMatrix = this.createMatrixInDirectory(Key_Boards_Cards, programBoardDir);

    // insert initial data
    rowsSequence.insert(0, DemoBoard.rowHeaders);
    colsSequence.insert(0, DemoBoard.columnHeaders);
    connectionsSequence.insert(0, DemoBoard.connections);
    cardsMatrix = PimDataObjectHelper.initialMatrixWithValue(
      this.runtime,
      cardsMatrix,
      DemoBoard.cards
    );

    // insert this new board into Map
    this.boardRefsMap.set(pi.programBoardId, {
      id: pi.programBoardId,
      name: Constants.Default_Programm_Board_Name,
      rowHeaders: rowsSequence,
      columnHeaders: colsSequence,
      cells: cardsMatrix,
      connections: connectionsSequence,
    });
  }

  public removePi(id: string) {
    // todo: remove from boardDDS
    this.pisDir.deleteSubDirectory(id);
  }

  public getPis(): Pi[] {
    return [...this.pisDir.subdirectories()].map((v) => {
      const piId = v[0];
      const piDir = v[1];
      return {
        id: piId,
        name: piDir.get('name'),
        programBoardId: piDir.get('programBoardId'),
        teamBoardIds: piDir.get('teamBoardIds'),
      };
    });
  }

  /**
   * Creates a shared map with the provided id and insert it into a directory
   * @param id muss be unique
   * @param dir optional, default takes current root directory
   */
  private createSequenceInDirectory<T>(
    id: string,
    dir: IDirectory = this.root
  ): SharedObjectSequence<T> {
    const sequence = SharedObjectSequence.create<T>(this.runtime);
    dir.set(id, sequence.handle);
    this.createEventListenersForSequence(sequence);
    return sequence;
  }

  private createMatrixInDirectory(
    id: string,
    dir: IDirectory = this.root
  ): SharedMatrix<IFluidHandle<SharedObjectSequence<ICard>>> {
    const matrix = SharedMatrix.create<IFluidHandle<SharedObjectSequence<ICard>>>(
      this.runtime
    );
    dir.set(id, matrix.handle);
    // this.createEventListenersForSequence(matrix);
    return matrix;
  }

  private async loadPi(piDir: IDirectory) {
    const boardDirs = piDir.getSubDirectory(Key_Boards).subdirectories();
    [...boardDirs].forEach(async (v) => {
      await this.loadBoard(v[0], v[1]);
    });
  }

  private async loadBoard(id: string, boardDir: IDirectory) {
    const [rows, cols, matrix, connections] = await Promise.all([
      await boardDir
        .get<IFluidHandle<SharedObjectSequence<IRowHeader>>>(Key_Boards_Rows)
        .get(),
      await boardDir
        .get<IFluidHandle<SharedObjectSequence<IColumnHeader>>>(Key_Boards_Cols)
        .get(),
      await boardDir
        .get<IFluidHandle<SharedMatrix<IFluidHandle<SharedObjectSequence<ICard>>>>>(
          Key_Boards_Cards
        )
        .get(),
      await boardDir
        .get<IFluidHandle<SharedObjectSequence<IConnection>>>(Key_Boards_Connectons)
        .get(),
    ]);

    const cardBoardTmp: CardBoard = {
      id: id,
      name: boardDir.get('name'),
      rowHeaders: rows,
      columnHeaders: cols,
      cells: matrix,
      connections: connections,
    };

    // this.createEventListenersForSequence(boardDDS.rows);
    // this.createEventListenersForSequence(boardDDS.cols);
    // this.createEventListenersForSequence(boardDDS.cards);
    // this.createEventListenersForSequence(boardDDS.connections);

    // add in BoardRefsMap
    this.boardRefsMap.set(id, cardBoardTmp);
  }

  /**
   * Helper function to set up event listeners for SharedObjectSequence
   */
  private createEventListenersForSequence<T>(sequence: SharedObjectSequence<T>) {
    sequence.on('sequenceDelta', (event: SequenceDeltaEvent) => {
      console.log(`🚀 ~ PiDataObject ~ SequenceDeltaEvent`, event);
      console.log(`🚀 ~ PiDataObject ~ sequence.id`, sequence.id);
    });
  }

  /**
   * Helper function to set up event listeners for SharedDirectory
   */
  private createEventListenersForDirectory(dir: IDirectory): void {
    // Set up an event listener for changes to values in the SharedMap
    this.root.on('valueChanged', (changed: IDirectoryValueChanged) => {
      if (changed.path === dir.absolutePath) {
        const newValue = dir.get(changed.key);
        console.log(newValue);
        // this.changeSubject$.next('valueChanged');
      }
    });

    // //Set up an event listener for clearing the data in a SharedMap
    // sharedMap.on('clear', () => {
    //   this.changeSubject$.next('clear');
    // });

    // const quorum = this.context.getQuorum();
    // quorum.on('addMember', () => {
    //   this.changeSubject$.next('addMember');
    // });

    // quorum.on('removeMember', () => {
    //   this.changeSubject$.next('removeMember');
    // });
  }
}

export const PiInstantiationFactory = new DataObjectFactory(
  'PiDataObject',
  PimDataObject,
  [SharedObjectSequence.getFactory(), SharedMatrix.getFactory()],
  {}
);
