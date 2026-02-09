import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("Acesso negado: usuário não encontrado no token");
    }

    if (user.role === "super_admin") {
      request.shopId = null;
      request.userRole = user.role;
      request.isSuperAdmin = true;
      return true;
    }

    if (!user.shopId) {
      throw new ForbiddenException("Acesso negado: shopId não encontrado no token");
    }

    request.shopId = user.shopId;
    request.userRole = user.role;
    request.isSuperAdmin = false;

    return true;
  }
}
