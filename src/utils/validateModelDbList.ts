import type { ZodObject } from 'zod';
import type z from 'zod';

export function validateModelDbList<
  TModel extends { id: string },
  TSchema extends ZodObject,
>(list: TModel[], schema: TSchema): z.infer<TSchema>[] {
  const results: z.infer<TSchema>[] = [];
  for (const item of list) {
    const validated = schema.safeParse(item);

    if (!validated.success) {
      console.warn(
        `Invalid element retrieved from database with id: ${item.id}`,
      );
      continue;
    }
    results.push(validated.data);
  }

  return results;
}
