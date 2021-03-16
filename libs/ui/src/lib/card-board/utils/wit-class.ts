import { WorkItem } from '@pim/data';

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
