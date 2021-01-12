import { Observable, of } from 'rxjs';
import { shareReplay, switchMap, tap } from 'rxjs/operators';

export abstract class Cacheable<T> {
  private cache$: Observable<T[]>;
  private cacheValue: T[];
  protected abstract getAllAsync(): Observable<T[]>;

  get value(): T[] {
    return this.cacheValue;
  }

  public getAll(): Observable<T[]> {
    return this.doGetAll();
  }
  public getSingleByKey(key: string, value: unknown): Observable<T> {
    return this.doGetAll().pipe(
      switchMap((results) => of(results.find((v) => v[key] === value)))
    );
  }

  protected clear() {
    this.cache$ = undefined;
    this.cacheValue = undefined;
  }

  protected update() {
    this.clear();
    this.getAllAsync();
  }

  private doGetAll(): Observable<T[]> {
    if (!this.cache$) {
      this.cache$ = this.getAllAsync().pipe(
        tap((result) => (this.cacheValue = result)),
        shareReplay(1)
      );
    }
    return this.cache$;
  }
}
