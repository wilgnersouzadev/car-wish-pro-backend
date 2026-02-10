import { ApiProperty } from "@nestjs/swagger";

export class PaginationMeta {
  @ApiProperty({ description: "Total de registros" })
  total: number;

  @ApiProperty({ description: "Página atual" })
  page: number;

  @ApiProperty({ description: "Itens por página" })
  limit: number;

  @ApiProperty({ description: "Total de páginas" })
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
