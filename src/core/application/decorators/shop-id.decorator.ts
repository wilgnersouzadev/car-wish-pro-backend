import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const ShopId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  // Super admin pode passar shopId como query param para ver dados de uma loja específica
  if (request.isSuperAdmin && request.query?.shopId) {
    return parseInt(request.query.shopId);
  }
  return request.shopId || request.user?.shopId;
});
