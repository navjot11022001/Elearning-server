require("dotenv").config();
import nodemailer, { Transporter } from "nodemailer";
import ejs from "ejs";
import path from "path";

interface IEmailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

export const sendMail = async ({
  email,
  subject,
  template,
  data,
}: IEmailOptions): Promise<void> => {
  try {
    const transport: Transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    //get thh path to the email template file
    const templatePath = path.join(__dirname, "../mails", template);

    //rendet the email templatet
    const html: string = await ejs.renderFile(templatePath, data);
    const mailOptions = {
      from: `Learners.in <${process.env.SMTP_MAIL}>`,
      to: email,
      subject,
      html,
    };
    await transport.sendMail(mailOptions);
  } catch (err) {
    console.log("Error in sending email", err);
  }
};
