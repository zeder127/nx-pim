import {
  CdkDragDrop,
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

  public dragStart() {
    this.connectionBuilder.getRelevantConnections().forEach((ref) => {
      ref.line.remove();
    });
  }

  public dragDropped() {
    // Have to use setTimeout, because at this moment, the dropped item has not been rendered on Dom.
    // Without setTimeout, all lines will get wrong startPoint or endPoint.
    setTimeout(() => {
      this.connectionBuilder.updateConnections(); // Re-draw all lines
    }, 0);
  }
}
