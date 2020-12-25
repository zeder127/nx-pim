import { DataObject, DataObjectFactory } from '@fluidframework/aqueduct';
import { IFluidHandle } from '@fluidframework/core-interfaces';
import { IDirectory, IDirectoryValueChanged, SharedMap } from '@fluidframework/map';
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
export class PiDataObject extends DataObject {
  private newProgramBoardId: string = window.location.hash;
  private changeSubject$ = new Subject();
  change$ = this.changeSubject$.asObservable();

  protected async initializingFirstTime() {
    this.root.createSubDirectory(Key_Pis);
    const users = SharedMap.create(this.runtime);
    this.root.set('users', users.handle);
  }

  /**
   * Create a new PI DDS.
   * @param pi model of a new PI
   */
  public createPi(pi: Pi) {
    const pisDir = this.root.getSubDirectory(Key_Pis);
    const piDir = pisDir.createSubDirectory(pi.id);
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

  /**
   * Creates a shared map with the provided id and insert it into a directory
   * @param id muss be unique
   * @param dir optional, default takes current root directory
   */
  private createSharedMapInDirectory(id: string, dir: IDirectory = this.root): void {
    const map = SharedMap.create(this.runtime);
    dir.set(id, map.handle);
  }

  protected async hasInitialized() {
    const pisDir = this.root.getSubDirectory(Key_Pis);
    if (!pisDir) {
      alert(`FluidFramework: no such subdriectory -> ${Key_Pis}`);
      console.error(`FluidFramework: no such subdriectory -> ${Key_Pis}`, this.root);
      return;
    }
    [...pisDir.subdirectories()].forEach((v, i) => {
      // const piId: string= v[0];
      const piDir: IDirectory = v[1];
      console.log(`🚀 ~ piDir index:${i}`, piDir);
      this.loadPi(piDir);
    });
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
    map.on('valueChanged', () => {
      // todo
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
        this.changeSubject$.next('valueChanged');
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
  PiDataObject,
  [SharedMap.getFactory()],
  {}
);
