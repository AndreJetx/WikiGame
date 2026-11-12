import { z } from "zod";
import { normalizePower } from "./power";

export const OPPONENT_OUTCOMES = ["won", "close", "lost"] as const;
export const OPPONENT_ATTENTIONS = ["reach", "caution"] as const;

function cleanText(value: string, max: number): string {
  return value
    .replace(/\0/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

const passwordSchema = z
  .string()
  .min(6, "A senha precisa ter pelo menos 6 caracteres.")
  .max(128, "A senha é longa demais.")
  .refine((value) => !/[\u0000-\u001F]/.test(value), "Senha inválida.");

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "O nome de usuário precisa ter pelo menos 3 caracteres.")
  .max(32, "O nome de usuário é longo demais.")
  .regex(/^[a-z0-9._-]+$/, "Use letras, números, ponto, hífen ou underline.");

export const opponentLoginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

export const opponentInputSchema = z.object({
  name: z
    .string()
    .transform((value) => cleanText(value, 80))
    .pipe(z.string().min(1, "Informe o nome do oponente.").max(80)),
  totalPower: z.string().transform((value, ctx) => {
    const normalized = normalizePower(value);
    if (!normalized) {
      ctx.addIssue({ code: "custom", message: "Informe o poder, como 1,5b ou 2t." });
      return z.NEVER;
    }
    return normalized;
  }),
  outcome: z.enum(OPPONENT_OUTCOMES),
  stats: z
    .array(
      z.object({
        name: z
          .string()
          .transform((value) => cleanText(value, 40))
          .pipe(z.string().min(1, "Informe o nome do status.").max(40)),
        value: z
          .string()
          .transform((value) => cleanText(value, 40))
          .pipe(z.string().min(1, "Informe o valor do status.").max(40)),
        attention: z.enum(OPPONENT_ATTENTIONS),
      }),
    )
    .max(24, "Um oponente pode ter no máximo 24 status."),
});

export type OpponentInput = z.infer<typeof opponentInputSchema>;
