import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PostEditorService {
  private expandEditorSubject = new Subject<void>();
  expandEditor$ = this.expandEditorSubject.asObservable();

  constructor(private router: Router) {}

  openEditor() {
    // Navigate to home if not already there
    if (!this.router.url.startsWith("/?")) {
      this.router.navigate(["/"]);
    }
    // Emit event to expand the editor
    setTimeout(() => {
      this.expandEditorSubject.next();
    }, 100);
  }
}
