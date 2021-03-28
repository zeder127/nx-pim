import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IColumnHeader, IRowHeader, Iteration, Pi, Team } from '@pim/data';
import { IterationService, TeamService } from '@pim/ui';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { PiService } from '../../../shared/services/pi.service';

@Component({
  selector: 'pim-pi-configurator',
  templateUrl: './pi-configurator.component.html',
  styleUrls: ['./pi-configurator.component.scss'],
})
export class PiConfiguratorComponent implements OnInit {
  public newPiName: string;
  public pis$: Observable<Pi[]>;
  public iterations$: Observable<Iteration[]>;
  public teams$: Observable<Team[]>;
  public selectedIterations: Iteration[];
  public selectedTeams: Team[];
  public selectedTemplatePi: Pi;
  public saved = false;

  constructor(
    private piService: PiService,
    private iterationService: IterationService,
    private teamService: TeamService,
    private messageService: MessageService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.pis$ = this.piService.getPisAsync();
    this.iterations$ = this.iterationService.getAll();
    this.teams$ = this.teamService.getAll();
  }

  public createPi(name: string, iterations: Iteration[], teams: Team[]) {
    // TODO validation: name is empty, name exists already
    const rowHeaders: IRowHeader[] = iterations.map((iteration) => {
      return { linkedIterationId: iteration.id, title: iteration.name };
    });
    const columnHeaders: IColumnHeader[] = teams.map((team) => {
      return { linkedSourceId: team.id, title: team.name };
    });
    this.piService.createPi(name, rowHeaders, columnHeaders);

    this.piService.getPiByName(name, true).subscribe((pi) => {
      if (pi) {
        this.messageService.add({
          severity: 'success',
          summary: '😀 Cool',
          detail: `Saved successfully!`,
        });
        this.saved = true;
      } else
        this.messageService.add({
          severity: 'error',
          summary: '😈 Ops...',
          detail: `Failed to save!`,
        });
    });
  }

  public goBack() {
    this.location.back();
  }

  public openPi(piName: string) {
    this.router.navigateByUrl(`planning/${piName}/board`);
  }

  public removePi(id: string) {
    this.piService.remove(id);
  }
}
