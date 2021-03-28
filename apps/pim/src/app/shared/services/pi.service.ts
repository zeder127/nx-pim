import { Injectable } from '@angular/core';
import {
  CardBoardDDS,
  Constants,
  ICardBoard,
  ICardBoardBase,
  IColumnHeader,
  IRowHeader,
  Pi,
} from '@pim/data';
import { createCardBoardModel } from '@pim/data/util';
import { from, Observable, of } from 'rxjs';
import { delay, filter, map, switchMap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { PimDataObjectRefService } from './data-object-ref.service';

/**
 * Apdapter between UI and DataObject
 */
@Injectable({
  providedIn: 'root',
})
export class PiService {
  private pisObservable: Observable<Pi[]>;

  constructor(private pimDORef: PimDataObjectRefService) {}

  /**
   * Get all PIs asychronlly. Used to get PIs, if DataObject has not been loaded.
   * @param reload boolean. If true, Pis will reloaded from PimDataObject
   */
  public getPisAsync(reload = false): Observable<Pi[]> {
    if (!this.pisObservable || reload) {
      this.pisObservable = this.doGetPisAsync();
    }
    return this.pisObservable;
  }

  /**
   * Get all PIs directly from current DataObject.
   */
  public getPis() {
    if (!this.pimDORef.instance) {
      throw 'DataObject war null! FluidFramework went something wrong, please check the connection to the Fluid server.';
    }
    return this.pimDORef.instance.getPis();
  }
  /**
   * Get PI by its name.
   */
  public getPiByName(name: string, isNew = false): Observable<Pi> {
    return this.getPisAsync(isNew).pipe(map((pis) => pis.find((pi) => pi.name === name)));
  }

  /**
   * Get ProgramBoard definition of the PI by a given PI name.
   * @param piName Name of a PI
   */
  public getProgramBoardOfPI(piName: string): Observable<CardBoardDDS> {
    return this.getPiByName(piName).pipe(
      filter((pi) => !!pi),
      map((pi) => {
        return this.pimDORef.instance.boardRefsMap.get(pi.programBoardId);
      })
    );
  }

  /**
   * Get a board definition of a given team in a given PI.
   * @param piName id of a PI
   * @param teamName name of a team
   */
  public getTeamBoardOfPI(piName: string, teamName: string): Observable<CardBoardDDS> {
    return this.getPiByName(piName).pipe(
      map((pi) => {
        const boardId = pi.teamBoardIds.find(
          (id) => this.getBoardById(id)?.name === teamName
        );
        return this.getBoardById(boardId);
      })
    );
  }

  /**
   * Get base infos of boards in a certain Pi
   * @param piName
   * @returns
   */
  public getBoardBasesOfPI(piName: string): Observable<ICardBoardBase[]> {
    return from(this.pimDORef.getInstanceAsync()).pipe(
      map((pimDO) => pimDO.getBoardBasesOfPI(piName))
    );
  }

  /**
   * Get Board definitions from PI DataObject.
   * @param id id of a board
   */
  public getBoardById(id: string): CardBoardDDS {
    return this.pimDORef.instance.boardRefsMap.get(id);
  }
  /**
   * Create a new PI DDS
   * @param name name of a new PI, this name muss be unique
   */
  public createPi(
    name: string,
    rowHeaders: IRowHeader[],
    columnHeaders: IColumnHeader[]
  ) {
    if (this.getPis()?.some((pi) => pi.name === name)) {
      alert(`Name exists already, please enter another name.`);
      return;
    }

    const newProgramBoard: ICardBoard = createCardBoardModel(
      Constants.Default_Program_Board_Name,
      rowHeaders,
      columnHeaders
    );
    // Every columnHeader represents a team, every team should have its own TeamBoard.
    // A new TeamBoard has the same rows(iterations) as ProgramBoard, but only has a placeholder column.
    // Every team could add his own columns individually with UI.
    const newTeamBoards: ICardBoard[] = columnHeaders?.map((columnHeader) => {
      return createCardBoardModel(columnHeader.title, rowHeaders);
    });

    this.pimDORef.instance.createPi({
      id: uuidv4(),
      name: name,
      teamBoardIds: newTeamBoards.map((board) => board.id),
      programBoardId: newProgramBoard.id,
      programBoard: newProgramBoard,
      teamBoards: newTeamBoards,
    });
  }

  /**
   * Remove a PI by the given id
   * @param piId
   */
  public remove(piId: string) {
    this.pimDORef.instance.removePi(piId);
  }

  private doGetPisAsync(): Observable<Pi[]> {
    return from(this.pimDORef.getInstanceAsync()).pipe(
      delay(0), // work-around to wait for resolve of all promises while loading DataObject
      switchMap((pim) => {
        return of(pim.getPis());
      })
    );
  }
}
