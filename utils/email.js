const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');


const sendEmail = catchAsync(async options => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    // email options
    const mailOptions = {
        from: "Ghana <test@gmail.com>",
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    }

    // send email with nodemailer
    await transporter.sendMail(mailOptions)
});


module.exports = sendEmail;