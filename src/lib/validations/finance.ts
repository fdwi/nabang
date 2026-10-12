import { z } from "zod";

export const accountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama akun wajib diisi.")
    .max(80, "Nama akun maksimal 80 karakter."),
  account_type: z.enum(["cash", "bank", "ewallet", "other"], {
    message: "Tipe akun tidak valid.",
  }),
  opening_balance: z.coerce
    .number()
    .min(0, "Saldo awal tidak boleh bernilai negatif."),
});

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi.")
    .max(60, "Nama kategori maksimal 60 karakter."),
  type: z.enum(["income", "expense"], {
    message: "Tipe kategori harus pemasukan atau pengeluaran.",
  }),
  color: z.string().trim().max(30).optional().nullable(),
  icon: z.string().trim().max(40).optional().nullable(),
});

export const transactionSchema = z
  .object({
    type: z.enum(["income", "expense", "transfer"], {
      message: "Jenis transaksi tidak valid.",
    }),
    amount: z.coerce
      .number()
      .positive("Nominal harus lebih besar dari 0.")
      .max(999999999999, "Nominal melebihi batas maksimum."),
    account_id: z.string().uuid("Akun sumber wajib dipilih."),
    destination_account_id: z.string().uuid().optional().nullable(),
    category_id: z.string().uuid().optional().nullable(),
    description: z
      .string()
      .trim()
      .max(500, "Catatan maksimal 500 karakter.")
      .optional()
      .nullable(),
    occurred_at: z.string().min(1, "Tanggal dan waktu transaksi wajib diisi."),
  })
  .superRefine((data, ctx) => {
    if (data.type === "transfer") {
      if (!data.destination_account_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Akun tujuan transfer wajib dipilih.",
          path: ["destination_account_id"],
        });
      } else if (data.destination_account_id === data.account_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Akun tujuan harus berbeda dari akun sumber.",
          path: ["destination_account_id"],
        });
      }
    } else {
      if (!data.category_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Kategori wajib dipilih untuk pemasukan dan pengeluaran.",
          path: ["category_id"],
        });
      }
    }
  });

export type AccountInput = z.infer<typeof accountSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
