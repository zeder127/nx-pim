import { DataObject, DataObjectFactory } from '@fluidframework/aqueduct';
import { IFluidHandle } from '@fluidframework/core-interfaces';
import { IDirectory, IDirectoryValueChanged, SharedMap } from '@fluidframework/map';
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

// prototype, to be changes in future
export class PimDataObject extends DataObject {
  private pisChangeSubject$ = new Subject();
  pisChange$ = this.pisChangeSubject$.asObservable();
  private pisDir: IDirectory;

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
    [...this.pisDir.subdirectories()].forEach((v) => {
      this.loadPi(v[1]);
    });

    this.root.on('valueChanged', (changed: IDirectoryValueChanged) => {
      const result = [...this.pisDir.subdirectories()].find(
        (v) => v[1].absolutePath === changed.path
      );
      if (result) {
        this.pisChangeSubject$.next();
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
    this.createSharedMapInDirectory(Key_Boards_Rows, programBoardDir);
    this.createSharedMapInDirectory(Key_Boards_Cols, programBoardDir);
    this.createSharedMapInDirectory(Key_Boards_Cards, programBoardDir);
    this.createSharedMapInDirectory(Key_Boards_Connectons, programBoardDir);
  }

  public removePi(id: string) {
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
  private createSharedMapInDirectory(id: string, dir: IDirectory = this.root): void {
    const map = SharedMap.create(this.runtime);
    dir.set(id, map.handle);

    this.createEventListenersForSharedMap(map);
  }

  private loadPi(piDir: IDirectory) {
    const boardDirs = piDir.getSubDirectory(Key_Boards).subdirectories();
    [...boardDirs].forEach((v, i) => {
      // const boardId: string= v[0];
      const boardDir: IDirectory = v[1];
      console.log(`🚀 ~ boardDir index: ${i}`, boardDir);
      this.loadBoard(boardDir);
    });
  }

  private async loadBoard(boardDir: IDirectory) {
    const rowsMap = await boardDir.get<IFluidHandle<SharedMap>>(Key_Boards_Rows).get();
    const colsMap = await boardDir.get<IFluidHandle<SharedMap>>(Key_Boards_Cols).get();
    const cardsMap = await boardDir.get<IFluidHandle<SharedMap>>(Key_Boards_Cards).get();
    const connectionsMap = await boardDir
      .get<IFluidHandle<SharedMap>>(Key_Boards_Connectons)
      .get();

    this.createEventListenersForSharedMap(rowsMap);
    this.createEventListenersForSharedMap(colsMap);
    this.createEventListenersForSharedMap(cardsMap);
    this.createEventListenersForSharedMap(connectionsMap);
  }

  /**
   * Helper function to set up event listeners for SharedMap
   */
  private createEventListenersForSharedMap(map: SharedMap) {
    map.on('valueChanged', (event) => {
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
