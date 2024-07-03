import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { Product } from './product';
import { ProductData } from './product-data';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Just enough here for the code to compile
  private productsUrl = 'api/products';

  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private reviewServices = inject(ReviewService);
  private productSelectedSubject = new Subject<number>(); 
  productSelected$ = this.productSelectedSubject.asObservable();

  readonly products$ = this.http.get<Product[]>(this.productsUrl)
  .pipe(
    tap(p => console.log(JSON.stringify(p))), 
    shareReplay(1),
    catchError(err => this.handleError(err))
  );
  readonly product$ = this.productSelected$
  .pipe(
    switchMap(id => {
      const productsUrl = this.productsUrl + '/' + id;
      return this.http.get<Product>(productsUrl)
        .pipe( 
          tap(() => console.log('In http.get by id pipelin')),
          switchMap(product => this.getProductWithReviews(product)),
          catchError(err => this.handleError(err))        
          );
        })
  );

  productSelected(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId)
  }
   
  private getProductWithReviews(product: Product): Observable<Product> {
    if (product.hasReviews){
      return this.http.get<Review[]>(this.reviewServices.getReviewUrl(product.id))
      .pipe(
        map(Reviews => ({...product, Reviews }as Product))
      )
    }else {
      return of (product);
    }
  }
  private handleError(err: HttpErrorResponse): Observable<never> {
    const formattedMessage = this.errorService.formatError(err);
    return throwError(() => formattedMessage);
  // throw formattedMessage; 
  }
}
        