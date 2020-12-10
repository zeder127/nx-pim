import { Injectable } from '@angular/core';
import { Connection } from '@pim/data';
import LeaderLine from 'leader-line-new';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
//declare const LeaderLine: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
//declare const AnimEvent: any;

type ConnectionRef = { connection: Connection; line: unknown };

@Injectable()
export class ConnectionBuilderService {
  private connections: ConnectionRef[] = [];

  constructor() {}

  public create(connections: Connection[]) {
    connections?.forEach((connection) => {
      this.createSingle(connection);
    });
  }

  public createSingle = (connection: Connection) => {
    const startPointElement = document.getElementById(connection.startPointId);
    const endPointElement = document.getElementById(connection.endPointId);

    if (startPointElement && endPointElement) {
      const leaderLine = new LeaderLine(startPointElement, endPointElement);

      startPointElement.addEventListener(
        'drag',
        () => {
          leaderLine.position();
        },
        false
      );

      this.connections.push({ connection, line: leaderLine });
    }
  };

  public delete(connection: Connection) {
    //
  }
}
