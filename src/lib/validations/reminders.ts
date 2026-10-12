import { z } from "zod";

export const reminderSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul pengingat wajib diisi.")
    .max(100, "Judul pengingat maksimal 100 karakter."),
  amount: z.coerce
    .number()
    .positive("Nominal harus lebih besar dari 0.")
    .optional()
    .nullable(),
  frequency: z.enum(["daily", "weekly", "monthly"], {
    message: "Frekuensi pengingat harus harian, mingguan, atau bulanan.",
  }),
  reminder_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format waktu harus JJ:MM (contoh: 19:00).")
    .default("19:00"),
  day_of_week: z.coerce
    .number()
    .min(0)
    .max(6)
    .optional()
    .nullable(),
  day_of_month: z.coerce
    .number()
    .min(1)
    .max(31)
    .optional()
    .nullable(),
});

export type ReminderInput = z.infer<typeof reminderSchema>;
