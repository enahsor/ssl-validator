import fs from "fs";
import https from "https";
import { Certificate, TLSSocket } from "tls";
import { URLSchema } from "./arguments";
import nodemailer from "nodemailer";

export function readFileSync(path: string) {
  const content = fs.readFileSync(path, "utf-8");
  return content;
}

type SSLCertificateInfo = {
  subject: Certificate;
  issuer: Certificate;
  validFrom: Date;
  validTo: Date;
  daysRemaining: number;
};

export async function getSSLCertificateInfo(
  host: string,
  timeout = 8000
): Promise<SSLCertificateInfo> {
  const options: https.RequestOptions = {
    agent: false,
    method: "HEAD",
    port: 443,
    rejectUnauthorized: false,
    host
  };

  // Add timeout
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("Request timed out"));
    }, timeout);

    try {
      const request = https.request(options, (response) => {
        clearTimeout(timeoutId);
        const socket = response.socket as TLSSocket;
        const certificate = socket.getPeerCertificate();
        if (certificate) {
          const validFrom = new Date(certificate.valid_from);
          const validTo = new Date(certificate.valid_to);
          const daysRemaining = Math.floor(
            (validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          resolve({
            subject: certificate.subject,
            issuer: certificate.issuer,
            validFrom,
            validTo,
            daysRemaining
          });
        } else {
          reject(new Error("No certificate found"));
        }
      });
      request.on("error", (error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
      request.end();
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

export function getUrlHost(url: string) {
  return new URL(url).host;
}

export function isValidUrl(url: string) {
  const { success } = URLSchema.safeParse(url);
  return success;
}

type TransporterOptions = {
  host: string;
  port?: number;
  user: string;
  password: string;
};

type MailOptions = {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

type SendEmailOptions = {
  transporterOptions: TransporterOptions;
  mailOptions: MailOptions;
};

export async function sendEmail({
  transporterOptions: { port = 587, host, user, password },
  mailOptions
}: SendEmailOptions) {
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: password
    }
  });
  const info = await transporter.sendMail(mailOptions);
  return info.messageId;
}

export async function sendSslExpirationEmail({
  transporterOptions,
  mailOptions,
  url,
  certificateInfo
}: {
  transporterOptions: TransporterOptions;
  mailOptions: Pick<MailOptions, "from" | "to">;
  url: string;
  certificateInfo: SSLCertificateInfo;
}) {
  const subject = `SSL Certificate for ${url} is about to expire`;
  const text = `The SSL certificate for ${url} is about to expire in ${certificateInfo.daysRemaining} days.\nPlease renew the certificate.`;
  const messageId = await sendEmail({
    transporterOptions,
    mailOptions: {
      from: mailOptions.from,
      subject,
      to: mailOptions.to,
      text
    }
  });
  return messageId;
}
