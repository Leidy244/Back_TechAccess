import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/features/users/services/users/users.service';
import * as bcrypt from 'bcrypt';
import { UserModel } from 'src/features/users/interfaces/user';
import * as Brevo from '@getbrevo/brevo';

@Injectable()
export class AuthService {
    private apiInstance: any;

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {
        this.apiInstance = new Brevo.TransactionalEmailsApi();

        const apiKey = process.env.BREVO_API_KEY;
        if (apiKey) {
            (this.apiInstance as any).authentications.apiKey.apiKey = apiKey;
        } else {
            console.error('ERROR: BREVO_API_KEY no definida en variables de entorno');
        }
    }

    async validateUser(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);

        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const { password: _, ...result } = user;
        return result;
    }

    async login(user: UserModel) {
        const payload = { sub: user.id, email: user.email };
        const userWithRoles = await this.usersService.findOne(user.id);

        return {
            access_token: this.jwtService.sign(payload),
            user: userWithRoles,
        };
    }

    async checkStatus(user: UserModel) {
        const dbUser = await this.usersService.findOne(user.id);
        const payload = { sub: dbUser.id, email: dbUser.email };

        return {
            user: dbUser,
            access_token: this.jwtService.sign(payload),
        };
    }

    async sendRecoveryEmail(email: string) {
        const user = await this.usersService.findByEmail(email);

        if (user) {
            const payload = { email: user.email, type: 'recovery' };
            const recoveryToken = this.jwtService.sign(payload, { expiresIn: '15m' });
            const recoveryUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${recoveryToken}`;

            const sendSmtpEmail = new Brevo.SendSmtpEmail();
            sendSmtpEmail.subject = 'Recuperación de contraseña - TechAccess';
            sendSmtpEmail.htmlContent = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #38a800;">Hola, ${user.name || 'Usuario'}</h2>
                    <p>Has solicitado restablecer tu contraseña en <strong>TechAccess</strong>.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${recoveryUrl}" style="background-color: #38a800; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px;">
                            Restablecer Contraseña
                        </a>
                    </div>
                </div>`;
            sendSmtpEmail.sender = { name: 'TechAccess', email: 'senatechaccess@gmail.com' };
            sendSmtpEmail.to = [{ email: user.email }];

            try {
                await this.apiInstance.sendTransacEmail(sendSmtpEmail);
                return { message: 'Si el correo está registrado, recibirá instrucciones en breve.' };
            } catch (err: any) {
                console.error('Error enviando mail por API:', err?.body ?? err?.message ?? err);
                throw new Error('No se pudo enviar el correo de recuperación');
            }
        }

        return { message: 'Si el correo está registrado, recibirá instrucciones en breve.' };
    }

    async resetPassword(token: string, newPassword: string) {
        try {
            const payload = this.jwtService.verify(token);
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            return await this.usersService.updatePassword(payload.email, hashedPassword);
        } catch (error) {
            throw new UnauthorizedException('El enlace ha expirado o es inválido');
        }
    }
}