import { Body, Controller, Get, Header, Post, Request, UseGuards } from '@nestjs/common';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/auth.guard';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() body: LoginDto) {
        const user = await this.authService.validateUser(
            body.email,
            body.password,
        );
        return this.authService.login(user);
    }

    /**
     * Endpoint para la recuperación de contraseña.
     * Recibe el email desde el frontend (Angular).
     */
    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        return this.authService.sendRecoveryEmail(email);
    }

    /**
     * Verifica el estado del token JWT.
     * Incluye headers para evitar el almacenamiento en caché de la respuesta.
     */
    @Get('check-status')
    @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    @Header('Pragma', 'no-cache')
    @Header('Expires', '0')
    @UseGuards(JwtAuthGuard)
    checkStatus(@Request() req) {
        return this.authService.checkStatus(req.user);
    }
    // src/auth/controllers/auth.controller.ts

    @Post('reset-password')
    async reset(@Body() body: { token: string, newPassword: string }) {
        return this.authService.resetPassword(body.token, body.newPassword);
    }
}