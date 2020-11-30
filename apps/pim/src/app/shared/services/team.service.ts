import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Team } from '@pim/data';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { organization } from '../constants/auzre-endpoint';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  private cache$: Observable<Team[]>;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Team[]> {
    if(!this.cache$){
      this.cache$ = this.requestAll().pipe(shareReplay(1));
    }
    return this.cache$;
  }

  private requestAll(): Observable<Team[]> {
    return this.http.get<{value: Team[]}>(`https://dev.azure.com/${organization}/_apis/teams`).pipe(map(response => response.value));
  }

}
