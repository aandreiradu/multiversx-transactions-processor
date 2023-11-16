import z, { ZodSchema } from 'zod';

const envValidationSchema = z.object({
  gatewayURL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  RABBIT_MQ_URI: z.string().min(1),
  RABBIT_MQ_MVX_TRANSACTIONS_QUEUE: z.string().min(1),
  REDIS_HOST: z.string().min(1),
});

export const validate = <T extends ZodSchema>(config: Record<string, T>) => {
  const schemaValidation = envValidationSchema.safeParse(config);

  if (schemaValidation.success === false) {
    throw new Error(schemaValidation.error.message);
  }

  return config;
};
