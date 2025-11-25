import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { ThreadsModule } from "./modules/threads/threads.module";
import { PostsModule } from "./modules/posts/posts.module";
import { ReactionsModule } from "./modules/reactions/reactions.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { SearchModule } from "./modules/search/search.module";
import { MessagesModule } from "./modules/messages/messages.module";
import { ReputationModule } from "./modules/reputation/reputation.module";
import { ModerationModule } from "./modules/moderation/moderation.module";
import { UploadModule } from "./modules/upload/upload.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // If DATABASE_URL exists, use it (production with Render)
        if (configService.get("DATABASE_URL")) {
          return {
            type: "postgres",
            url: configService.get("DATABASE_URL"),
            entities: [__dirname + "/**/*.entity{.ts,.js}"],
            synchronize: false, // Never sync in production
            logging: false,
            ssl: {
              rejectUnauthorized: false
            },
          };
        }
        
        // Otherwise use individual env vars (local development)
        return {
          type: "postgres",
          host: configService.get("DB_HOST"),
          port: configService.get("DB_PORT"),
          username: configService.get("DB_USERNAME"),
          password: configService.get("DB_PASSWORD"),
          database: configService.get("DB_DATABASE"),
          entities: [__dirname + "/**/*.entity{.ts,.js}"],
          synchronize: true,
          logging: true,
        };
      },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ThreadsModule,
    PostsModule,
    ReactionsModule,
    NotificationsModule,
    SearchModule,
    MessagesModule,
    ReputationModule,
    ModerationModule,
    UploadModule,
  ],
})
export class AppModule {}
