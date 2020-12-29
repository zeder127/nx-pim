import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AutoUnsubscriber } from '@pim/ui';
import { PimDataObjectRefService } from '../../fluid/data-object-ref.service';
import { Pi } from '../../shared/models/pi';
import { PiService } from '../../shared/services/pi.service';

@Component({
  selector: 'pim-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent extends AutoUnsubscriber implements OnInit {
  public pis: Pi[];
  public newPiName: string;
  constructor(
    private piService: PiService,
    private pimDORef: PimDataObjectRefService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  async ngOnInit() {
    const pimDO = await this.pimDORef.getInstanceAsync();
    pimDO.pisChange$.pipe(this.autoUnsubscribe()).subscribe(() => this.updatePis());
    this.updatePis();
  }

  public createPi(name: string) {
    this.piService.createPi(name);
  }

  public removePi(id: string) {
    this.piService.remove(id);
  }

  private updatePis(): void {
    this.pis = this.piService.getPis();

    // Event is occuring outside of Angular so detecting changes
    this.cdr.detectChanges();
  }
}
