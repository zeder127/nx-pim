import { v4 as uuidv4 } from 'uuid';
import { CardType, ICard, ICardBoard, IColumnHeader, IRowHeader } from '../card-board';
import { Constants } from '../constants';
import { WorkItem } from '../work-item';

export function toCard(wit: WorkItem): ICard {
  return {
    text: wit.title,
    linkedWitId: wit.id,
    type: toCardType(wit),
    x: undefined,
    y: undefined,
  } as ICard;
}

function toCardType(wit: WorkItem): CardType {
  if (wit.type === 'Feature') {
    return CardType.Feature;
  } else {
    return getCardTypeFromTags(wit.tags); // Type 'Product Backlog Item' as default
  }
}

function getCardTypeFromTags(tags: string[]): CardType {
  // TODO Setting: tag to CardType
  if (!tags) return CardType.PBI;
  if (tags.some((tag) => tag.toLocaleLowerCase() === CardType.Delivery))
    return CardType.Delivery;
  if (tags.some((tag) => tag.toLocaleLowerCase() === CardType.Enabler))
    return CardType.Enabler;
  if (tags.some((tag) => tag.toLocaleLowerCase() === CardType.Milestone))
    return CardType.Milestone;
  return CardType.PBI;
}

export const PlaceholderRow: IRowHeader = {
  linkedIterationId: undefined,
  title: Constants.Default_Row_Text,
};

export const PlaceholderColumn: IColumnHeader = {
  linkedSourceId: undefined,
  title: Constants.Default_Column_Text,
};

export function createCardBoardModel(
  name: string,
  rowHeaders = [PlaceholderRow],
  columnHeaders = [PlaceholderColumn]
): ICardBoard {
  const id = uuidv4();
  return {
    id,
    name: name ?? `${Constants.Default_Board_Name}_${id}`,
    columnHeaders,
    rowHeaders,
    cards: [],
    connections: [],
  };
}

export function enumToArray(eInst, valueType: 'string' | 'number' = 'string') {
  const keys = Object.keys(eInst).filter((k) => typeof eInst[k] === valueType);
  return keys.map((k) => eInst[k]);
}
