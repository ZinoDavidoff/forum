import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { LoginComponent } from "./pages/auth/login/login.component";
import { RegisterComponent } from "./pages/auth/register/register.component";
import { ThreadDetailComponent } from "./pages/threads/thread-detail/thread-detail.component";
import { ThreadCreateComponent } from "./pages/threads/thread-create/thread-create.component";
import { ProfileComponent } from "./pages/profile/profile.component";
import { MessagesComponent } from "./pages/messages/messages.component";
import { NotificationsComponent } from "./pages/notifications/notifications.component";
import { AuthGuard } from "./core/guards/auth.guard";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  {
    path: "threads/create",
    component: ThreadCreateComponent,
    canActivate: [AuthGuard],
  },
  { path: "threads/:id", component: ThreadDetailComponent },
  { path: "profile/:id", component: ProfileComponent },
  { path: "messages", component: MessagesComponent, canActivate: [AuthGuard] },
  {
    path: "notifications",
    component: NotificationsComponent,
    canActivate: [AuthGuard],
  },
  { path: "**", redirectTo: "" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
