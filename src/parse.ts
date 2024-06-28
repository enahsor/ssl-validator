import {
  MinimumCertificateAgeDaysSchema,
  URLsFilePathSchema,
  SMTPPasswordSchema,
  SMTPServerSchema,
  SMTPUsernameSchema
} from "./arguments";
import { z } from "zod";
import fs from "fs";
import nodemailer from "nodemailer";

function getValue<T>(
  schema: z.Schema<T>,
  key: string,
  args: Record<string, any>
) {
  if (!(key in args)) {
    console.log(args);
    throw new Error(`Missing required argument: ${key}`);
  }
  const { success, error, data } = schema.safeParse(args[key]);
  if (!success) {
    throw new Error(`Invalid value for ${key}: ${error.message}`);
  }
  return data;
}

function isFile(path: string) {
  const stats = fs.statSync(path);
  return stats.isFile();
}

export default async function parse(args: Record<string, any>) {
  const minimumCertificateAgeDays = getValue(
    MinimumCertificateAgeDaysSchema,
    "minimumCertificateAgeDays",
    args
  );

  const urlsFilePath = getValue(URLsFilePathSchema, "urlsFilePath", args);
  if (!isFile(urlsFilePath)) {
    throw new Error(`URLs file path does not exist: ${urlsFilePath}`);
  }

  if (args.testing) {
    const testAccount = await nodemailer.createTestAccount();
    return {
      minimumCertificateAgeDays,
      urlsFilePath,
      smtpHost: testAccount.smtp.host,
      smtpUsername: testAccount.user,
      smtpPassword: testAccount.pass,
      smtpPort: testAccount.smtp.port
    };
  }

  const smtpHost = getValue(SMTPServerSchema, "smtpHost", args);
  const smtpUsername = getValue(SMTPUsernameSchema, "smtpUsername", args);
  const smtpPassword = getValue(SMTPPasswordSchema, "smtpPassword", args);
  const smtpPort = getValue(z.number(), "smtpPort", args);

  const sendTo = getValue(z.string().email(), "sendTo", args);

  return {
    minimumCertificateAgeDays,
    urlsFilePath,
    smtpHost,
    smtpUsername,
    smtpPassword,
    smtpPort,
    sendTo
  };
}
