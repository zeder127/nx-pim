import { Injectable } from '@angular/core';
import { Connection } from '@pim/data';
import LeaderLine from 'leader-line-new';

export type ConnectionRef = { connection: Connection; line: LeaderLine };

@Injectable()
export class ConnectionBuilderService {
  private connectionStore: ConnectionRef[] = [];

  constructor() {
    //
  }

  /**
   * Draw lines based on given Connections.
   * @param connections
   */
  public create(connections: Connection[]) {
    connections?.forEach((connection) => {
      const line = this.drawLineByConnection(connection);
      // add this connection in store
      if (line) {
        this.connectionStore.push({ connection, line });
      }
    });
  }

  public drawLineByConnection(connection: Connection): LeaderLine {
    const startPointElement = document.getElementById(connection.startPointId);
    const endPointElement = document.getElementById(connection.endPointId);
    return this.drawLine(startPointElement, endPointElement);
  }

  public drawLine(
    startPointElement: HTMLElement,
    endPointElement: HTMLElement
  ): LeaderLine {
    if (startPointElement && endPointElement) {
      // create a new line
      return new LeaderLine(startPointElement, endPointElement, {
        startSocket: 'bottom',
        endSocket: 'bottom',
      });
    }
  }

  /**
   * Re-draw lines that connect to an element. If elementId is undefined, re-draw all lines.
   * @param elementId
   */
  public updateConnections(elementId?: string) {
    this.getRelatedConnections(elementId).forEach(
      (ref) => (ref.line = this.drawLineByConnection(ref.connection))
    );
  }

  /**
   * Get all ConnectionRefs relevant to a given element. If elementId is undefined, get all ConnectionRefs.
   * @param elementId
   */
  public getRelatedConnections(elementId?: string): ConnectionRef[] {
    if (!elementId) return this.connectionStore;
    return this.connectionStore.filter(
      (ref) =>
        ref.connection.startPointId === elementId ||
        ref.connection.endPointId === elementId
    );
  }

  public getNonRelatedConnections(elementId: string): ConnectionRef[] {
    return this.connectionStore.filter(
      (ref) =>
        !(
          ref.connection.startPointId === elementId ||
          ref.connection.endPointId === elementId
        )
    );
  }

  public clear() {
    this.connectionStore.forEach((ref) => ref.line.remove());
    this.connectionStore = [];
  }
}
