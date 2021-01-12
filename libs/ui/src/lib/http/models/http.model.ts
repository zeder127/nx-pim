import { HttpHeaders, HttpParams } from '@angular/common/http';

export interface RequestOptions {
  params?: HttpParams | { [param: string]: string | string[] };
  headers?: HttpHeaders | { [header: string]: string | string[] };
}
