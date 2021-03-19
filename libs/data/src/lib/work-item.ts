export interface WorkItem extends NewWorkItem {
  id: number;
  url: string;
  rev: number;
}

export interface NewWorkItem {
  title: string;
  type: WitType;
  tags: string[];
}

export enum WitType {
  Feature = 'Feature',
  PBI = 'Product Backlog Item',
  Enabler = 'Enabler',
  Delivery = 'Delivery',
}
