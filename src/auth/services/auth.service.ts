import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/features/users/entities/user.entity';
import { UsersService } from 'src/features/users/services/users/users.service';
import * as bcrypt from 'bcrypt';
import { UserModel } from 'src/features/users/interfaces/user';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        //recuperación de contraseña
        private readonly mailerService: MailerService,
    ) { }

    async validateUser(email: string, password: string) {
        // Buscamos al usuario incluyendo sus roles para el login
        const user = await this.usersService.findByEmail(email);

        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Extraemos el password para no enviarlo al frontend
        const { password: _, ...result } = user;
        return result;
    }

    async login(user: UserModel) {
        const payload = {
            sub: user.id,
            email: user.email,
        };

        const userWithRoles = await this.usersService.findOne(user.id);

        return {
            access_token: this.jwtService.sign(payload),
            user: userWithRoles, 
        };
    }

    async checkStatus(user: UserModel) {

        const id = user.id;
        const dbUser = await this.usersService.findOne(id);
        const payload = {
            sub: dbUser.id,
            email: dbUser.email
        };

        return {
            user: dbUser,
            access_token: this.jwtService.sign(payload), // Generamos el token con 'sub'
        };
    }

    // --- MÉTODO DE RECUPERACIÓN DE CONTRASEÑA ---
    async sendRecoveryEmail(email: string) {
        const user = await this.usersService.findByEmail(email);

        if (user) {
            // 1. Generas el token
            const payload = { email: user.email, type: 'recovery' };
            const recoveryToken = this.jwtService.sign(payload, { expiresIn: '15m' });

            // 2. Creas la URL que apunta a tu FRONTEND de Angular
            const recoveryUrl = `http://localhost:4200/auth/reset-password?token=${recoveryToken}`;

            // 3. Envías el correo con el link de recuperación
            this.mailerService.sendMail({
                to: user.email,
                subject: 'Recuperación de contraseña - TechAccess',
                html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                <h2 style="color: #38a800;">Hola, ${user.name || 'Usuario'}</h2>
                <p>Has solicitado restablecer tu contraseña en <strong>TechAccess</strong>.</p>
                <p>Haz clic en el botón de abajo para continuar. Este enlace expirará en 15 minutos.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${recoveryUrl}" 
                       style="background-color: #38a800; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">
                       Restablecer Contraseña
                    </a>
                </div>
                
                <p style="font-size: 0.8rem; color: #999;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <p style="font-size: 0.8rem; color: #999; text-align: center;">© 2026 TechAccess - SENA</p>
            </div>
        `,
            }).catch(err => console.error('Error enviando mail en segundo plano:', err));
        }

        return { message: 'Si el correo está registrado, recibirá instrucciones en breve.' };
    }
    // En auth.service.ts
    async resetPassword(token: string, newPassword: string) {
        try {
            // 1. Verificar que el token sea válido y no haya expirado
            const payload = this.jwtService.verify(token);

            // 2. Encriptar la nueva contraseña
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // 3. Actualizar en la base de datos (PostgreSQL)
            return await this.usersService.updatePassword(payload.email, hashedPassword);
        } catch (error) {
            throw new UnauthorizedException('El enlace ha expirado o es inválido');
        }
    }
}

