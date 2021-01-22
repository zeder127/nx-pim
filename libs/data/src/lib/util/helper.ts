import { CardType, ICard } from '../card-board';
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
