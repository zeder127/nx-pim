import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { DataObjectRefService } from '../../fluid/data-object-ref.service';
import { Pi } from '../../shared/models/pi';
import { PiService } from '../../shared/services/pi.service';

@Component({
  selector: 'pim-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  public pis$: Observable<Pi[]>;
  constructor(private piService: PiService, private dor: DataObjectRefService) {}
  public newPiName: string;
  ngOnInit(): void {
    this.pis$ = this.piService.getPis();
  }
  public createPi(name: string) {
    this.dor.instance.createPi({
      id: uuidv4(),
      name,
      teamBoardIds: [],
      programBoardId: uuidv4(),
    });
  }
}
