const express = require("express");
const router = express.Router();
const pdf = require("pdf-creator-node");
const path = require("path");
const options = require("../helpers/options");
var reference = require("../models/reference");
var userDocument = require("../models/userDocument");
var user = require("../models/user");
var fs = require("fs");
const auth = require("../middlewares/passport");
resolve = require('path').resolve

//generer fichier pdf by idDocument et idUser(approbateur)
router.get("/generatePdfSign/:idDoc/:idApp", auth, (req, res) => {
  const html = fs.readFileSync(
    path.join(__dirname, "../views/template.html"),
    "utf-8"
  );
  let array = [];
  reference.findOne({
      where: { id_document: req.params.idDoc },
      include: ["documents", "users"],
    })
    .then(function (ref) {
      userDocument.findAll({
          where: { id_document: req.params.idDoc },
          order:["type"],
          include: ["users"],
        })
        .then(function (userDoc) {
          user.findOne({ where: { id: req.params.idApp } }).then(function (app) {
            /** start formating date**/
            var dateRef = new Date(ref.dataValues.updatedAt);
            var dateR =dateRef.getDate() +"-" +(dateRef.getMonth() + 1) +"-" +dateRef.getFullYear();
            
            var dateAppro = new Date();
            var dateA =dateAppro.getDate() +"-" +(dateAppro.getMonth() + 1) +"-" +dateAppro.getFullYear();
            
            var dateResQ = new Date(ref.dataValues.updatedAt);
            var dateRQ =dateResQ.getDate() +"-" +(dateResQ.getMonth() + 1) +"-" +dateResQ.getFullYear();
            /** end formating date**/
            const filename = ref.dataValues.reference.replaceAll(" ","")+ ".pdf"; 
            var appImgB64 = fs.readFileSync('./upload/signature/'+app.dataValues.signature, {encoding: 'base64'});
            var appImg = "data:image/jpeg;base64,"+appImgB64;
            var objApprobateur = {
              role:"Approbateur",
              nom_prenom: app.dataValues.nom_prenom,
              fonction: app.dataValues.fonction,
              signature:  appImg,
              date: dateA,
            }; 
            appImgB64 = fs.readFileSync('./upload/signature/'+ref.dataValues.users.signature, {encoding: 'base64'});
            appImg = "data:image/jpeg;base64,"+appImgB64;
            var objRQ = {
              role:"Vérificateur Qualité",
              nom_prenom: ref.dataValues.users.nom_prenom,
              fonction: ref.dataValues.users.fonction,
              signature:  appImg,
              date: dateRQ, 
            }; 
           
            userDoc.forEach((us) => {            
              var dateUser = new Date(us.updatedAt);
              var dateU =dateUser.getDate() +"-" +(dateUser.getMonth() + 1) +"-" +dateUser.getFullYear();
              var type = us.type==1?"Rédacteur":"Vérificateur";
              appImgB64 = fs.readFileSync('./upload/signature/'+us.users.signature, {encoding: 'base64'});
              appImg = "data:image/jpeg;base64,"+appImgB64;
              const prod = {

                role:type,
                nom_prenom: us.users.nom_prenom,
                fonction: us.users.fonction,
                signature:  appImg,
                date: dateU, 
              };
              array.push(prod);
            }); 
            array.push(objApprobateur);
            array.push(objRQ);
            const obj = {
              date:dateR,
              reference:ref.dataValues.reference,
              titre:ref.dataValues.documents.titre,
              prodlist: array,
              approbateur: objApprobateur,
              responsable: objRQ,
            };
            const document = {
              html: html,
              data: {
                documents: obj,
              },
              path: "./docs/" + filename,
            };
            pdf
              .create(document, options)
              .then(() => {
                return res.status(200).json(true);
              })
              .catch(() => {
                return res.status(200).json(false);
              });
          });
        });
    });
});
module.exports = router;
