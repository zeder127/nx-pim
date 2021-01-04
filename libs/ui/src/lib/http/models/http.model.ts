import { HttpParams } from '@angular/common/http';

export interface RequestOptions {
  params?: HttpParams | { [param: string]: string | string[] };
}
