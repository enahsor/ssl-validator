# SSL Validator

## Getting Started

1. `npm install`
2. `npm install -g typescript`
3. `npx tsc`
4. `node build/index.js --minimumCertificateAgeDays 30 --urlsFilePath urls.txt --smtpHost smtp.gmail.com --smtpPort 587 --smtpUsername someemail@domain.org --smtpPassword somepassword`

## Arguments

- `minimumCertificateAgeDays` (required): The minimum age of the certificate in days.

- `urlsFilePath` (required): The path to the file containing the URLs to check.

- `testing`: If set to `true`, the script will run in testing mode. This means that the script will not send any emails and will print the results to the console.

- `smptHost`: The SMTP host to use to send the email.

- `smtpPort`: The SMTP port to use to send the email.

- `smtpUsername`: The SMTP user to use to send the email.

- `smtpPassword`: The SMTP password to use to send the email.
