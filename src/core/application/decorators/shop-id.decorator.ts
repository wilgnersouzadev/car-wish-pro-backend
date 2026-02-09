import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const ShopId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  if (request.isSuperAdmin && request.query?.shopId) {
    return parseInt(request.query.shopId);
  }
  return request.shopId || request.user?.shopId;
});
