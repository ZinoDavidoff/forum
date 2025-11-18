import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { delay } from "rxjs/operators";

@Injectable()
export class DelayInterceptor implements HttpInterceptor {
  // Set delay time in milliseconds (default: 1000ms = 1 second)
  private delayTime = 1500;

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(delay(this.delayTime));
  }
}
