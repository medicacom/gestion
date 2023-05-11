const express = require("express");
const router = express.Router();
var demande = require("../models/demande");
var demandeDocument = require("../models/demandeDocument");
const auth = require("../middlewares/passport");
const multer = require("multer");
var notification = require("../models/notification");
var user = require("../models/user");
var fs = require("fs");
const sendMail = require("./sendMailController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload/document");
  },
  filename: function (req, file, cb) {
    cb(null, "demande-"+file.originalname);
  },
});
const upload = multer({ storage: storage });
router.post("/saveFile", auth, upload.single("file"), (req, res) => {
  res.send(true);
});

router.post("/addDemande", auth, (req, res) => {
  var fileDemande = typeof(req.body.test) =="undefined" ?((req.body.fileVal!=null && req.body.fileVal != "") ?"demande-"+req.body.fileVal:""):req.body.fileVal
  demande
    .create({
      id_personnel: req.body.idPersonnel,
      descriptions: req.body.description,
      sujet: req.body.sujet,
      file: fileDemande,
      etat: 0,
      besoin: req.body.besoin,
      type: req.body.type,
      id_document: req.body.document,
      id_service: req.body.idService,
    })
    .then((d) => {

      demandeDocument
        .create({
          id_demande: d.id,
        })
        .then((r) => {

          
          user.findAll({where:{id_service:req.body.idService,id_role:2}}).then((u) => {
            u.forEach(element => {
              sendMail("Nouvelle demande","Nouvelle demande de document",element.dataValues.email,element.dataValues.nom_prenom);              
            });
              notification.create({
                id_user: req.body.idPersonnel,
                lu: 0,
                etape: 0,
                accept: 0,
              });
              return res.status(200).send(true);
          })
        })
        .catch((error) => {
          return res.status(403).send(false);
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(false);
    });
});
router.post("/allDemande/:id", auth, (req, res) => {
  demande
    .findAll(
      { where: { id_personnel: req.params.id } },
      { order: ["etat", "DESC"] }
    )
    .then(function (r) {
      return res.status(200).send(r);
    });
});
router.post("/getDemandeByRole/:role/:service", auth, (req, res) => {
  var etat = 0;
  var service ="";
  if (req.params.role == 3) { 
    service ={ etat: 1 } 
  }
  else{
    service = { etat: etat ,id_service:req.params.service }
  }
  demande
    .findAll({ where: service, include: ["users"] })
    .then(function (r) {
      return res.status(200).send(r);
    });
});
router.get("/getDemandeValider/:idService", auth, (req, res) => {
  demandeDocument
    .findAll({
      where: { id_document: null },
      include: {
        model: demande,
        as: "demandes",
        where: {
          etat: 3,
          id_service:req.params.idService
        },
      },
    })
    .then(function (r) {
      return res.status(200).send(r);
    });
});

//function pour changer etat du demande by idDemande/,idRole,eatat et idUser
router.put("/changeEtat/:id/:role/:etat/:idUser", auth, (req, res) => {
  var role = req.params.role;
  var etat = req.params.etat;
  var id = req.params.id;
  var idUser = req.params.idUser;
  var etatChange = 0;
  var etape = 1;
  var msg = "";
  var sujet ="";
  /** 
  * etatChange 
  * 1-Responsable hérachique accepte demande 
  * 2-Responsable hérachique refuse demande 
  * 3-Responsable qualité accepte demande 
  * 4-Responsable qualité refuse demande 
  **/
  if (role == 2 && etat == 0) {
    etatChange = 1;
  } else if (role == 2 && etat == 1) {
    etatChange = 2;
    msg = ` <tr><td colspan="4" style="padding-top:5px;"> Votre demande a été refusée</td></tr>`;
    sujet = `Votre demande a été refusée`;
  } else if (role == 3 && etat == 0) {
    etape = 2;
    etatChange = 3;
    msg = ` <tr><td colspan="4" style="padding-top:5px;"> Votre demande a été acceptée</td></tr>`;
    sujet = `Votre demande a été acceptée`;
  } else if (role == 3 && etat == 1) {
    etape = 2;
    etatChange = 4;
    msg = ` <tr><td colspan="4" style="padding-top:5px;"> Votre demande a été refusée</td></tr>`;
    sujet = `Votre demande a été refusée`;
  }
  demande.findOne({ where: { id: id },include:["users"] }).then(function (u) {
    if (!u) {
      return res.status(403).send(false);
    } else {
      if (role == 3 || role == 2) {
        demande
          .update(
            {
              etat: etatChange,
            },
            { where: { id: id } }
          )
          .then((r2) => {

            

            if(etatChange !=1)
              //sendMail(sujet,msg,u.dataValues.users.email,u.dataValues.users.nom_prenom); 
            if(etatChange ==3)
              user.findOne({where:{id_service:u.dataValues.users.id_service,id_role:2}}).then((rh) => { 
                msg = ` <tr><td colspan="4" style="padding-top:5px;"> Création un nouveau document</td></tr>`;
                sujet = `Création un nouveau document`;
                //sendMail(sujet,msg,u.dataValues.users.email,u.dataValues.users.nom_prenom);  
              })
            
            notification.create({
              id_user: u.id_personnel,
              lu: 0,
              etape: etape,
              accept: etatChange,
            });
            switch (role) {
              case "2":
                demandeDocument
                  .update(
                    {
                      id_rh: idUser,
                    },
                    { where: { id_demande: id } }
                  )
                  .then((r2) => {
                    return res.status(200).send(true);
                  })
                  .catch((error) => {
                    return res.status(403).send(false);
                  });
                break;
              case "3":
                demandeDocument
                  .update(
                    {
                      id_rq: idUser,
                    },
                    { where: { id_demande: id } }
                  )
                  .then((r2) => {
                    return res.status(200).send(true);
                  })
                  .catch((error) => {
                    return res.status(403).send(false);
                  });
                break;
            }
          })
          .catch((error) => {
            return res.status(403).send(false);
          });
      }
    }
  });
});

//Delete demande
router.delete("/deleteDemande/:id", auth, (req, res) => {
  var id = req.params.id;
  demande.findOne({ where: { id: id } }).then(function (r1) {
    if (!r1) {
      return res.status(403).send(false);
    } else {
      demandeDocument.destroy({ where: { id_demande: id } })
      .then((d) => {
        demande
          .destroy({ where: { id: id } })
          .then((d2) => {
            return res.status(200).send(true);
          })
          .catch((error) => {
            return res.status(403).send(false);
          });
      })
      .catch((error) => {
        return res.status(403).send(false);
      });
    }
  });
});

router.post("/getDemande", auth, (req, res) => {
  var id = req.headers["id"];
  demandeDocument.findOne({
      where: { id_demande: id },
      include: [
        { model: demande, as: "demandes", include: ["documents"] }
        ,"documents",
      ],
    })
    .then(function (r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        return res.status(200).json({demande:r1.dataValues,file:r1.dataValues.demandes.file});
      }
    });
});
router.get("/getFile/:file", (req, res) => {
  if (fs.existsSync("./upload/document/" + req.params.file)) {
    var file = fs.createReadStream("./upload/document/" + req.params.file);
    file.pipe(res);
  } else return res.status(403).json({ message: false });
});

module.exports = router; 
