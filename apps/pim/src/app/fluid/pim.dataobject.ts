import { DataObject, DataObjectFactory } from '@fluidframework/aqueduct';
import { IFluidHandle } from '@fluidframework/core-interfaces';
import {
  IDirectory,
  IDirectoryValueChanged,
  IValueChanged,
  SharedMap,
} from '@fluidframework/map';
import { ISequencedDocumentMessage } from '@fluidframework/protocol-definitions';
import { Subject } from 'rxjs';
import { Constants } from '../shared/constants/constants';
import { Pi } from '../shared/models/pi';

const Key_Pis = 'pis';
const Key_Boards = 'boards';
const Key_Boards_Rows = 'rows';
const Key_Boards_Cols = 'cols';
const Key_Boards_Cards = 'cards';
const Key_Boards_Connectons = 'connections';

export interface BoardDDS {
  name: string;
  rows: SharedMap;
  cols: SharedMap;
  cards: SharedMap;
  connections: SharedMap;
}

// prototype, to be changes in future
export class PimDataObject extends DataObject {
  private pisChangeSubject$ = new Subject();
  pisChange$ = this.pisChangeSubject$.asObservable();
  private pisDir: IDirectory;
  public boardRefsMap = new Map<string, BoardDDS>();

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
    console.log(`🚀 ~ createPi ~ pi`, pi);
    const piDir = this.pisDir.createSubDirectory(pi.id);
    piDir.set('name', pi.name);
    piDir.set('programBoardId', pi.programBoardId);
    piDir.set('teamBoardIds', pi.teamBoardIds);

    const programBoardDir = piDir
      .createSubDirectory(Key_Boards)
      .createSubDirectory(pi.programBoardId);
    programBoardDir.set('name', Constants.Default_Programm_Board_Name);
    const rowsMap = this.createSharedMapInDirectory(Key_Boards_Rows, programBoardDir);
    const colsMap = this.createSharedMapInDirectory(Key_Boards_Cols, programBoardDir);
    const cardsMap = this.createSharedMapInDirectory(Key_Boards_Cards, programBoardDir);
    const connectionsMap = this.createSharedMapInDirectory(
      Key_Boards_Connectons,
      programBoardDir
    );

    // insert
    this.boardRefsMap.set(pi.programBoardId, {
      name: Constants.Default_Programm_Board_Name,
      rows: rowsMap,
      cols: colsMap,
      cards: cardsMap,
      connections: connectionsMap,
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
  private createSharedMapInDirectory(id: string, dir: IDirectory = this.root): SharedMap {
    const map = SharedMap.create(this.runtime);
    dir.set(id, map.handle);
    this.createEventListenersForSharedMap(map);
    return map;
  }

  private async loadPi(piDir: IDirectory) {
    const boardDirs = piDir.getSubDirectory(Key_Boards).subdirectories();
    [...boardDirs].forEach(async (v) => {
      await this.loadBoard(v[0], v[1]);
    });
  }

  private async loadBoard(id: string, boardDir: IDirectory) {
    const boardDDS: BoardDDS = {
      name: boardDir.get('name'),
      rows: await boardDir.get<IFluidHandle<SharedMap>>(Key_Boards_Rows).get(),
      cols: await boardDir.get<IFluidHandle<SharedMap>>(Key_Boards_Cols).get(),
      cards: await boardDir.get<IFluidHandle<SharedMap>>(Key_Boards_Cards).get(),
      connections: await boardDir
        .get<IFluidHandle<SharedMap>>(Key_Boards_Connectons)
        .get(),
    };

    this.createEventListenersForSharedMap(boardDDS.rows);
    this.createEventListenersForSharedMap(boardDDS.cols);
    this.createEventListenersForSharedMap(boardDDS.cards);
    this.createEventListenersForSharedMap(boardDDS.connections);

    // add in BoardRefsMap
    this.boardRefsMap.set(id, boardDDS);
  }

  /**
   * Helper function to set up event listeners for SharedMap
   */
  private createEventListenersForSharedMap(map: SharedMap) {
    map.on('valueChanged', (event: IValueChanged) => {
      console.log(`🚀 ~ PiDataObject ~ event`, event);
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
  [SharedMap.getFactory()],
  {}
);
