const nodemailer = require('nodemailer')

const sendEmail = async (receiver, subject, content) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.GMAIL,
            pass: process.env.GMAIL_PASS,
        },
    })
    try {
        await transporter.sendMail({
            from: process.env.GMAIL,
            to: receiver,
            subject: subject,
            html: `${content}`,
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports = sendEmail
