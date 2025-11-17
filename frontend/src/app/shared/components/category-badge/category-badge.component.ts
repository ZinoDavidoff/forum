import { Component, Input } from "@angular/core";
import { Category } from "../../../core/models/models";

@Component({
  selector: "app-category-badge",
  template: `<span class="badge" [style.background]="category.color"
    ><i-lucide
      *ngIf="category.icon"
      [name]="category.icon"
      [size]="16"
    ></i-lucide>
    {{ category.name }}</span
  >`,
})
export class CategoryBadgeComponent {
  @Input() category!: Category;
}
