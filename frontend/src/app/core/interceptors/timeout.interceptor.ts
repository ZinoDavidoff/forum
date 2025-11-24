import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError, TimeoutError } from "rxjs";
import { timeout, catchError } from "rxjs/operators";

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {
  private readonly DEFAULT_TIMEOUT = 10000; // 9 seconds

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      timeout(this.DEFAULT_TIMEOUT),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          // Convert timeout error to a proper HTTP error
          return throwError(
            () =>
              new HttpErrorResponse({
                error: "Request timeout",
                status: 408,
                statusText: "Request Timeout",
                url: request.url,
              })
          );
        }
        return throwError(() => error);
      })
    );
  }
}
