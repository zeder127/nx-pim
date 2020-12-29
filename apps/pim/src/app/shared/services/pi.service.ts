import { Injectable } from '@angular/core';
import { ICardBoard } from '@pim/data';
import { from, Observable, of } from 'rxjs';
import { delay, filter, map, switchMap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { PimDataObjectRefService } from '../../fluid/data-object-ref.service';
import { Pi } from '../models/pi';
import { IterationService } from './iteration.service';
import { TeamService } from './team.service';

// const piconfig: PiConfiguration = {
//   id: '111222334455',
//   name: 'demo pi',
//   teamIds: [
//     'adc65352-4bef-4702-9e13-b819b3a34ead',
//     '52f0bcb4-7117-4370-b1c1-0ffa9a54295b',
//     '66e85cef-d37b-481f-b966-5f8af51d8df2'
//   ],
//   iterationIds: [
//     '479afcc4-d6d5-489b-8857-5e729b25283f',
//     '0e0c20f8-3ca4-4fe6-9891-0376eba8802f',
//     '5f167e8b-8acc-4263-89f3-67cc92e11323',
//     '4ef05253-3a92-4659-aceb-0270affe8c26',
//     '4ee23779-9e43-422a-b24e-10a99f6bc988'
//   ],
//   witIds: []
// }

/**
 * Apdapter between UI and DataObject
 */
@Injectable({
  providedIn: 'root',
})
export class PiService {
  constructor(
    private teamService: TeamService,
    private iterationService: IterationService,
    private pimDORef: PimDataObjectRefService
  ) {}

  // getPiConfiguration(id: string): Observable<PiConfiguration> {
  //   return of(piconfig).pipe(
  //     switchMap(() => forkJoin([this.teamService.getAll(), this.iterationService.getAll()])),
  //     map(value => {
  //       piconfig.teams = value[0].filter(team => piconfig.teamIds.includes(team.id));
  //       piconfig.iterations = value[1].filter(iteration => piconfig.iterationIds.includes(iteration.id));
  //       return piconfig;
  //     })
  //   );
  // }
  /**
   * Get all PIs asychronlly. Used to get PIs, if DataObject has not been loaded.
   */
  public getPisAsync(): Observable<Pi[]> {
    return from(this.pimDORef.getInstanceAsync()).pipe(
      delay(0), // work-around to wait for resolve of all promises while loading DataObject
      switchMap((pim) => {
        return of(pim.getPis());
      })
    );
  }

  /**
   * Get all PIs directly from current DataObject.
   */
  public getPis() {
    return this.pimDORef.instance.getPis();
  }
  /**
   * Get PI by its name.
   */
  public getPiByName(name: string): Observable<Pi> {
    return this.getPisAsync().pipe(map((pis) => pis.find((pi) => pi.name === name)));
  }

  /**
   * Get ProgrammBoard definition of the PI by a given PI name. Convert internally DDS to UI model.
   * @param name Name of a PI
   */
  public getProgrammBoardOfPI(name: string): Observable<ICardBoard> {
    return this.getPiByName(name).pipe(
      filter((pi) => !!pi),
      map((pi) => {
        return this.toCardBoard(pi.programBoardId, true);
      })
    );
  }
  //temp
  public toCardBoard(boardId: string, withDDS = false): ICardBoard {
    const boardDDS = this.pimDORef.instance.boardRefsMap.get(boardId);
    if (!boardDDS) return null;
    const cardBoard: ICardBoard = {
      id: boardId,
      name: boardDDS.name,
      rowHeaders: boardDDS.rows.getRange(0),
      columnHeaders: boardDDS.cols.getRange(0),
      cards: boardDDS.cards.getRange(0),
      connections: boardDDS.connections.getRange(0),
    };
    if (withDDS) {
      cardBoard.dds = boardDDS;
    }
    return cardBoard;
  }

  public createPi(newPiName: string) {
    if (this.getPis()?.some((pi) => pi.name === newPiName)) {
      alert(`Name exists already, please enter another name.`);
      return;
    }
    this.pimDORef.instance.createPi({
      id: uuidv4(),
      name: newPiName,
      teamBoardIds: [],
      programBoardId: uuidv4(),
    });
  }

  public remove(piId: string) {
    this.pimDORef.instance.removePi(piId);
  }
}
