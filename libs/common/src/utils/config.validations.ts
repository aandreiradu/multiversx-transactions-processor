import z, { ZodSchema } from 'zod';

const envValidationSchema = z.object({
  gatewayURL: z.string().url(),
});

export const validate = <T extends ZodSchema>(config: Record<string, T>) => {
  const schemaValidation = envValidationSchema.safeParse(config);

  if (schemaValidation.success === false) {
    throw new Error(schemaValidation.error.message);
  }

  return config;
};
