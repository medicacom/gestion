const express = require("express");
const router = express.Router();
var nodemailer = require("nodemailer");
var app = express();

app.use(express.json());

//mdp mail y489DB10rt
const sendMail = function (sujet, msg,mail,nom) {
  try {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "gestiondocuments0@gmail.com",
        pass: "edyxqqeegpxdjzwx",
      },
      starttls: {
        enable: true
    },
    secureConnection: true,
      rejectUnauthorized: false,
    });

    message = {
      from: "gestiondocuments0@gmail.com",
      to: mail,
      subject: sujet,
      html: `
      <table style="width:500px;padding:20px; font-family:calibri;  margin:0 auto; color:#263476; 
        border:1px solid rgb(0, 165, 231);">
          <tr>
              <td colspan="4" style="text-align:center;">
                  <h1>Gestions des documents</h1>
              </td>
          </tr>
          <tr>
              <td colspan="3"
                  style="padding-top:15px;text-align:center; font-size:12px; border-top:1px dashed rgb(0, 165, 231); ">
              </td>
          </tr>
          <tr>
              <td><strong>Bonjour ${nom} , </strong></td>

          </tr>
         ${msg}
        </table>
      `,
    };
    transporter.sendMail(message, function (error, info) {
      if (error) {
        console.log(error);
      } else {
      }
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = sendMail;
