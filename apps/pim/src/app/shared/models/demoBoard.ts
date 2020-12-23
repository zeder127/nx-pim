import { CardBoard } from '@pim/data';

export const DemoBoard: CardBoard = {
  id: '123213-123123-234234',
  name: 'demo board',
  columnHeaders: [
    {
      text: 'column1',
      description: null,
      linkedWitId: null,
      id: '1',
    },
    {
      text: 'column2',
      description: '',
      linkedWitId: null,
      id: '4',
    },
  ],
  rowHeaders: [
    {
      text: 'row1',
      description: '',
      linkedIterationId: null,
      id: '2',
    },
    {
      text: 'row2',
      description: '',
      linkedIterationId: null,
      id: '5',
    },
  ],
  cards: [
    {
      text: 'pbi 1-1-1',
      linkedWitId: 3,
      x: 1,
      y: 1,
    },
    {
      text: 'pbi 1-1-2',
      linkedWitId: 7,
      x: 1,
      y: 1,
    },
    {
      text: 'pbi 1-2',
      linkedWitId: 4,
      x: 2,
      y: 1,
    },
    {
      text: 'pbi 2-1-1',
      linkedWitId: 5,
      x: 1,
      y: 2,
    },
    {
      text: 'pbi 2-1-2',
      linkedWitId: 8,
      x: 1,
      y: 2,
    },
    {
      text: 'pbi 2-2',
      linkedWitId: 6,
      x: 2,
      y: 2,
    },
  ],
  connections: [
    {
      startPointId: '6',
      endPointId: '4',
    },
    {
      startPointId: '3',
      endPointId: '8',
    },
    {
      startPointId: '1',
      endPointId: '2',
    },
    {
      startPointId: '5',
      endPointId: '6',
    },
  ],
};
