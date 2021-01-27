import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnInit,
} from '@angular/core';
import { Pi } from '@pim/data';
import { AutoUnsubscriber } from '@pim/ui';
import { PimDataObjectRefService } from '../../shared/services/data-object-ref.service';
import { PiService } from '../../shared/services/pi.service';

@Component({
  selector: 'pim-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent extends AutoUnsubscriber implements OnInit {
  public pis: Pi[];
  public newPiName: string;
  constructor(
    private piService: PiService,
    private pimDORef: PimDataObjectRefService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  async ngOnInit() {
    const pimDO = await this.pimDORef.getInstanceAsync();
    pimDO.pisChange$
      .pipe(this.autoUnsubscribe())
      .subscribe(() => this.zone.run(() => this.updatePis()));
    this.updatePis();
  }

  public createPi(name: string) {
    this.piService.createPi(name, [], []); // TODO
  }

  public removePi(id: string) {
    this.piService.remove(id);
  }

  public getBoards(piIds: string[]) {
    const result = piIds.map((id) => this.piService.getBoardById(id));
    return result;
  }

  private updatePis(): void {
    this.pis = this.piService.getPis();
    this.cdr.markForCheck();
  }
}
