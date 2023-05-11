const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();
var reference = require("../models/reference");
var document = require("../models/document");
var userDocument = require("../models/userDocument");
var userType = require("../models/userType");
var user = require("../models/user");
var notification = require("../models/notification");
const auth = require("../middlewares/passport");
const sendMail = require("./sendMailController");
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

const multer = require("multer");
var fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload/document");
  },
  filename: function (req, file, cb) {
    cb(null, "reference-"+file.originalname);
  },
});
const upload= multer({ storage: storage });
router.post("/saveFile", auth, upload.single("file"),(req, res) => {
  res.send({ filename: req.body.name });
});

router.get("/getFile/:file", (req, res) => {
  if (fs.existsSync("./upload/document/" + req.params.file)) {
    var file = fs.createReadStream("./upload/document/" + req.params.file);
    file.pipe(res);
  } else return res.status(403).json({ message: false });
});

// Desplay all lignes of client ...
router.post("/addReference", auth, (req, res) => {
  reference
    .create({
      reference: req.body.reference,
      file: "reference-"+req.body.fileVal,
      id_user: req.body.idUser,
      id_document: req.body.idDocument,
    })
    .then((ref) => {
      document.update(
        {
          etat: 8,
        },
        { where: { id: req.body.idDocument } }
      );
     
      userType.findOne({
        where: { id_type: req.body.type } ,
      })
      .then(function (u) {
          if(u!=null){
            notification.create({
              id_user: u.id_user,
              lu: 0,
              etape: 11,
              accept: 4,
            });
            user.findOne({where:{id:u.id_user}}).then((rh) => { 
              //sendMail("Approbation d'un document","Approbation d'un document",rh.dataValues.email,rh.dataValues.nom_prenom); 
            })
          }
            
      });
      return res.status(200).send(true);
    })
    .catch((error) => {
      return res.status(403).send(false);
    });
});

router.get("/getReference", auth, (req, res) => {
  document.findAll({ where: { etat: 7 } }).then(function (r1) {
    return res.status(200).json(r1);
  });
});

router.post("/getByReference", auth, (req, res) => {
  reference.findOne({ where: { id_document: req.body.id } }).then(function (r1) {
    return res.status(200).json(r1);
  });
});

router.get("/allReference", auth, (req, res) => {
  reference.findAll().then(function (r1) {
    return res.status(200).json(r1);
  });
});

router.get("/getRefByService/:id", auth, (req, res) => {
  var where =  {etat:[9,10]}
  if(req.params.id !="null")  where = {id_service:req.params.id,etat:[9,10]}
  reference.findAll({
    include:{
      model:document,
      as:"documents",
      where:where
    }}).then(function (r1) {
    return res.status(200).json(r1);
  });
});

router.get("/getFileEtapeDoc/:idDoc", auth, (req, res) => {
  var sql = `SELECT e.file,d.titre,d.id_type FROM etapes e left join users u on u.id=e.id_user 
              left join userdocuments ud on u.id=ud.id_user 
              left join documents d on d.id=ud.id_document
              where e.id_document = ${req.params.idDoc} and ud.type = 2 and e.etape = 100 limit 1`;
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

router.get("/getReferenceByDoc/:idDoc", auth, (req, res) => {
  reference
    .findOne({
      where: { id_document: req.params.idDoc },
      include: ["documents"],
    })
    .then(function (ref) {
      if (ref != null)
        userDocument
          .findAll({
            where: { id_document: req.params.idDoc, etat: 1 },
            include: [{ model: user, as: "users", attributes: ["nom_prenom"] }],
          })
          .then(function (userDoc) {
            return res.status(200).json({ ref, userDoc });
          });
    });
});
router.post("/addReferenceOld", auth, (req, res) => {
  reference
    .create({
      reference: req.body.reference,
      file: "reference-"+req.body.fileVal, 
      id_user: req.body.idUser,
      id_document: req.body.idDocument,
    })
    .then((ref) => {
      document.update(
        {
          etat: 10,
        },
        { where: { id: req.body.idDocument } }
      );
      return res.status(200).send(ref);
    })
    .catch((error) => {
      return res.status(403).send(false);
    });
});
module.exports = router;
