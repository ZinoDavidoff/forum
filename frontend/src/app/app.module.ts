import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  LucideAngularModule,
  Home,
  MessageCircle,
  Mail,
  Bell,
  Edit,
  User,
  Settings,
  LogOut,
  Lock,
  Eye,
  Calendar,
  Star,
  ThumbsUp,
  Heart,
  MessageSquare,
  FileText,
  Users,
  Award,
  Folder,
  Pin,
  Lightbulb,
  PartyPopper,
  Baby,
  Check,
  Moon,
  Apple,
  Utensils,
  TrendingUp,
  HeartPulse,
  ShoppingBag,
  Search,
  Plus,
  ChevronUp,
  ChevronDown,
  Flame,
  ImagePlus,
  Share,
  Trash,
  Bookmark,
  BookmarkCheck,
  CornerDownRight,
  Clock,
  X,
  Loader2,
  MoreVertical,
  Edit3,
} from "lucide-angular";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AuthInterceptor } from "./core/interceptors/auth.interceptor";
import { DelayInterceptor } from "./core/interceptors/delay.interceptor";

// Layout Components
import { HeaderComponent } from "./layout/header/header.component";
import { FooterComponent } from "./layout/footer/footer.component";
import { SidebarComponent } from "./layout/sidebar/sidebar.component";

// Pages
import { HomeComponent } from "./pages/home/home.component";
import { LoginComponent } from "./pages/auth/login/login.component";
import { RegisterComponent } from "./pages/auth/register/register.component";
import { ThreadListComponent } from "./pages/threads/thread-list/thread-list.component";
import { ThreadDetailComponent } from "./pages/threads/thread-detail/thread-detail.component";
import { ProfileComponent } from "./pages/profile/profile.component";
import { MessagesComponent } from "./pages/messages/messages.component";
import { NotificationsComponent } from "./pages/notifications/notifications.component";

// Shared Components
import { ThreadCardComponent } from "./shared/components/thread-card/thread-card.component";
import { PostCardComponent } from "./shared/components/post-card/post-card.component";
import { UserCardComponent } from "./shared/components/user-card/user-card.component";
import { CategoryBadgeComponent } from "./shared/components/category-badge/category-badge.component";
import { LoadingSpinnerComponent } from "./shared/components/loading-spinner/loading-spinner.component";
import { ConfirmModalComponent } from "./shared/components/confirm-modal/confirm-modal.component";

// Pipes
import { TimeAgoPipe } from "./shared/pipes/time-ago.pipe";
import { CompactNumberPipe } from "./shared/pipes/compact-number.pipe";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ThreadListComponent,
    ThreadDetailComponent,
    ProfileComponent,
    MessagesComponent,
    NotificationsComponent,
    ThreadCardComponent,
    PostCardComponent,
    UserCardComponent,
    CategoryBadgeComponent,
    LoadingSpinnerComponent,
    ConfirmModalComponent,
    TimeAgoPipe,
    CompactNumberPipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule.pick({
      Home,
      MessageCircle,
      Mail,
      Bell,
      Edit,
      User,
      Settings,
      LogOut,
      Lock,
      Eye,
      Calendar,
      Star,
      ThumbsUp,
      Heart,
      MessageSquare,
      FileText,
      Users,
      Award,
      Folder,
      Pin,
      Lightbulb,
      PartyPopper,
      Baby,
      Check,
      Moon,
      Apple,
      Utensils,
      TrendingUp,
      HeartPulse,
      ShoppingBag,
      Search,
      Plus,
      ChevronUp,
      ChevronDown,
      Flame,
      ImagePlus,
      Share,
      Bookmark,
      Trash,
      BookmarkCheck,
      CornerDownRight,
      Clock,
      X,
      Loader2,
      MoreVertical,
      Edit3,
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DelayInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
