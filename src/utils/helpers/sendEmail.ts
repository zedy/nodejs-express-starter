import { createTransport } from 'nodemailer';
import { Attachment } from 'nodemailer/lib/mailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

const EMAIL_TYPES_ENUM = 'user-created';
const FROM_EMAIL = 'support@mywebsite.com';

interface SendEmail {
  from?: string;
  to: string;
  name: string;
  type: string;
}

export default async function sendEmail({
  type,
  from,
  name,
  to,
}: SendEmail) {
  let transport;

  if (process.env.ENV === 'dev') {
    transport = createTransport({
      // @ts-ignore
      port: process.env.MAILTRAP_PORT,
      host: process.env.MAILTRAP_HOST,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  } else {
    transport = createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.SERVICE_EMAIL,
        serviceClient: process.env.SERVICE_CLIENT_ID,
        privateKey: process.env.SERVICE_PRIVATE_KEY,
      },
    });
  }

  // point to the template folder
  const handlebarOptions = {
    viewEngine: {
      partialsDir: path.resolve('./views/'),
      defaultLayout: false,
    },
    viewPath: path.resolve('./views/'),
  };

  // use a template file with nodemailer
  transport.use('compile', hbs(handlebarOptions));

  const subject = () => {
    switch (type) {
      case 'user-created':
        return 'User account created';

      default:
        return null;
    }
  };

  const htmlBody = () => {
    switch (type) {
      case 'user-created':
        return {
          welcomeText: `Welcome ${name}`,
          contentText: 'Lorem Ipsum',
          url: 'http://mywebsite.com/login',
          urlPrefixMsg: 'To login',
          urlMsg: 'click here',
        };

      default:
        return null;
    }
  };

  const message = {
    from: from || FROM_EMAIL,
    to,
    subject: subject(),
    template: 'index',
    context: htmlBody(),
  };

  return transport.sendMail(message);
}
