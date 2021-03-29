import { CardType, WitType, WorkItem } from '@pim/data';

export function getWitTypeClass(wit: WorkItem): string {
  switch (wit.type) {
    case WitType.Feature:
      return 'feature';
      break;
    case WitType.PBI:
      return 'pbi';
      break;
  }
}

export function getColorByType(type: CardType) {
  switch (type) {
    case CardType.Delivery:
      return '#fbbc3d';
    case CardType.Enabler:
      return '#7ace64';
    case CardType.Feature:
      return '#773b93';
    case CardType.Milestone:
      return '#ec001d';
    default:
      return '#009ccc';
  }
}
