import { Injectable, OnDestroy, Renderer2 } from '@angular/core';
import { IConnection } from '@pim/data';
import LeaderLine from 'leader-line-new';
import { Subject } from 'rxjs';
import { AutoUnsubscriber } from '../util/base/auto-unsubscriber';

export type ConnectionRef = {
  connection: IConnection;
  line: LeaderLine;
  svg: SVGElement;
};

const LineWrapperId = 'line-wrapper';
@Injectable()
export class ConnectionBuilderService extends AutoUnsubscriber implements OnDestroy {
  private connectionStore: ConnectionRef[] = [];

  /**
   * Handle to update positions of all connections
   */
  public update$ = new Subject<boolean>();

  constructor(private render: Renderer2) {
    super();

    this.update$
      .pipe(this.autoUnsubscribe())
      .subscribe((withUpdatingAnchorPoints) =>
        this.updateExistingConnections(withUpdatingAnchorPoints)
      );
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
    const newLine = this.drawLine(startPointElement, endPointElement);
    this.moveLineIntoWrapper(newLine);
    return newLine;
  }

  private moveLineIntoWrapper(newLine: LeaderLine) {
    if (!newLine) return;
    const wrapper = document.getElementById(LineWrapperId);
    const lineToMove = document.querySelector('body>.leader-line:last-of-type');
    wrapper.appendChild(lineToMove);
  }

  /**
   * Draw a line base on the given connection and register the new line in store
   * @param connection
   */
  public drawConnection(connection: IConnection) {
    const line = this.drawLineByConnection(connection);
    const svg = document.querySelector('.leader-line:last-of-type') as SVGElement;
    // add this connection in store
    if (line) {
      this.connectionStore.push({ connection, line, svg });
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
        size: 2,
      });
    }
  }

  /**
   * Remove all lines on board
   */
  public destroy() {
    this.clearLines();
    this.connectionStore = undefined;
  }

  public createLineWrapper(bodyElement: HTMLElement) {
    const lineWrapper = this.render.createElement('div');
    this.render.setAttribute(lineWrapper, 'id', LineWrapperId);
    this.render.setStyle(lineWrapper, 'position', 'absolute');
    this.render.setStyle(lineWrapper, 'top', '0');
    this.render.setStyle(lineWrapper, 'pointer-events', 'none');
    this.render.appendChild(bodyElement, lineWrapper);
    this.wrapperPosition();
  }

  public remove(conn: IConnection) {
    const index = this.connectionStore.findIndex((ref) => {
      if (ref.connection === conn) {
        this.executeLineRemove(ref);
        return true;
      }
    });
    // remove from store
    this.connectionStore.splice(index, 1);
  }

  /**
   * Update position of all existing connections
   */
  private updateExistingConnections(withUpdatingAnchorPoints = false) {
    this.wrapperPosition();
    this.connectionStore.forEach((ref) => {
      if (withUpdatingAnchorPoints) {
        const start = document.getElementById(ref.connection.startPointId);
        const end = document.getElementById(ref.connection.endPointId);
        if (start && end) {
          ref.line.setOptions({ start, end });
          ref.line.position();
        }
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
    this.connectionStore.forEach((ref) => this.executeLineRemove(ref));
    this.connectionStore = [];
  }

  private wrapperPosition() {
    const wrapper = document.getElementById(LineWrapperId);
    wrapper.style.transform = 'none';
    const rectWrapper = wrapper.getBoundingClientRect();
    // Move to the origin of coordinates as the document
    wrapper.style.transform =
      'translate(' +
      -(rectWrapper.left + pageXOffset) +
      'px, ' +
      -(rectWrapper.top + pageYOffset) +
      'px)';
  }

  /**
   *
   */
  public executeLineRemove(ref: ConnectionRef) {
    // have to move the svg element back to body from line-wrapper
    document.body.appendChild(ref.svg);
    ref.line.remove();
  }
}
