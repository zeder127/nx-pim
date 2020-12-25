import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

export abstract class Cacheable<T> {
  private cache$ = new BehaviorSubject<T[]>(null);
  protected abstract getAll(): Observable<T[]>;

  protected get value(): T[] {
    return this.cache$.value;
  }

  protected getCache(): Observable<T[]> {
    if (this.value) {
      return this.cache$.asObservable();
    }
    return this.doGetAll();
  }

  protected getSingleByKey(key: string, value: unknown): Observable<T> {
    if (this.value) {
      return of(this.cache$.value.find((v) => v[key] === value));
    }
    return this.doGetAll().pipe(
      switchMap((results) => of(results.find((v) => v[key] === value)))
    );
  }

  protected clear() {
    this.cache$ = undefined;
  }

  protected update() {
    this.clear();
    this.getAll();
  }

  private doGetAll(): Observable<T[]> {
    return this.getAll().pipe(tap((results) => this.cache$.next(results)));
  }
}
