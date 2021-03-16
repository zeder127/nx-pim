import { CardType, WorkItem } from '@pim/data';

export function getWitTypeClass(wit: WorkItem): string {
  switch (wit.type) {
    case 'Feature':
      return 'feature';
      break;
    case 'Product Backlog Item':
      return 'pbi';
      break;
  }
}

export function getBorderLeftColor(type: CardType) {
  // TODO Setting: CardType Color
  switch (type) {
    case CardType.Delivery:
      return '#fbbc3d';
    case CardType.Enabler:
      return '#7ace64';
    case CardType.Feature:
      return '#602f70';
    case CardType.Milestone:
      return '#ec001d';
    default:
      return '#009ccc';
  }
}
