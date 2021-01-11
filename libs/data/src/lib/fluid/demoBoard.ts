import { ICardBoard } from '@pim/data';

export const DemoBoard: ICardBoard = {
  id: '123213-123123-234234',
  name: 'demo board',
  columnHeaders: [
    {
      text: 'column1',
      description: null,
      linkedSourceId: null,
      id: '1',
    },
    {
      text: 'column2',
      description: '',
      linkedSourceId: null,
      id: '4',
    },
  ],
  rowHeaders: [
    {
      text: 'Q1.1',
      description: '',
      linkedIterationId: '479afcc4-d6d5-489b-8857-5e729b25283f',
      id: '2',
    },
    {
      text: 'Q1.2',
      description: '',
      linkedIterationId: '0e0c20f8-3ca4-4fe6-9891-0376eba8802f',
      id: '5',
    },
    {
      text: 'Q1.3',
      description: '',
      linkedIterationId: '4ef05253-3a92-4659-aceb-0270affe8c26',
      id: '5',
    },
    {
      text: 'Q1.4',
      description: '',
      linkedIterationId: '4ee23779-9e43-422a-b24e-10a99f6bc988',
      id: '5',
    },
    {
      text: 'Q1.5',
      description: '',
      linkedIterationId: '728a9d26-743f-465c-8a81-90c72155d83c',
      id: '5',
    },
    {
      text: 'Unplanned',
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
