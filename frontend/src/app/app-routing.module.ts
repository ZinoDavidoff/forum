import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { LoginComponent } from "./pages/auth/login/login.component";
import { RegisterComponent } from "./pages/auth/register/register.component";
import { ThreadDetailComponent } from "./pages/threads/thread-detail/thread-detail.component";
import { ProfileComponent } from "./pages/profile/profile.component";
import { MessagesComponent } from "./pages/messages/messages.component";
import { NotificationsComponent } from "./pages/notifications/notifications.component";
import { AuthGuard } from "./core/guards/auth.guard";

import { HomeResolver } from "./core/resolvers/home.resolver";
import { ThreadDetailResolver } from "./core/resolvers/thread-detail.resolver";

const routes: Routes = [
  { path: "", component: HomeComponent, resolve: { homeData: HomeResolver } },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  {
    path: "threads/:id",
    component: ThreadDetailComponent,
    resolve: { threadDetailData: ThreadDetailResolver },
    runGuardsAndResolvers: "paramsOrQueryParamsChange",
  },
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
