// TODO remove
export interface PiConfiguration {
  id: string;
  name: string;
  iterationIds: string[];
  teamIds: string[];
  witIds: string[];

  iterations?: Iteration[];
  teams?: Team[];
}

export interface Team {
  id: string;
  name: string;
}

export interface Iteration {
  id: string;
  name: string;
  path: string;
  attributes: {
    startDate: string;
    finishDate: string;
  };
}
