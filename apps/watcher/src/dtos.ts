import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export type availableCoins = 'EGLD' | 'ESDT';

export const availableCoinsSchema = z.object({
  coin: z.enum(['EGLD', 'ESDT']),
});

export const addressIdSchema = z.object({
  addressId: z.string().min(10),
});

export class availableCoinsDTO extends createZodDto(availableCoinsSchema) {}
export class addressDTO extends createZodDto(addressIdSchema) {}
