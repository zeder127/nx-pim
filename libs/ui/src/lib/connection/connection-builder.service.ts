import { Injectable, OnDestroy } from '@angular/core';
import { IConnection } from '@pim/data';
import LeaderLine from 'leader-line-new';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AutoUnsubscriber } from '../util/base/auto-unsubscriber';

export type ConnectionRef = { connection: IConnection; line: LeaderLine };

@Injectable()
export class ConnectionBuilderService extends AutoUnsubscriber implements OnDestroy {
  private connectionStore: ConnectionRef[] = [];

  /**
   * Handle to update positions of all connections
   */
  public update$ = new Subject();

  constructor() {
    super();

    // Using debounceTime to avoid from frequently updating
    this.update$
      .pipe(this.autoUnsubscribe(), debounceTime(50))
      .subscribe(() => this.updatePositions());
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();

    // LeaderLine are rendered under <body> directly(not part of angular),
    // so they should be removed manually, if this service is destroyed
    this.clear();
  }

  /**
   * Draw lines based on given Connections.
   * @param connections
   */
  public initConnections(connections: IConnection[]) {
    connections?.forEach((connection) => {
      const line = this.drawLineByConnection(connection);
      // add this connection in store
      if (line) {
        this.connectionStore.push({ connection, line });
      }
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
   * Draw a line base on the given start and end elements
   * @param startPointElement
   * @param endPointElement
   */
  public drawLine(
    startPointElement: HTMLElement,
    endPointElement: HTMLElement
  ): LeaderLine {
    if (startPointElement && endPointElement) {
      // create a new line
      return new LeaderLine(startPointElement, endPointElement, {
        startSocket: 'bottom',
        endSocket: 'bottom',
        size: 3,
      });
    }
  }

  /**
   * Re-draw lines that connect to an element. If elementId is undefined, re-draw all lines.
   * @param elementId
   */
  public redrawConnections(elementId?: string) {
    this.getRelatedConnections(elementId).forEach(
      (ref) => (ref.line = this.drawLineByConnection(ref.connection))
    );
  }

  /**
   * Get all related ConnectionRefs of a given element. If elementId is undefined, get all ConnectionRefs.
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

  /**
   * Get all non-related ConnectionRefs of a given element.
   * @param elementId
   */
  public getNonRelatedConnections(elementId: string): ConnectionRef[] {
    return this.connectionStore.filter(
      (ref) =>
        !(
          ref.connection.startPointId === elementId ||
          ref.connection.endPointId === elementId
        )
    );
  }

  /**
   * Remove all lines on board
   */
  public clear() {
    this.connectionStore.forEach((ref) => ref.line.remove());
    this.connectionStore = [];
  }

  public clearRelatedConnections(elementId: string) {
    this.getRelatedConnections(elementId).forEach((ref) => {
      // remove from store
      ref.line.remove();
      const index = this.connectionStore.indexOf(ref);
      this.connectionStore.splice(index, 1);
    });
  }

  /**
   * Execute update postions of all connections
   */
  private updatePositions() {
    console.log(
      `🚀 ~ ConnectionBuilderService ~ this.connectionStore`,
      this.connectionStore
    );
    this.connectionStore.forEach((ref, index) => {
      ref.line.remove();
      ref.line = this.drawLineByConnection(ref.connection);
      if (ref.line) {
        ref.line.position();
      } else {
        this.connectionStore.splice(index, 1);
      }
    });
  }
}
