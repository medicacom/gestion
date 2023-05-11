const express = require("express");
const router = express.Router();
var video = require("../models/video");
var videoUser = require("../models/videoUser");
var document = require("../models/document");

const auth = require("../middlewares/passport");
const multer = require("multer");
var fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./video");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post("/saveVideoDoc", auth, upload.single("video"), (req, res) => {
  video
    .destroy({
      where: { id_document: req.body.idDoc },
    })
    .then((doc) => {
      video
        .create({
          id_document: req.body.idDoc,
          video: req.body.name,
        })
        .then((u) => {
          return res.status(200).send(true);
        });
    })
    .catch((error) => {
      return res.status(400).send(false);
    });
});

router.post("/saveVideoUser", auth, (req, res) => {
  video
    .findOne({ where: { id_document: req.body.idDoc } })
    .then(function (r1) {
      videoUser
        .create({
          id_video: r1.dataValues.id,
          id_user: req.body.idUser,
        })
        .then((u) => {
          return res.status(200).send(true);
        });
    })
    .catch((error) => {
      return res.status(400).send(false);
    });
});

router.get("/fetchVideo/:video", (req, res) => {
  if (fs.existsSync("./video/" + req.params.video)) {
    var file = fs.createReadStream("./video/" + req.params.video);
    file.pipe(res);
  } else return res.status(403).json({ message: false });
});

router.post("/getVideoDocument", auth, (req, res) => {
  var id = req.headers["id"];
  video.findOne({ where: { id_document: id } }).then(function (r1) {
    if (!r1) {
      return res.status(403).send(false);
    } else {
      return res.status(200).json(r1);
    }
  });
});

router.get("/getVideo/:idUser/:idDoc", auth, (req, res) => {
  videoUser
    .findOne({
      where: { id_user: req.params.idUser },
      include: {
        model: video,
        as: "videos",
        where: { id_document: req.params.idDoc },
      },
    })
    .then(function (r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        return res.status(200).json(r1);
      }
    });
});

module.exports = router;
