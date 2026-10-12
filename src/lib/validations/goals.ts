import { z } from "zod";

export const goalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama target tabungan wajib diisi.")
    .max(100, "Nama target maksimal 100 karakter."),
  target_amount: z.coerce
    .number()
    .positive("Nominal target harus lebih besar dari 0.")
    .max(999999999999, "Nominal melebihi batas wajar."),
  initial_amount: z.coerce
    .number()
    .min(0, "Saldo awal target tidak boleh negatif.")
    .default(0),
  deadline: z.string().optional().nullable(),
  color: z.string().trim().max(30).optional().nullable(),
});

export const contributionSchema = z.object({
  goal_id: z.string().uuid("ID target tabungan tidak valid."),
  amount: z.coerce
    .number()
    .positive("Nominal setoran/penarikan harus lebih besar dari 0."),
  contribution_type: z.enum(["deposit", "withdrawal"], {
    message: "Tipe kontribusi harus setoran atau penarikan.",
  }),
  account_id: z.string().uuid().optional().nullable(),
});

export type GoalInput = z.infer<typeof goalSchema>;
export type ContributionInput = z.infer<typeof contributionSchema>;
