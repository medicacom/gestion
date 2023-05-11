const express = require("express");
const router = express.Router();
var vigueur = require("../models/vigueur");
var user = require("../models/user");
var notification = require("../models/notification");
const sendMail = require("./sendMailController");
const auth = require("../middlewares/passport");
const multer = require("multer");
const { Op } = require("sequelize");
var fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload/vigueur");
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname);
  },
});
const upload= multer({ storage: storage });
router.post("/saveFile", upload.single("file"),(req, res) => {
  res.send({ filename: req.body.name });
});

router.post("/addVigueur", auth, (req, res) => {
  var id = req.body.id;
  if (id == 0) {
    vigueur
      .create({
        titre: req.body.titre,
        file: req.body.fileVal,
        id_role: req.body.responsable.value,
      })
      .then((r) => {          
        user.findAll({where:{id_role:r.dataValues.id_role}}).then((u) => {
          u.forEach(element => {
            //sendMail("Nouvelle référence d'un document règlementaire","Nouvelle référence d'un document règlementaire",element.dataValues.email,element.dataValues.nom_prenom);              
           notification.create({
              id_user: element.dataValues.id,
              lu: 0,
              etape: 15,
              accept: 4
            }); 
          });
        })
        return res.status(200).send(true);
      })
      .catch((error) => {
        return res.status(403).send(false);
      });
  } else {
    vigueur.findOne({ where: { id: id } }).then(function (r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        vigueur
          .update({
            file: req.body.fileVal,
            titre: req.body.titre,
            reference: req.body.reference,
            arborescence: req.body.arborescence,
          },{ where: { id: id } })
          .then((r2) => {
            return res.status(200).send(true);
          })
          .catch((error) => {
            return res.status(403).send(false);
          });
      }
    });
  }
});

router.post("/allVigueur",auth, (req, res) => {
  vigueur.findAll({where:{reference:{ [Op.ne]: null }}}).then(function (r) {
    return res.status(200).send(r);
  });
});

router.get("/allVigueurRole/:role",auth, (req, res) => {
  var where = {};
  if(req.params.role < 8)
    where = {reference:{ [Op.ne]: null }};
  vigueur.findAll({where:where}).then(function (r) {
    return res.status(200).send(r);
  });
});

router.delete("/deleteVigueur/:id", auth, (req, res) => {
  var id = req.params.id;
  vigueur.findOne({ where: { id: id } }).then(function (r1) {
    if (!r1) {
      return res.status(403).send(false);
    } else {
      vigueur.destroy({ where: { id: id } })
        .then((r2) => {
          return res.status(200).send(true);
        })
        .catch((error) => {
          return res.status(403).send(false);
        });
    }
  });
});

router.post("/getVigueur",auth, (req, res) => {
  var id = req.headers["id"];
  vigueur.findOne({ where: { id: id },include:["roles"] }).then(function (r1) {
    if (!r1) {
      return res.status(403).send(false);
    } else {
      return res.status(200).json(r1.dataValues);
    }
  });
});

router.get("/getFile/:file", (req, res) => {
  if (fs.existsSync("./upload/vigueur/" + req.params.file)) {
    var file = fs.createReadStream("./upload/vigueur/" + req.params.file);
    file.pipe(res);
  } else return res.status(403).json({ message: false });
});

module.exports = router;
