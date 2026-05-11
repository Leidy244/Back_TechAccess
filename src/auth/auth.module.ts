import { Module } from '@nestjs/common';
import { AuthService } from '../auth/services/auth.service';
import { AuthController } from '../auth/controllers/auth.controller';
import { UsersModule } from 'src/features/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigType } from '@nestjs/config';
import config from '../config';
import { ModulesGuard } from './guards/modules.guard.guard';
import { JwtAuthGuard } from './guards/auth.guard';

// 1. Importa el MailerModule
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    // 2. Configuración del MailerModule
    MailerModule.forRootAsync({
      inject: [config.KEY],
      useFactory: (configType: ConfigType<typeof config>) => ({
        transport: {
          host: 'smtp.gmail.com', // O el host que uses
          port: 465,
          secure: true, // true para puerto 465
          auth: {
            user: 'senatechaccess@gmail.com', // Podrías traerlo de configType si lo añades
            pass: 'fvth nmyw vzez ufpn',
          },
        },
        defaults: {
          from: '"TechAccess Support" <senatechaccess@gmail.com>',
        },
      }),
    }),
    JwtModule.registerAsync({
      inject: [config.KEY],
      useFactory: (configType: ConfigType<typeof config>) => ({
        secret: configType.jwt.secret,
        signOptions: { expiresIn: configType.jwt.expiresIn },
      }),
    }),
  ],
  providers: [AuthService, ModulesGuard, JwtAuthGuard, JwtStrategy], 
  controllers: [AuthController],
  exports: [AuthService, ModulesGuard, JwtAuthGuard],
})
export class AuthModule {}