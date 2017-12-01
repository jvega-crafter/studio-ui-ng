import { Observable } from 'rxjs/Observable';
import { PostResponse } from './post-response.interface';
import { PagedResponse } from './paged-response.interface';

export interface EntityService<T> {
  all(options?): Observable<PagedResponse<T>>;
  byId(uniqueKey: string | number): Observable<T>;
  by(entityProperty: string, value): Observable<T>;
  create(entity: T): Observable<PostResponse<T>>;
  update(entity: T): Observable<PostResponse<T>>;
  delete(entity: T): Observable<PostResponse<T>>;
}
