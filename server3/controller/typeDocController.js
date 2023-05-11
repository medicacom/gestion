const express = require("express");
const router = express.Router();
var typeDocument = require("../models/typeDocument");
const auth = require("../middlewares/passport");
const multer = require("multer");
var fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload/type");
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname);
  },
});
const upload= multer({ storage: storage });
router.post("/saveFile", auth, upload.single("file"),(req, res) => {
  res.send({ filename: req.body.name });
});


router.post("/addType", auth, (req, res) => {
  var id = req.body.id;
  if (id == 0) {
    typeDocument
      .create({
        reference: req.body.reference,
        type: req.body.type,
        file: req.body.fileVal,
      })
      .then((r) => {
        return res.status(200).send(true);
      })
      .catch((error) => {
        return res.status(403).send(false);
      });
  } else {
    typeDocument.findOne({ where: { id: id } }).then(function (r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        typeDocument
          .update({
            reference: req.body.reference,
            file: req.body.fileVal,
            type: req.body.type
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

router.post("/allType",auth, (req, res) => {
  typeDocument.findAll().then(function (r) {
    return res.status(200).send(r);
  });
});

router.delete("/deleteType/:id", auth, (req, res) => {
  var id = req.params.id;
  typeDocument.findOne({ where: { id: id } }).then(function (r1) {
    if (!r1) {
      return res.status(403).send(false);
    } else {
      typeDocument.destroy({ where: { id: id } })
        .then((r2) => {
          return res.status(200).send(true);
        })
        .catch((error) => {
          return res.status(403).send(false);
        });
    }
  });
});

router.post("/getType",auth, (req, res) => {
  var id = req.headers["id"];
  typeDocument.findOne({ where: { id: id } }).then(function (r1) {
    if (!r1) {
      return res.status(403).send(false);
    } else {
      return res.status(200).json(r1.dataValues);
    }
  });
});

router.get("/getFile/:file", (req, res) => {
  if (fs.existsSync("./upload/type/" + req.params.file)) {
    var file = fs.createReadStream("./upload/type/" + req.params.file);
    file.pipe(res);
  } else return res.status(403).json({ message: false });
});

module.exports = router;
