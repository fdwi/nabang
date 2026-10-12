import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Masukkan alamat email yang valid.").max(254),
  password: z.string().min(6, "Kata sandi minimal 6 karakter.").max(128),
});
