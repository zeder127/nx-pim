import { Component, OnInit } from '@angular/core';
import { IColumnHeader, IRowHeader, Iteration, Pi, Team } from '@pim/data';
import { IterationService, TeamService } from '@pim/ui';
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

  constructor(
    private piService: PiService,
    private iterationService: IterationService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.pis$ = this.piService.getPisAsync();
    this.iterations$ = this.iterationService.getAll();
    this.teams$ = this.teamService.getAll();
  }

  public createPi(name: string, iterations: Iteration[], teams: Team[]) {
    // TODO validation: name is empty, name exists already
    const rowHeaders: IRowHeader[] = iterations.map((iteration) => {
      return { linkedIterationId: iteration.id, text: iteration.name };
    });
    const columnHeaders: IColumnHeader[] = teams.map((team) => {
      return { linkedSourceId: team.id, text: team.name };
    });
    this.piService.createPi(name, rowHeaders, columnHeaders);
  }

  public removePi(id: string) {
    this.piService.remove(id);
  }
}
