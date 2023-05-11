const express = require("express");
const router = express.Router();
const formation = require("../models/formation");
const formateur = require("../models/formateur");
const reference = require("../models/reference");
const document = require("../models/document");
const user = require("../models/user");
const userDocument = require("../models/userDocument");
const auth = require("../middlewares/passport");
const multer = require("multer"); 
const notification = require("../models/notification");
const redacteurFormation = require("../models/redacteurFormation");
const invite = require("../models/invite");
const sendMail = require("./sendMailController");
const sequelize = require("sequelize");
var fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/formation");
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname);
  },
});
const upload= multer({ storage: storage });
router.post("/saveFiche", auth, upload.single("file"),(req, res) => {
  if(typeof req.body.idFormation !=="undefined")
  formation.update({fiche: req.body.name},
      { where: { id: req.body.idFormation } }
    )
  res.send({ filename: req.body.name });
});
 
router.post("/addFormation",auth, (req, res) => {
  var service = null;
  if(req.body.service !=null) service = req.body.service.value
  formation.create({
      id_reference: req.body.reference.value,
      id_service: service,
      etat: req.body.etat.value,
      sujet: req.body.sujet,
      date: req.body.date,
      heurD: req.body.heurD,
      heurF: req.body.heurF,
      type: req.body.type.value,
      lieu: req.body.lieu,
      fiche: req.body.fileVal,
      typeFormation: req.body.typeFormation.value,
    })
    .then((r) => {
      userDocument.findAll({where:{id_document:req.body.reference.idDoc,type:1}}).then((red) => {
        red.forEach(element => {
          redacteurFormation.create({
            id_formation:r.id,
            id_user: element.id_user,
          })          
        });
      })
      req.body.formateur.forEach(element => {
        formateur.create({
          id_formation:r.id,
          id_user: element.value,
        }).then((r) => {
        })
      });
      if(req.body.service !=null)
       {notification.create({
          id_user: null,
          lu: 0,
          etape: 14,
          accept: 4,
          id_service: req.body.service.value,
        });} 
    
        if(req.body.service !=null) 
          {user.findAll({where:{id_service: req.body.service.value}}).then((us) => { 
          
            us.forEach(el1=>{
              var msg = "";
              var type = req.body.type.value == 2 ?"Webinaire":"Présentiel";
              var lieu = req.body.type.value == 2 ?"<a href="+req.body.lieu+">Cliquez-ici </a>":req.body.lieu;
              msg += ` <tr><td style="padding-top:5px;"> Sujet :${req.body.sujet} </td></tr>`;
              msg += ` <tr><td style="padding-top:5px;"> Date :${req.body.date} ,Heure début: ${req.body.heurD},Heure fin: ${req.body.heurF}  </td></tr>`;
              msg += ` <tr><td style="padding-top:5px;"> type :${type} </td></tr>`;
              msg += ` <tr><td style="padding-top:5px;"> Lieu :${lieu} </td></tr>`;
              //sendMail("Nouvelle formation",msg,el1.dataValues.email,el1.dataValues.nom_prenom); 
            })
          })}
      return res.status(200).send(r);
    })
    .catch((error) => {
      return res.status(403).send(error);
    });
});

router.post("/addInvite", auth, (req, res) => {
  var id = req.body.id;
  var inviteListe = req.body.invite;
  inviteListe.forEach(element => {
    invite
      .create({
        id_formation: id,
        id_user:element.value
      })
      .then((r) => {
        notification.create({
          id_user: element.value,
          lu: 0,
          etape: 14,
          accept: 4,
          id_service: null,
        });
      })
      .catch((error) => {
        return res.status(403).send(false);
      });   
      return res.status(200).send(true); 
  });
  
});

router.get("/getFormateur/:id",auth, (req, res) => {
  formateur.findAll({ where:{id_formation:req.params.id},include: ["users"] })
  .then(function (forma) {
    redacteurFormation.findAll({ where:{id_formation:req.params.id},include: ["users"] })
    .then(function (red) {
      var chFormateur="Formateur :";
      var chRedacteur="";
      forma.forEach(e1=>{
        chFormateur+=e1.users.nom_prenom+",";
      })
      red.forEach(e1=>{
        chFormateur+=e1.users.nom_prenom+",";
      })
      return res.status(200).send({formateur:chFormateur,redacteur:chRedacteur});
    })
  })
})

router.post("/allFormation",auth, (req, res) => { 
  if (req.body.idRole == 4 || req.body.idRole == 3) {
    formation.findAll({ where:sequelize.where(sequelize.fn('YEAR', sequelize.col('date')), new Date().getFullYear()),include: ["referencedocs", "services"] })
      .then(function (r) {
        return res.status(200).send(r);
      })
      .catch(function (err) {
        return res.status(403).send([]);
      });
  } else {
 
      formation.findAll({
          where: { id_service: req.body.idServie },
          include: ["referencedocs", "services"], 
        })
        .then(function (r) {
          if(req.body.idRole == 7){ 
            invite.findAll({
              where: { id_user: req.body.idUser },
              include: [{model:formation,as:"formations",include: ["referencedocs", "services"]}, "users"], 
            })
            .then(function (four) { 
              var list = r;
              four.forEach(e=>{
                list.push(e.formations)
              })
              return res.status(200).send(list); 
            })
          } else {
            return res.status(200).send(r);
          }
      })
      .catch(function (err) {
        return res.status(403).send([]);
      });
  }
});

router.put("/changeEtat/:id",auth, (req, res) => {
  var id = req.params.id;
  formation.findOne({ where: { id: id } }).then(function (u) {
    if (!u) {
      return res.status(403).send(false);
    } else {
      formation.update(
          {
            etat: 1,
          },
          { where: { id: id } }
        )
        .then((f) => {
          reference.findOne({ where: { id: u.dataValues.id_reference } })
            .then(function (r) {
              document
                .update(
                  {
                    etat: 10,
                  },
                  { where: { id: r.dataValues.id_document } }
                )
                .then(function (d) {
                  return res.status(200).send(true);
                });
            });
        })
        .catch((error) => {
          return res.status(403).send(false);
        });
    }
  });
});

router.get("/getFile/:file", (req, res) => {
  if (fs.existsSync("./upload/formation/" + req.params.file)) {
    var file = fs.createReadStream("./upload/formation/" + req.params.file);
    file.pipe(res);
  } else return res.status(403).json({ message: false });
});
 
router.post("/addFormationOld",auth, (req, res) => {
  var service = null;
  if(req.body.service !=null) service = req.body.service.value
  formation.create({
      id_reference: req.body.reference.value,
      id_service: service,
      etat: req.body.etat.value,
      sujet: req.body.sujet,
      date: req.body.date,
      heurD: req.body.heurD,
      heurF: req.body.heurF,
      type: req.body.type.value,
      lieu: req.body.lieu,
      fiche: req.body.fileVal,
      typeFormation: req.body.typeFormation.value,
    })
    .then((r) => {
      userDocument.findAll({where:{id_document:req.body.reference.idDoc,type:1}}).then((red) => {
        red.forEach(element => {
          redacteurFormation.create({
            id_formation:r.id,
            id_user: element.id_user,
          })          
        });
      })
      req.body.formateur.forEach(element => {
        formateur.create({
          id_formation:r.id,
          id_user: element.value,
        }).then((r) => {
        })
      });
      return res.status(200).send(r);
    })
    .catch((error) => {
      return res.status(403).send(error);
    });
});
module.exports = router;
