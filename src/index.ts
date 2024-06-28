import minimist from "minimist";
import parse from "./parse";

import {
  getSSLCertificateInfo,
  getUrlHost,
  isValidUrl,
  readFileSync,
  sendSslExpirationEmail
} from "./lib";

async function main() {
  const unparsedArgs = minimist(process.argv.slice(2));
  const args = await parse(unparsedArgs);

  const urls = readFileSync(args.urlsFilePath).split("\n");

  // Validate URLs
  urls.forEach((url) => {
    if (!isValidUrl(url)) {
      throw new Error(`Invalid URL: ${url}`);
    }
  });

  console.log(urls.length);

  for (const url of urls) {
    console.log(`Checking ${url} ...`);

    const host = getUrlHost(url);

    const certificateInfo = await getSSLCertificateInfo(host).catch((error) => {
      console.error(
        `❌ Error getting certificate info for ${url}: ${error.message}`
      );
      return null;
    });

    if (certificateInfo) {
      const { daysRemaining } = certificateInfo;
      if (daysRemaining < args.minimumCertificateAgeDays) {
        const messageId = await sendSslExpirationEmail({
          certificateInfo,
          url,
          transporterOptions: {
            host: args.smtpHost,
            user: args.smtpUsername,
            password: args.smtpPassword
          },
          mailOptions: {
            from: args.smtpUsername,
            to: args.smtpUsername
          }
        }).catch((error) => {
          console.error(`Error sending email for ${url}: ${error.message}`);
          return null;
        });
        if (messageId) {
          console.log(`➡️ Email sent for ${url}: ${messageId}`);
        } else {
          console.log(`🥹 Email not sent for ${url}`);
        }
      } else {
        console.log(`✅ Certificate is valid for ${url}`);
      }
    } else {
      console.log(`❌ No certificate found for ${url}`);
    }
  }
}

main()
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
