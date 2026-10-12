import { z } from "zod";

export const budgetSchema = z.object({
  category_id: z.string().uuid("Kategori wajib dipilih."),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Format bulan harus YYYY-MM.")
    .transform((val) => `${val}-01`),
  limit_amount: z.coerce
    .number()
    .positive("Batas anggaran harus lebih besar dari 0.")
    .max(999999999999, "Nominal melebihi batas wajar."),
});

export type BudgetInput = z.infer<typeof budgetSchema>;
