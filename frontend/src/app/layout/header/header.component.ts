import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { User } from "../../core/models/models";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  isMenuOpen = false;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["/"]);
  }
}
