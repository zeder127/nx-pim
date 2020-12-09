import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Iteration } from '@pim/data';

import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { organization, project } from '../constants/auzre-endpoint';

@Injectable({
  providedIn: 'root'
})
export class IterationService {

  private cache$: Observable<Iteration[]>;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Iteration[]> {
    if(!this.cache$){
      this.cache$ = this.requestAll().pipe(shareReplay(1));
    }
    return this.cache$;
  }

  private requestAll(): Observable<Iteration[]> {
    return this.http.get<{value: Iteration[]}>(`https://dev.azure.com/${organization}/${project}/_apis/work/teamsettings/iterations`)
    .pipe(map(response => response.value));
  }
}
