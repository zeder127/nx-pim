import { Injectable, OnDestroy } from '@angular/core';
import { IConnection } from '@pim/data';
import LeaderLine from 'leader-line-new';
import { Subject } from 'rxjs';
import { AutoUnsubscriber } from '../util/base/auto-unsubscriber';

export type ConnectionRef = { connection: IConnection; line: LeaderLine };

@Injectable()
export class ConnectionBuilderService extends AutoUnsubscriber implements OnDestroy {
  private connectionStore: ConnectionRef[] = [];
  private lines: LeaderLine[] = [];

  /**
   * Handle to update positions of all connections
   */
  public update$ = new Subject<boolean>();

  constructor() {
    super();

    this.update$
      .pipe(this.autoUnsubscribe())
      .subscribe((forceRedraw) => this.updateExistingConnections(forceRedraw));
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();

    // LeaderLine are rendered under <body> directly(not part of angular),
    // so they should be removed manually, if this service is destroyed
    this.destroy();
  }

  /**
   * Draw lines based on given Connections and initiate a store to hold all references of lines
   * @param connections
   */
  public initConnections(connections: IConnection[]) {
    connections.forEach((connection) => {
      this.drawConnection(connection);
    });
  }

  /**
   * Draw a line base on the given connection
   * @param connection
   */
  public drawLineByConnection(connection: IConnection): LeaderLine {
    const startPointElement = document.getElementById(connection.startPointId);
    const endPointElement = document.getElementById(connection.endPointId);
    return this.drawLine(startPointElement, endPointElement);
  }

  /**
   * Draw a line base on the given connection and register the new line in store
   * @param connection
   */
  public drawConnection(connection: IConnection) {
    const line = this.drawLineByConnection(connection);
    // add this connection in store
    if (line) {
      this.connectionStore.push({ connection, line });
    }
  }

  /**
   * Draw a line base on the given start and end elements
   * @param startPointElement
   * @param endPointElement
   */
  public drawLine(
    startPointElement: HTMLElement | LeaderLine.AnchorAttachment,
    endPointElement: HTMLElement | LeaderLine.AnchorAttachment
  ): LeaderLine {
    if (startPointElement && endPointElement) {
      // create a new line
      return new LeaderLine(startPointElement, endPointElement, {
        startSocket: 'bottom',
        endSocket: 'bottom',
        size: 3,
      });
    } else {
      console.error(
        `😈 Failed to draw a line. start: ${startPointElement}, end: ${endPointElement}`
      );
    }
  }

  /**
   * Remove all lines on board
   */
  public destroy() {
    this.clearLines();
    this.connectionStore = undefined;
  }

  public insert(conn: IConnection) {
    if (this.has(conn)) return;
  }

  public remove(conn: IConnection) {
    const index = this.connectionStore.findIndex((ref) => {
      if (ref.connection === conn) {
        // remove leaderline
        ref.line.remove();
        return true;
      }
    });
    // remove from store
    this.connectionStore.splice(index, 1);
  }

  /**
   * Update all existing connections, as default, only position of lines will be updated. Set forceRedraw as true to redraw all lines
   *  @param forceRedraw boolean, optinal
   */
  public updateExistingConnections(forceRedraw?: boolean) {
    this.connectionStore.forEach((ref) => {
      if (forceRedraw) {
        ref.line.remove();
        ref.line = this.drawLineByConnection(ref.connection);
      } else {
        ref.line.position();
      }
    });
  }

  /**
   * Clear existing connections and local store, then redraw connections
   * @param connections
   */
  public redrawConnections(connections: IConnection[]) {
    this.clearLines();
    this.initConnections(connections);
  }

  private clearLines() {
    this.connectionStore.forEach((ref) => ref.line.remove());
    this.connectionStore = [];
  }

  private has(conn: IConnection) {
    return this.connectionStore.some((ref) => ref.connection === conn);
  }
}
