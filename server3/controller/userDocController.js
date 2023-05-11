const express = require("express");
const router = express.Router();
var userDocument = require("../models/userDocument");
var document = require("../models/document");
var etape = require("../models/etape");
var user = require("../models/user");
var questionnaire = require("../models/questionnaire");
var reponse = require("../models/reponse");
var reponseUser = require("../models/reponseUser");
var notification = require("../models/notification");
const auth = require("../middlewares/passport");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const multer = require("multer");

var referenceVigueur = require("../models/referenceVigueur");
const sendMail = require("./sendMailController");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload/document/");
  },
  filename: function (req, file, cb) {
    cb(null, "etape-"+file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/getUserDocByType/:id/:type", auth, (req, res) => {
  var arrayEtat = [];
  if (req.params.type == 2) arrayEtat = [1, 2, 3, 4, 5, 6];
  else arrayEtat = [1, 2, 3];
  userDocument
    .findAll({
      where: {
        etat: 0,
        date: { [Op.ne]: null },
        id_user: req.params.id,
        type: req.params.type,
      },
      include: {
        model: document,
        as: "documents",
        where: {
          etat: arrayEtat,
        },
      },
    })
    .then(function (r) {
      return res.status(200).send(r);
    });
});

router.get("/getUserDocByIdDoc/:idDoc/:idUser", auth, (req, res) => {
  userDocument
    .findAll({
      where: {
        id_document: req.params.idDoc,
        id_user:req.params.idUser
      },
      include:["documents"]
    })
    .then(function (r) {
      return res.status(200).send(r);
    });
});

router.get("/getEtape/:id1/:id2", auth, (req, res) => {
  etape
    .findAll({
      where: { id_document: req.params.id1 },
      include: {
        model: userDocument,
        as: "userdocuments",
        where: { type: req.params.id2 },
        include: ["users"],
      },
    })
    .then(function (r) {
      return res.status(200).send(r);
    });
});

router.post("/saveEtape", auth, (req, res) => {
  var array = req.body.fileList;
  array.forEach((e) => {
    if (e.id == null) {
      userDocument
        .findOne({
          where: {
            id_document: e.id_document,
            id_user: e.id_user,
            type: e.type,
          },
        })
        .then(function (r1) {
          etape.create({
            etape: e.etape,
            note: e.note,
            file: "etape-"+e.file,
            id_document: e.id_document,
            id_user: e.id_user,
            id_userdoc: r1.id,
          });
        });
    } else {
      etape.update(
        {
          note: e.note,
          file: e.file,
        },
        { where: { id: e.id } }
      );
    }
  });
  userDocument.findAll({ 
    where: {
      type: array[array.length-1].type, 
      id_document: array[array.length-1].id_document,
      id_user: { [Op.ne]: array[array.length-1].id_user }
    },
    include:["users","documents"] })
  .then((us) => {
    if(us.length>0)
      us.forEach(el1=>{
          var txt = "<tr><td>Une nouvelle étape est ajoutée par "+array[array.length-1].nom+"</td></tr>";
          var date = new Date();
          txt += "<tr><td>Date de début: "+date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear()+"</td></tr>";
          //sendMail("Une nouvelle étape est ajoutée",txt,el1.dataValues.users.email,el1.dataValues.users.nom_prenom); 
        })
      })
  return res.status(200).send(true);
});

router.get("/getDocVerification/:etat/:type", auth, (req, res) => {
  userDocument
    .findAll({
      where: { etat: 0, type: req.params.type },
      include: [
        {
          model: user,
          as: "users",
          attributes: [
            [
              Sequelize.fn("GROUP_CONCAT", Sequelize.col("nom_prenom")),
              "nom_prenom",
            ],
          ],
        },
        {
          model: document,
          as: "documents",
          where: {
            etat: req.params.etat,
          },
        },
      ],
      group: ["id_document"],
    })
    .then(function (r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        return res.status(200).json(r1);
      }
    });
});

router.post("/saveFile", auth, upload.single("file"), (req, res) => {
  res.send(true);
});

router.delete("/deleteEtapeDoc/:id", auth, (req, res) => {
  var id = req.params.id;
  etape.findOne({ where: { id: id } }).then(function (r1) {
    if (!r1) {
      return res.status(403).send(false);
    } else {
      etape
        .destroy({ where: { id: id } })
        .then((r2) => {
          return res.status(200).send(true);
        })
        .catch((error) => {
          return res.status(403).send(false);
        });
    }
  });
});

router.put("/changeEtat/:id/:etat/:iduser", auth, (req, res) => {
  var id = parseInt(req.params.id);
  var iduser = req.params.iduser;
  var user1 = req.params.iduser;
  var etat = req.params.etat;
  var etatNotif = 0;
  /** 
   * etat
   * 1-Retour du document
   * 2-Rédaction du document
   * 3-Validation rédaction
   * 4-Signature rédaction
   * 5-Vérification du document
   * 6-Validation vérification
   * 7-Signature vérification
   * 9-Approbation document
   * 10-Formation
  **/
  switch (etat) {
    case "1":
      {
        etatNotif = 4;
        userDocument.findAll({ where: { type: 1, id_document: id },include:["users","documents"] }).then((us) => {
          us.forEach(el1=>{
            var txt = "<tr><td>Rédaction du "+el1.dataValues.documents.titre+"</td></tr>";
            var date = new Date(el1.dataValues.date)
            txt += "<tr><td>Date de début: "+date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear()+"</td></tr>";
            //sendMail("Rédaction d'un document",txt,el1.dataValues.users.email,el1.dataValues.users.nom_prenom); 
          })
        })
      }
      break;
    case "2":
      {
        etatNotif = 5;
        userDocument.findAll({ where: { type: 2, id_document: id },include:["users","documents"] }).then((us) => {
          us.forEach(el1=>{
            notification.create({
              id_user: el1.id_user,
              lu: 0,
              etape: 5,
              accept: 4,
              type: 2,
            });
            //sendMail("Validation rédaction","<tr><td>Validation rédaction du "+el1.dataValues.documents.titre+"</td></tr>",el1.dataValues.users.email,el1.dataValues.users.nom_prenom); 
          })
        })
      }
      break;
    case "3":
      {
        etatNotif = 6;
        userDocument.findAll({ where: { type: 1, id_document: id },include:["users","documents"] }).then((us) => {
          us.forEach(el1=>{
            //sendMail("Signature d'un document","<tr><td>Signature du "+el1.dataValues.documents.titre+"</td></tr>",el1.dataValues.users.email,el1.dataValues.users.nom_prenom); 
          })
        })
      }
      break;
    case "4":
      {
        etatNotif = 4;
        userDocument.findAll({ where: { type: 2, id_document: id },include:["users","documents"] }).then((us) => {   
          us.forEach(el1=>{
          var txt = "<tr><td>Vérification du "+el1.dataValues.documents.titre+"</td></tr>";
          var date = new Date(el1.dataValues.date)
          txt += "<tr><td>Date de début: "+date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear()+"</td></tr>";
          //sendMail("Vérification d'un document",txt,el1.dataValues.users.email,el1.dataValues.users.nom_prenom); 
          })
        })
      }
      break;
    case "5":
      {
        etatNotif = 8;
        user.findAll({ where: { id_role: 3 } }).then((us) => {   
          us.forEach(el1=>{
          //sendMail("Validation vérification","<tr><td>Validation vérification </td></tr>",el1.dataValues.email,el1.dataValues.nom_prenom); 
          })
        })
      }
      break;
    case "6":
      {
        etatNotif = 9;
        userDocument.findAll({ where: { type: 2, id_document: id },include:["users","documents"] }).then((us) => {   
          us.forEach(el1=>{
          //sendMail("Signature d'un document","<tr><td>Signature du "+el1.dataValues.documents.titre+"</td></tr>",el1.dataValues.users.email,el1.dataValues.users.nom_prenom); 
          })
        })
      }
      break;
    case "7":
      {
        etatNotif = 10;
        user.findAll({ where: { id_role: 3} }).then((us) => {   
          us.forEach(el1=>{
          //sendMail("Référence document","<tr><td>Référence du document </td></tr>",el1.dataValues.email,el1.dataValues.nom_prenom); 
          })
        })
      }
      break;
    case "9":
      {
        etatNotif = 12;
      }
      break;
    default:
      break;
  }
  document.findOne({ where: { id: id } }).then(function (u) {
    if (!u) {
      return res.status(403).send(false);
    } else {
      document
        .update(
          {
            etat: etat,
            commentaire: req.body.comm,
          },
          { where: { id: id } }
        )
        .then((r2) => {
          userDocument
            .findOne({ where: { type: 2, id_document: id } })
            .then(function (userDoc) {
              var type = null;
              iduser == "null" ? (user1 = null) : (user1 = iduser);
              if (etat == 1 || etat == 4) {
                if (userDoc != null) {
                  user1 = userDoc.dataValues.id_user;
                }
              }
              if(etat ==1)
                type = 1;
              else if (etat ==4)
                type = 2
             
              if(etatNotif!=5)
              {   notification.create({
                    id_user: user1,
                    lu: 0,
                    etape: etatNotif,
                    accept: 4,
                    type: type,
                  });
                }

              if (etat == 4 || etat == 7) {
                userDocument
                  .findOne({
                    where: { id_user: iduser, id_document: id },
                  })
                  .then(function (d) {
                    var e = 0;
                    if ((d.dataValues.type == 1 && etat == 4) || etat == 7)
                      e = 1;
                    userDocument.update(
                      { etat: e },
                      { where: { id_document: id, type: d.dataValues.type } }
                    );
                  });
              }
              return res.status(200).send(true);
            });
        })
        .catch((error) => {
          return res.status(403).send(false);
        });
    }
  });
});

router.get("/getFileEtape/:idDoc/:idUser", auth, (req, res) => {
  etape
    .findOne({
      where: {
        id_document: req.params.idDoc,
        etape: 100,
        id_user: { [Op.ne]: req.params.idUser },
      },
    })
    .then(function (r) {
      if (r != null) return res.status(200).send(r);
      else return res.status(200).send(false);
    })
    .catch((error) => {
      return res.status(403).send(false);
    });
});

router.post("/saveVigueurDoc", auth, (req, res) => {
  if (req.body.vigueur.length != 0) {
    referenceVigueur
      .findOne({ where: { id_document: req.body.idDocument } })
      .then(function (f) {
        if (f != null) {
          referenceVigueur
            .destroy({
              where: { id_document: req.body.idDocument },
            })
            .then((doc) => {
              req.body.vigueur.forEach((element) => {
                referenceVigueur.create({
                  id_vigueur: element.value,
                  id_document: req.body.idDocument,
                });
              });
            });
        } else {
          req.body.vigueur.forEach((element) => {
            referenceVigueur.create({
              id_vigueur: element.value,
              id_document: req.body.idDocument,
            });
          });
        }
        return res.status(200).send(true);
      });
  }
});

router.get("/getDocVigeur/:id", auth, (req, res) => {
  referenceVigueur
    .findAll({ where: { id_document: req.params.id } })
    .then(function (ref) {
      return res.status(200).send(ref);
    });
});

router.post("/saveQuestion", auth, async(req, res) => {
  var array = req.body.questionnaire;
  var id = parseInt(req.body.id);
  questionnaire.findAll({ where: { id_document: id } }).then(function (q1) {
    if (!q1) {
      return res.status(403).send(false);
    } else {
      q1.forEach(async e=>{
        var r = await reponse.destroy({ where: { id_quest: e.dataValues.id } })
        var r1 = await questionnaire.destroy({ where: { id: e.dataValues.id } })
      })
      array.forEach(e=>{
        questionnaire.create({
          id_document: id,
          text: e.question,
          type: e.type,
        })
        .then(function (data) {
          e.reponse.forEach(b=>{
            reponse.create({
              id_document: id,
              id_quest: data.dataValues.id,
              reponse: b.reponse,
              valide: b.valide,
            })
          }) 
        });
      })
    }
  });
  return res.status(200).send(true);
})

router.get("/getQuestionBack/:id", auth, async(req, res) => {
  var quest = await questionnaire.findAll({where:{id_document:req.params.id}})
  var array = []
  quest.forEach(async (val,key)=>{
    var rep = await reponse.findAll({where:{id_quest:val.dataValues.id}})
    array.push({
      id:val.dataValues.id,
      question:val.dataValues.text,
      id_document:req.params.id,
      reponse:rep,
    })
    if((key + 1) == quest.length){
      return res.status(200).send(array);
    }
  })
})

router.get("/getQuestion/:id", auth, async(req, res) => {
  var quest = await questionnaire.findAll({where:{id_document:req.params.id}})
  return res.status(200).send(quest);
})

router.get("/getReponse/:id", auth, async(req, res) => {
  reponse.findAll({
    include:{
      model:questionnaire,
      as:"questionnaires",
      where:{id_document:req.params.id},
    }
  })
  .then(function (data) {
    return res.status(200).send(data);
  })
})

router.get("/getReponseQuestion/:id", auth, async(req, res) => {
  reponse.findAll({
    include:{
      model:questionnaire,
      as:"questionnaires",
      where:{ id_document:req.params.id, type:0},
    }
  })
  .then(function (data) {
    return res.status(200).send(data);
  })
})

router.get("/getReponseExamen/:id", auth, async(req, res) => {
  reponse.findAll({
    include:{
      model:questionnaire,
      as:"questionnaires",
      where:{ id_document:req.params.id, type:1},
    }
  })
  .then(function (data) {
    return res.status(200).send(data);
  })
})

router.post("/verifReponseBack", auth, async(req, res) => {
  var rep = req.body.data;
  var idUser = req.body.idUser;
  reponse.findAll({
    include:{
      model:questionnaire,
      as:"questionnaires",
      where:{id_document:req.body.id},
    }
  })
  .then(function (data) {
    var nb = 0;
    for (let index = 0; index < data.length; index++) {
      if((data[index].dataValues.id && data[index].dataValues.valide) == (rep[index].id && rep[index].valide))
        nb++;
    }
    var score = ((nb*100)/data.length);
    if(score>=60)
      reponseUser.create({
        score:score,
        id_user:idUser,
        id_document:req.body.id
      })
    return res.status(200).send({score});
  })
  .catch((error) => {
    return res.status(403).send(error);
  });
})

//cette function pour calcul score de examen
router.post("/verifReponse", auth, async(req, res) => {
  var type = req.body.type;
  var idUser = req.body.idUser;
  reponse.findAll({
    where:{
      id:req.body.data,
      valide:2
    },
  })
  .then(function (data) {
    var nb = data.length;
    var score = ((nb*100)/req.body.count);
    reponseUser.findOne({where:{
      id_user:idUser,
      id_document:req.body.id}
    }).then(val=>{
      if(val === null){
        if(type == 0)
          reponseUser.create({
            score:score,
            id_user:idUser,
            id_document:req.body.id
          })
        else if(type == 1)
          reponseUser.create({
            scoreExamen:score,
            id_user:idUser,
            id_document:req.body.id
          })
      }else {
        if(type == 0)
          reponseUser.update(
            {
              score: score,
              id_user: idUser,
              id_document: req.body.id,
            },
            {
              where: {
                id_user: idUser,
                id_document: req.body.id,
              },
            }
          );
        else if(type == 1)
          reponseUser.update(
            {
              scoreExamen: score,
              id_user: idUser,
              id_document: req.body.id,
            },
            {
              where: {
                id_user: idUser,
                id_document: req.body.id,
              },
            }
          );
      }
      return res.status(200).send({score});
    })
    /* if(score>=70 && type == 0)
      reponseUser.create({
        score:score,
        id_user:idUser,
        id_document:req.body.id
      })
    else if(score>=70 && type == 1)
      reponseUser.create({
        scoreExamen:score,
        id_user:idUser,
        id_document:req.body.id
      }) */
  })
  .catch((error) => {
    return res.status(403).send(error);
  });
})

router.get("/getScore/:idUser/:idDocument", auth, async(req, res) => {
  var findScore = await reponseUser.findOne({
    where: {
      id_user: req.params.idUser,
      id_document: req.params.idDocument,
      score: { [Op.ne]: null },
    },
  });
  var findScoreExamen = await reponseUser.findOne({
    where: {
      id_user: req.params.idUser,
      id_document: req.params.idDocument,
      scoreExamen: { [Op.ne]: null },
    },
  });
  var score = findScore == null?-1:findScore.score
  var scoreExamen = findScoreExamen == null?-1:findScoreExamen.scoreExamen
  return res.status(200).send({score:score,scoreExamen:scoreExamen});
  /* reponseUser.findOne({
    where:{
      id_user:req.params.idUser,
      id_document:req.params.idDocument,
      score: { [Op.ne]: null },
    },
  }).then(function (data) {
    var score = data == null?-1:data.score
    return res.status(200).send({score:score});
  }) */
})
module.exports = router;
