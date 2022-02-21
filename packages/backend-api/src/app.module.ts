import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './config/config';
import { validateConfig } from './config/config.validate';
import { DiscordAuthModule } from './discord-auth/discord-auth.module';
import { DiscordUserModule } from './discord-users/discord-users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [config],
      validate: validateConfig,
    }),
    DiscordAuthModule,
    DiscordUserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  static forRoot(): DynamicModule {
    const configValues = config();

    return {
      module: AppModule,
      imports: [MongooseModule.forRoot(configValues.mongodbUri)],
    };
  }
}
