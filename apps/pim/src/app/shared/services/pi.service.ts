import { Injectable } from '@angular/core';
import {
  CardBoardDDS,
  Constants,
  ICardBoard,
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
   */
  public getPisAsync(): Observable<Pi[]> {
    if (!this.pisObservable) {
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
  public getPiByName(name: string): Observable<Pi> {
    return this.getPisAsync().pipe(map((pis) => pis.find((pi) => pi.name === name)));
  }

  /**
   * Get ProgrammBoard definition of the PI by a given PI name.
   * @param piName Name of a PI
   */
  public getProgrammBoardOfPI(piName: string): Observable<CardBoardDDS> {
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

    const newProgrammBoard: ICardBoard = createCardBoardModel(
      Constants.Default_Programm_Board_Name,
      rowHeaders,
      columnHeaders
    );
    // Every columnHeader represents a team, every team has a TeamBoard.
    // A new TeamBoard has the same rows(iterations) as ProgrammBoard,
    // but only has a demo column. Every team could add his own columns individually with UI.
    const newTeamBoards: ICardBoard[] = columnHeaders?.map((columnHeader) => {
      return createCardBoardModel(columnHeader.text, rowHeaders);
    });

    this.pimDORef.instance.createPi({
      id: uuidv4(),
      name: name,
      teamBoardIds: newTeamBoards.map((board) => board.id),
      programBoardId: newProgrammBoard.id,
      programBoard: newProgrammBoard,
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
