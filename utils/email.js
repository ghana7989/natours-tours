const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');
const pug = require('pug');
const { htmlToText } = require("html-to-text")

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email,
      this.firstName = user.name.split(' ')[0] || user.name,
      this.url = url,
      this.from = `Ghana 7989 <${process.env.EMAIL_FROM}>`
  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Send Grid
      return null;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    })
  }
  async send(template, subject) {
    // Render HTML based on pug template
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    })
    // email Options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    }
    // Create  a transport and send email
    await this.newTransport().sendMail(mailOptions)
  }
  async sendWelcome() {
    await this.send('welcome', "Hey there! Welcome to the Natours Family")
  }

  async sendPasswordReset() {
    await this.send('passwordReset',"Your password reset token is valid for only 10 mins" )
  }

}


