import { z } from "zod";

export const warungItemSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, "Nama menu/item wajib diisi.")
    .max(80, "Nama menu maksimal 80 karakter."),
  qty: z.coerce
    .number()
    .int("Jumlah harus berupa angka bulat.")
    .min(1, "Jumlah minimal 1."),
  price: z.coerce
    .number()
    .min(0, "Harga tidak boleh negatif."),
  subtotal: z.coerce.number().min(0).optional(),
});

export const warungOrderSchema = z.object({
  warung_name: z
    .string()
    .trim()
    .min(1, "Nama warung wajib diisi.")
    .max(100, "Nama warung maksimal 100 karakter."),
  items: z
    .array(warungItemSchema)
    .min(1, "Minimal harus ada 1 item pesanan."),
  is_paid: z.boolean().default(false),
  ordered_at: z
    .string()
    .min(1, "Tanggal dan waktu pembelian wajib diisi."),
  notes: z
    .string()
    .trim()
    .max(500, "Catatan maksimal 500 karakter.")
    .optional()
    .nullable(),
  account_id: z.string().uuid("ID Akun tidak valid.").optional().nullable(),
  auto_deduct: z.boolean().optional().default(false),
});

export type WarungItemInput = z.infer<typeof warungItemSchema>;
export type WarungOrderInput = z.infer<typeof warungOrderSchema>;
