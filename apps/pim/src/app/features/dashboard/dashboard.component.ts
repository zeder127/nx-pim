import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AutoUnsubscriber } from '@pim/ui';
import { v4 as uuidv4 } from 'uuid';
import { PimDataObjectRefService } from '../../fluid/data-object-ref.service';
import { PimDataObject } from '../../fluid/pim.dataobject';
import { Pi } from '../../shared/models/pi';
import { PiService } from '../../shared/services/pi.service';
@Component({
  selector: 'pim-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent extends AutoUnsubscriber implements OnInit {
  private pimDO: PimDataObject;
  public pis: Pi[];
  constructor(
    private piService: PiService,
    private dor: PimDataObjectRefService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  public newPiName: string;
  async ngOnInit() {
    this.pimDO = await this.dor.getInstanceAsync();
    this.pimDO.pisChange$.pipe(this.autoUnsubscribe()).subscribe(() => this.updatePis());
    this.updatePis();
  }

  private updatePis(): void {
    this.pis = this.pimDO.getPis();

    // Event is occuring outside of Angular so detecting changes
    this.cdr.detectChanges();
  }

  public createPi(name: string) {
    if (this.pis?.some((pi) => pi.name === name)) {
      alert(`Name exists already, please enter another name.`);
      return;
    }
    this.pimDO.createPi({
      id: uuidv4(),
      name,
      teamBoardIds: [],
      programBoardId: uuidv4(),
    });
  }

  public removePi(id: string) {
    this.pimDO.removePi(id);
  }
}
