import {
  CdkDragDrop,
  CdkDragMove,
  CdkDragStart,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { Component, Input, OnInit } from "@angular/core";
import { Card } from "@pim/data";
import { ConnectionBuilderService } from "../../../connection/connection-builder.service";

@Component({
  selector: "pim-card-container",
  templateUrl: "./card-container.component.html",
  styleUrls: ["./card-container.component.scss"],
})
export class CardContainerComponent implements OnInit {
  private nonRelatedConnections: [];

  @Input() cards: Card[];
  constructor(private connectionBuilder: ConnectionBuilderService) {}

  ngOnInit(): void {
    //
  }

  public drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  public dragStart(event: CdkDragStart<Card>) {
    this.connectionBuilder
      .getRelatedConnections(`${event.source.data.linkedWitId}`)
      .forEach((ref) => {
        ref.line.remove();
      });
    // reset nonRelatedConnections
    this.nonRelatedConnections = undefined;
  }

  public dragMove(event: CdkDragMove<Card>) {
    const nonRelatedConnection =
      this.nonRelatedConnections ??
      this.connectionBuilder.getNonRelatedConnections(
        `${event.source.data.linkedWitId}`
      );

    nonRelatedConnection.forEach((ref) => {
      ref.line.position(); // update position
    });
  }

  public dragDropped(event: CdkDragDrop<Card>) {
    // Have to use setTimeout, because at this moment, the dropped item has not been rendered on Dom.
    // Without setTimeout, all lines will get wrong startPoint or endPoint.
    setTimeout(() => {
      this.connectionBuilder.updateConnections(
        `${event.item.data.linkedWitId}`
      ); // Re-draw all lines
    }, 0);
  }
}
