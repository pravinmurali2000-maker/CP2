import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * This guard automatically uses the JwtStrategy (identified by the 'jwt' key)
 * to validate the JWT from the request's Authorization header.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
