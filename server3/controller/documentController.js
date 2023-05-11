const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
var document = require("../models/document");
var reference = require("../models/reference");
var userDocument = require("../models/userDocument");
var user = require("../models/user");
var demande = require("../models/demande");
var formation = require("../models/formation");
var etape = require("../models/etape");
var demandeDocument = require("../models/demandeDocument");
var user = require("../models/user");
var video = require("../models/video");
const auth = require("../middlewares/passport");
var notification = require("../models/notification");
const FeuilleDocument = require("../models/feuilleDocument");
const reponseUser = require("../models/reponseUser");
const referenceVigueur = require("../models/referenceVigueur");
const sendMail = require("./sendMailController");
var fs = require("fs");
const { Op } = require("sequelize");
var configuration = require("../config");
const sequelize = new Sequelize(
  configuration.connection.base,
  configuration.connection.root,
  configuration.connection.password,
  {
    host: configuration.connection.host,
    port: configuration.connection.port,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    operatorsAliases: false,
  }
);

/*** start generate pdf ***/
/* const PDFDocument = require("pdfkit-table"); */
var PdfTable = require("voilab-pdf-table"),
  PdfDocument = require("pdfkit");
/*** end generate pdf ***/

router.post("/addDocument", auth, (req, res) => {  
  var idDoc=req.body.idDoc;
  if( req.body.idDoc=="null") idDoc=null;
  var where={revision: req.body.idDoc }; 
  document.findAll({ where: where ,order:[["id","desc"]]}).then((d) => {
    var version =  1;
    if( req.body.idDoc !="null" ){
      if (d.length > 0) version = parseInt(d[0].dataValues.version)+ 1; 
      else version +=1;
    }

    document
      .create({
        titre: req.body.titre,
        note: req.body.note,
        id_type: req.body.typeDoc,
        etat: 0,
        id_service: req.body.idService,
        revision: idDoc,
        version: version,
      })
      .then((doc) => {
        var redacteur = req.body.userRSelect;
        var verificateur = req.body.userVSelect;
        //redacteur
        redacteur.forEach((element) => {
          userDocument.create({
            id_document: doc.id,
            id_user: element.value,
            type: 1,
          });
        });
        //verificateur

        verificateur.forEach((element) => {
          userDocument.create({
            id_document: doc.id,
            id_user: element.value,
            type: 2,
          });
        });
        notification.create({
          id_user: null,
          accept: 4,
          lu: 0,
          etape: 3,
        });
        demandeDocument.update(
          {
            id_document: doc.id,
          },
          { where: { id_demande: req.body.id_demande } }
        );
        user.findOne({where:{id_role:3}}).then((rh) => { 
          //sendMail("Identification document","<tr><td>Identification document</td></tr>",rh.dataValues.email,rh.dataValues.nom_prenom); 
        })
        return res.status(200).send(true);
      })
      .catch(() => {
        return res.status(400).send(false);
      });
  });
});

//identifier document
router.post("/identification", auth, (req, res) => {
  document
    .update(
      {
        titre: req.body.titre,
        note: req.body.note,
        id_type: req.body.typeDoc,
        etat: 1,
      },
      { where: { id: req.body.id } }
    )
    .then(() => {
      var redacteur = req.body.tabRedac;
      var verificateur = req.body.tabValid;
      //redacteur
      redacteur.forEach((element) => {
        notification.create({
          id_user: element.idUser,
          lu: 0,
          etape: 4,
          accept: 4,
          type:1
        });
        user.findOne({where:{id:element.idUser}}).then((rh) => { 
          //sendMail("Rédaction d'un document","<tr><td>Rédaction d'un document</td></tr>",rh.dataValues.email,rh.dataValues.nom_prenom); 
        })
        if (element.id == null)
          userDocument.create({
            id_document: req.body.id,
            id_user: element.idUser,
            date: element.date,
            type: 1,
          });
        else
          userDocument.update(
            {
              id_user: element.idUser,
              date: element.date,
              type: 1,
            },
            { where: { id: element.id } }
          );
      });
      //verificateur
      verificateur.forEach((element) => {
        notification.create({
          id_user: element.idUser,
          lu: 0,
          etape: 4,
          accept: 4,
          type:2
        });
        user.findOne({where:{id:element.idUser}}).then((rh) => { 
          //sendMail("Vérification d'un document","Vérification d'un document",rh.dataValues.email,rh.dataValues.nom_prenom); 
        })
        if (element.id == null)
          userDocument.create({
            id_document: req.body.id,
            id_user: element.idUser,
            date: element.date,
            type: 2,
          });
        else
          userDocument.update(
            {
              id_user: element.idUser,
              date: element.date,
              type: 2,
            },
            { where: { id: element.id } }
          );
      });
      return res.status(200).send(true);
    })
    .catch(() => {
      return res.status(400).send(false);
    });
});

router.post("/allDocument/:id", auth, (req, res) => {
  document.findAll({
    where: { id_service: req.params.id,etat:10 },
  }).then(function (r) {
    return res.status(200).send(r);
  });
});

router.get("/getAllDoc", auth, (req, res) => {
  document.findAll({
    where: { etat:10 },
  }).then(function (r) {
    return res.status(200).send(r);
  });
});

//get document by user,service et role
router.post("/getDocument/:idUser/:service/:role", auth, (req, res) => {
  var idUser =parseInt(req.params.idUser);
  var role =parseInt(req.params.role);
  if(role == 2)
    document.findAll({
      where: { id_service: req.params.service },
      order: [[ "createdAt", 'DESC']]
    }).then(function (r) {
      return res.status(200).send(r);
    });
  
  else if(role != 3)
    userDocument.findAll({
      where: { id_user: idUser },
      include:["documents"] ,
      order: [[ "createdAt", 'DESC']]
    }).then(function (r) {
      return res.status(200).send(r);
    });
  else if(role == 3)
    document.findAll({
      where: { etat: { [Op.gte]: 1 } },
      order: [[ "createdAt", 'DESC']]
    }).then(function (r) {
      return res.status(200).send(r);
    });
  else return res.status(200).send(false); 
});

//get document vigueur by role et service
router.get("/allDocumentVigueur/:idRole/:idService", auth, async(req, res) => {
  var where = "";
  if(req.params.idRole!==3 && req.params.idRole!==5 && req.params.idRole!==1) {
    where = " where d.id_service = "+req.params.idService ;
  }
  var sql = `SELECT d.*,r.reference,t.type,s.nom as service,d.updatedAt as date,r.file 
  FROM documents d 
  left join referencedocs r on r.id_document = d.id 
  left join typedocuments t on t.id = d.id_type
  left join services s on s.id = d.id_service 
  ${where}
  order by d.id desc`;
  sequelize
    .query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(function async(r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        var list = r1;
        if(list.length === 0)
          return res.status(200).json(list);
        for (let i = 0; i < list.length; i++) {
          reponseUser.count({where:{id_document:list[i].id,score:{ [Op.ne]: null}}}).then(function (r2) {
            list[i].count=r2 == 0 ?0:r2;
            if(list.length === (i+1))
              return res.status(200).json(list);
          }) 
        }
      }
    });
});

//verif feuille by document et user
router.get("/verifFeuilleUser/:id/:idUser", auth, (req, res) => {
  FeuilleDocument
    .findAll({ where: { id_document: req.params.id,id_user: req.params.idUser } })
    .then(function (r) {
      return res.status(200).send(r);
    });
});

//get text reglement
router.get("/getTextReglement/:id", auth, (req, res) => {
  referenceVigueur
    .findAll({ where: { id_document: req.params.id }, include: ["vigueurs"] })
    .then(function (r) {
      return res.status(200).send(r);
    });
});

//get all document etat >= 4
router.post("/getWorkflow", auth, (req, res) => {
  document
    .findAll({ where: { etat: { [Op.gte]: 4 },type_doc:0 }, order: [["etat", "ASC"]] })
    .then(function (r) {
      return res.status(200).send(r);
    });
});

//get workflow by idDocument
router.post("/getWorkflowById/:id", auth, (req, res) => {
  var sql = ` SELECT e.file,d.titre,ud.type,e.etape,u.nom_prenom,e.createdAt as date,e.note FROM etapes e 
              left join userdocuments ud on ud.id=e.id_userdoc
              left join users u on u.id=e.id_user 
              left join documents d on d.id=ud.id_document
              where e.id_document = ${req.params.id}`;
  sequelize
    .query(sql, { type: sequelize.QueryTypes.SELECT })
    .then(function (r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        return res.status(200).json(r1);
      }
    });
});

//get nouvelle document
router.post("/getDocumentCreer", auth, (req, res) => {
  document
    .findAll({ where: { etat: 0 }, include: ["types"] })
    .then(function (r) {
      return res.status(200).send(r);
    });
});

router.delete("/deleteDocument/:id", auth, (req, res) => {
  var id = req.params.id;
  document.findOne({ where: { id: id } }).then(function (r1) {
    if (!r1) {
      return res.status(403).send(false);
    } else {
      document
        .destroy({ where: { id: id } })
        .then(() => {
          return res.status(200).send(true);
        })
        .catch(() => {
          return res.status(403).send(false);
        });
    }
  });
});

router.delete("/deleteUserDoc/:id", auth, (req, res) => {
  var id = req.params.id;
  userDocument.findOne({ where: { id: id } }).then(function (r1) {
    if (!r1) {
      return res.status(403).send(false);
    } else {
      userDocument
        .destroy({ where: { id: id } })
        .then(() => {
          return res.status(200).send(true);
        })
        .catch(() => {
          return res.status(403).send(false);
        });
    }
  });
});

//get document by id
router.post("/getDocument", auth, (req, res) => {
  var id = req.headers["id"];
  document
    .findOne({ where: { id: id }, include: ["types", "services"] })
    .then(function (r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        return res.status(200).json(r1.dataValues);
      }
    });
});

//get userdocument by id_document
router.get("/getUserDoc/:id", auth, (req, res) => {
  userDocument
    .findAll({
      where: { id_document: req.params.id },
      include: [{ model: user, as: "users", attributes: ["nom_prenom"] }],
    })
    .then(function (r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        return res.status(200).json(r1);
      }
    });
});

//get document approber
router.post("/getDocApprobateur", auth, (req, res) => {
  document
    .findAll({ where: { etat: 8, id_type: req.body.tab } })
    .then(function (r1) {
      return res.status(200).json(r1);
    });
});

//get user document by id_document et id_user
router.get("/getUserDocByIdDoc/:id/:idUser", auth, (req, res) => {
  userDocument
    .findOne({
      where: { date:{ [Op.ne]:null}, id_document: req.params.id, id_user: req.params.idUser },
      include: ["documents", "users"],
    })
    .then(function (r) {
      return res.status(200).send(r);
    });
});

router.get("/getDocFini", auth, (req, res) => {
  reference
    .findAll({
      include: [
        {
          model: document,
          as: "documents",
          attributes: ["titre", "etat"],
          where: { etat: [9, 10] },
        },
      ],
    })
    .then(function (r1) {
      return res.status(200).json(r1);
    });
});

router.get("/file/:file", (req, res) => {
  if (fs.existsSync("./upload/document/" + req.params.file)) { 
    var file = fs.createReadStream(
      "./upload/document/" + req.params.file
    );
    file.pipe(res);
  } else return res.status(403).json({ message: false });
});

router.get("/pdfsignature/:file", (req, res) => {
  if (fs.existsSync("./docs/" + req.params.file)) {
    var file = fs.createReadStream("./docs/" + req.params.file);
    file.pipe(res);
  } else return res.status(403).json({ message: false });
});

router.post("/getVisualisation", auth, (req, res) => {
  var idUser = req.body.id;
  FeuilleDocument.findAll({
    where: { id_user: idUser },
    include: ["documents", "referencedocs"],
  }).then(function (r1) {
    return res.status(200).json(r1);
  });
});

//get version et reference du ducment
router.get("/getVersionReference/:id", auth, (req, res) => {
  var id = req.params.id;
  var version = "";
  document
    .findOne({ where: { id: id }, include: ["types", "services"] })
    .then(function (r1) {
      document
        .count({ where: { etat:{ [Op.gte]:7}, id_service: r1.dataValues.id_service,id:{ [Op.ne]: id} } })
        .then(function (r2) {
          var v = r1.dataValues.version;
          if (parseInt(v) <= 10) v = "0" + v;
          if (parseInt(r2 + 1) >= 10) {
            version =r1.dataValues.types.reference +"-" +r1.dataValues.services.nom +"-" +(r2 + 1) +" Version " +v;
          } else {
            version = r1.dataValues.types.reference + "-" + r1.dataValues.services.nom + "-0" + (r2 + 1) + " Version " + v;
          }

          return res.status(200).json(version);
        });
    });
});

router.post("/getLifeCycleDoc", auth, (req, res) => {
  var id = req.body.idDoc;
  var type = req.body.type;
  var service = req.body.service;
  var i = req.body.i;
  var date = req.body.date;
  var dateFormat = null;
  var m = "";
  var d = "";
  var y = "";
  //var version="";

  switch (i) {
    case -1:
      demandeDocument
        .findOne({
          where: { id_document: id },
          include: {
            model: demande,
            as: "demandes",
            include: { model: user, as: "users" },
          },
        })
        .then(function (dem) {
          var bes = 0;
          dateFormat = new Date(dem.dataValues.createdAt); 
          d = dateFormat.getDate();
          m = dateFormat.getMonth() + 1;
          y = dateFormat.getFullYear();
          dem.dataValues.demandes.besoin == 1
            ? (bes = "Création")
            : (bes = "Révision");
          return res.status(200).json({
            title: "Demande document",
            cardTitle: "Demande de document",
            cardDetailedText:
              "Date de création : " +
              d +
              "-" +
              m +
              "-" +
              y +
              " | besoin: " +
              bes +
              " | Demandeur : " +
              dem.dataValues.demandes.users.nom_prenom +
              " | Sujet : " +
              dem.dataValues.demandes.sujet,
          });
        });

      break;
    case 0:
      dateFormat = new Date(date);
      d = dateFormat.getDate();
      m = dateFormat.getMonth() + 1;
      y = dateFormat.getFullYear();
      return res.status(200).json({
        title: "Création document",
        cardTitle: "Création document",
        cardDetailedText:
          "Date de création : " +
          d +
          "-" +
          m +
          "-" +
          y +
          " | Type de document: " +
          type +
          " | Service: " +
          service,
      });
      break;
    case 2:
      {
        etape
          .findAll({
            where: { id_document: id },
            include: [
              "documents",
              "users",
              { model: userDocument, as: "userdocuments", where: { type: 1 } },
            ],
          })
          .then(function (e) {
            var text = "";
            e.forEach((element) => {
              dateFormat = new Date(element.createdAt);
              d = dateFormat.getDate();
              m = dateFormat.getMonth() + 1;
              y = dateFormat.getFullYear();
              text +=
                " Nom du rédacteur : " +
                element.users.nom_prenom +
                " | Etape: " +
                element.etape +
                " | Date :" +
                d +
                "-" +
                m +
                "-" +
                y +
                " | ";
            });

            return res.status(200).json({
              title: "Rédaction document",
              cardTitle: "Rédaction document",
              cardDetailedText: text,
            });
          });
      }
      break;

    case 5:
      {
        etape
          .findAll({
            where: { id_document: id },
            include: [
              "documents",
              "users",
              { model: userDocument, as: "userdocuments", where: { type: 2 } },
            ],
          })
          .then(function (e) {
            var text = "";
            e.forEach((element) => {
              dateFormat = new Date(element.createdAt);
              d = dateFormat.getDate();
              m = dateFormat.getMonth() + 1;
              y = dateFormat.getFullYear();
              text +=
                " Nom du rédacteur : " +
                element.users.nom_prenom +
                " | Etape: " +
                element.etape +
                " | Date :" +
                d +
                "-" +
                m +
                "-" +
                y +
                " | ";
            });
            return res.status(200).json({
              title: "Vérification document",
              cardTitle: "Vérification document",
              cardDetailedText: text,
            });
          });
      }
      break;

    case 7:
      {
        reference
          .findOne({
            where: { id_document: id },
            include: ["documents"],
          })
          .then(function (e) {
            if (e != null) {
              dateFormat = new Date(e.dataValues.createdAt);
              d = dateFormat.getDate();
              m = dateFormat.getMonth() + 1;
              y = dateFormat.getFullYear();
              var text = "Date :" + d + "-" + m + "-" + y;
              return res.status(200).json({
                title: "Référence document",
                cardTitle: "Référence document",
                cardDetailedText: text,
              });
            } else {
              return res.status(200).json(false);
            }
          });
      }
      break;

    case 9:
      {
        formation
          .findOne({
            include: {
              model: reference,
              as: "referencedocs",
              where: { id_document: id },
            },
          })
          .then(function (e) {
            if (e != null) {
              dateFormat = new Date(e.dataValues.date);
              d = dateFormat.getDate();
              m = dateFormat.getMonth() + 1;
              y = dateFormat.getFullYear();
              var text =
                "Sujet : " +
                e.dataValues.sujet +
                " | Date :" +
                d +
                "-" +
                m +
                "-" +
                y +
                " | Heure début:" +
                e.dataValues.heurD +
                " | Heure fin :" +
                e.dataValues.heurF +
                " | Lieu :" +
                e.dataValues.lieu;
              return res.status(200).json({
                title: "Formation du document",
                cardTitle: "Formation document",
                cardDetailedText: text,
              });
            } else {
              return res.status(200).json(false);
            }
          });
      }
      break;

    case 10:
      {
        formation
          .findOne({
            where: { etat: 1 },
            include: {
              model: reference,
              as: "referencedocs",
              where: { id_document: id },
            },
          })
          .then(function (e) {
            if (e != null) {
              dateFormat = new Date(e.dataValues.date);
              d = dateFormat.getDate();
              m = dateFormat.getMonth() + 1;
              y = dateFormat.getFullYear();
              var text =
                "Sujet : " +
                e.dataValues.sujet +
                " | Date :" +
                d +
                "-" +
                m +
                "-" +
                y +
                " | Heure début:" +
                e.dataValues.heurD +
                " | Heure fin :" +
                e.dataValues.heurF +
                " | Lieu :" +
                e.dataValues.lieu;
              return res.status(200).json({
                title: "Ducument publié",
                cardTitle: "Ducument publié",
                cardDetailedText: text,
              });
            } else {
              return res.status(200).json(false);
            }
          });
      }
      break;
    default:
      return res.status(200).json(false);
  }
});

//generate fichier pdf
router.get("/generatePdfSign/:idDoc/:idApp", auth, (req) => {
  var pdf = new PdfDocument({
      autoFirstPage: false,
    }),
    //header
    table = new PdfTable(pdf, {
      bottomMargin: 30,
    });
  pdf.fontSize("14");
  reference
    .findOne({
      where: { id_document: req.params.idDoc },
      include: ["documents", "users"],
    })
    .then(function (ref) {
      userDocument
        .findAll({
          where: { id_document: req.params.idDoc },
          include: ["users"],
        })
        .then(function () {
          user.findOne({ where: { id: req.params.idApp } }).then(function () {
            var dateRef = new Date(ref.dataValues.updatedAt);
            var dateR =
              dateRef.getDate() +
              "-" +
              (dateRef.getMonth() + 1) +
              "-" +
              dateRef.getFullYear();

            table
              // add some plugins (here, a 'fit-to-width' for a column)
              .addPlugin(
                new (require("voilab-pdf-table/plugins/fitcolumn"))({
                  column: "reference",
                })
              )
              // set defaults to your columns
              .setColumnsDefaults({
                headerBorder: "TBRL",
                align: "center",
                headerPadding: [5, 5, 5, 5],
              })
              .addColumns([
                {
                  id: "image",
                  header: "",
                  border: "TBRL",
                  align: "center",
                  width: 100,
                  valign: "center",
                },
                {
                  id: "titre",
                  header: ref.dataValues.documents.titre,
                  border: "TBRL",
                  align: "center",
                  width: 230,
                  valign: "center",
                },
                {
                  id: "reference",
                  header:
                    ref.dataValues.reference + "\n Date application: " + dateR,
                  border: "TBRL",
                  align: "center",
                  width: 120,
                  valign: "center",
                },
              ])
              .onPageAdded(function (tb) {
                tb.addHeader();
              });
            pdf.addPage();
            table.addBody([]);
            pdf.moveDown();
            table
              // add some plugins (here, a 'fit-to-width' for a column)
              .addPlugin(
                new (require("voilab-pdf-table/plugins/fitcolumn"))({
                  column: "reference",
                })
              )
              // set defaults to your columns
              .setColumnsDefaults({
                headerBorder: "TBRL",
                align: "center",
                headerPadding: [5, 5, 5, 5],
              })
              .addColumns([
                {
                  id: "titre",
                  header: ref.dataValues.documents.titre,
                  border: "TBRL",
                  align: "center",
                  width: 20,
                  valign: "center",
                },
                {
                  id: "reference",
                  header:
                    ref.dataValues.reference + "\n Date application: " + dateR,
                  border: "TBRL",
                  align: "center",
                  width: 20,
                  valign: "center",
                },
              ])
              .onPageAdded(function (tb) {
                tb.addHeader();
              });
            table.addBody([]);
            pdf.pipe(
              fs.createWriteStream(
                "../client/src/assets/document/" +
                  ref.dataValues.reference.replaceAll(" ", "") +
                  ".pdf"
              )
            );
            /* refUserTest.addBody([]); */
            pdf.end();
          });
        });
    });
});

router.get("/getGant/:idRole/:idService", auth, (req, res) => {
  var where ={};
  if(req.params.idService!="null")where={id_service:req.params.idService }
  userDocument
    .findAll({ include: [ 
      {model:document,as:"documents",where:where,include:["services","types"]},
      "users"] })
    .then(function (r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        return res.status(200).json(r1);
      }
    })
});

// old procedure
router.post("/addDocumentOld", auth, (req, res) => {  
  document
    .create({
      titre: req.body.titre,
      note: req.body.note,
      id_type: req.body.typeSelect.value,
      etat: 10,
      id_service: req.body.idService,
      revision: null,
      version: req.body.idService,
      type_doc:1
    })
    .then((doc) => {
      var redacteur = req.body.userRSelect;
      var verificateur = req.body.userVSelect; 
      //redacteur
      redacteur.forEach((element) => {
        userDocument.create({
          id_document: doc.id,
          id_user: element.value,
          type: 1,
          date:new Date()
        });
      });
      //verificateur

      verificateur.forEach((element) => {
        userDocument.create({
          id_document: doc.id,
          id_user: element.value,
          type: 2,
          date:new Date()
        });
      });
      /* notification.create({
        id_user: null,
        accept: 4,
        lu: 0,
        etape: 3,
      });
      demandeDocument.update(
        {
          id_document: doc.id,
        },
        { where: { id_demande: req.body.id_demande } }
      );
      user.findOne({where:{id_role:3}}).then((rh) => { 
        sendMail("Identification document","<tr><td>Identification document</td></tr>",rh.dataValues.email,rh.dataValues.nom_prenom); 
      }) */
      return res.status(200).send(doc);
    })
    .catch(() => {
      return res.status(400).send(false);
    });
});

//TB
router.get("/dashbord/:idDocument/:idUser", auth, async (req, res) => {
  const { idDocument,idUser } = req.params;
  var whereU = idUser!=0?{id:idUser}: {};
  var whereD = idDocument!=0?{id:idDocument}: {};
  var findReponse = await reponseUser.findAll({
    include:[{
      model:user,
      as:"users",
      where:whereU
    },
    {
      model:document,
      as:"documentss",
      where:whereD
    }]
  });
  var nbVu = await reponseUser.findAll({
    attributes: [[Sequelize.fn("COUNT", Sequelize.col("reponseusers.id")), "nb"]],
    include:[{
      model:user,
      as:"users",
      where:whereU
    },
    {
      model:document,
      as:"documentss",
      where:whereD
    }],
    where: { score: { [Op.ne]: null } },
    group: "id_document",
  });
  return res.status(200).send({findReponse,nbVu});
});
module.exports = router;
