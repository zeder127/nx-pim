import { Injectable } from '@angular/core';
import { CardType } from '@pim/data';

@Injectable({
  providedIn: 'root',
})
export class BoardSettingsService {
  /**
   * Define the card types that should be synchronised between programm- and team-board.
   */
  public cardTypesAllowedToSync: CardType[] = [
    CardType.PBI, // TODO remove
    CardType.Enabler,
    CardType.Delivery,
    CardType.Milestone,
    CardType.Feature,
  ];
}
