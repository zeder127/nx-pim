import { DataObject, DataObjectFactory } from '@fluidframework/aqueduct';
import { IFluidHandle } from '@fluidframework/core-interfaces';
import { IDirectory, IDirectoryValueChanged, SharedMap } from '@fluidframework/map';
import { Subject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

const Key_Pi = 'pi';
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
    const piDir = this.root.createSubDirectory(Key_Pi);
    piDir.set('id', uuidv4());
    piDir.set('name', 'Your pi name');
    piDir.set('programBoardId', this.newProgramBoardId);
    piDir.set('teamBoardIds', []);

    const programBoardDir = piDir
      .createSubDirectory(Key_Boards)
      .createSubDirectory(this.newProgramBoardId);
    programBoardDir.set('name', 'Program Board');
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
    const boardDirPath = Key_Pi + '/' + Key_Boards + '/' + this.newProgramBoardId;
    const boardDir = this.root.getWorkingDirectory(boardDirPath);

    this.createEventListeners(boardDir);

    //boardDir.set('name', new Date().toString());
    const rowsMap = await boardDir.get<IFluidHandle<SharedMap>>(Key_Boards_Rows).get();
    rowsMap.on('valueChanged', (event) => {
      console.log('valuechanged', event);
    });
    const tempId = new Date().getTime().toString();
    rowsMap.set(tempId, { id: tempId });
  }

  /**
   * Helper function to set up event listeners for shared objects
   */
  private createEventListeners(dir: IDirectory): void {
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
