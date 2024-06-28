import { z } from "zod";

export const MinimumCertificateAgeDaysSchema = z.number().int().positive();
export const URLSchema = z.string().url();
export const URLsSchema = z.array(URLSchema);
export const URLsFilePathSchema = z.string();
export const SMTPServerSchema = z.string().url();
export const SMTPUsernameSchema = z.string().email();
export const SMTPPasswordSchema = z.string();

export type MinimumCertificateAgeDays = z.infer<
  typeof MinimumCertificateAgeDaysSchema
>;
export type URL = z.infer<typeof URLSchema>;
export type URLs = z.infer<typeof URLsSchema>;
export type URLsFilePath = z.infer<typeof URLsFilePathSchema>;
export type SMTPServer = z.infer<typeof SMTPServerSchema>;
export type SMTPUsername = z.infer<typeof SMTPUsernameSchema>;
export type SMTPPassword = z.infer<typeof SMTPPasswordSchema>;
