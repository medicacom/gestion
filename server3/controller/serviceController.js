const express = require("express");
const router = express.Router();
var service = require("../models/service");
const auth = require("../middlewares/passport");

// Desplay all lignes of client ...
router.post("/addService", auth, (req, res) => {
  var id = req.body.id;
  if (id == 0) {
    service
      .create({
        nom: req.body.nom,
      })
      .then((r) => {
        return res.status(200).send(true);
      })
      .catch((error) => {
        return res.status(403).send(false);
      });
  } else {
    service.findOne({ where: { id: id } }).then(function (r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        service
          .update({
            nom: req.body.nom, 
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

router.post("/allService", auth, (req, res) => {
  service.findAll().then(function (r) {
    return res.status(200).send(r);
  });
});


router.delete("/deleteService/:id", auth, (req, res) => {
  var id = req.params.id;
  service.findOne({ where: { id: id } }).then(function (r1) {
    if (!r1) {
      return res.status(403).send(false);
    } else {
      service.destroy({ where: { id: id } })
        .then((r2) => {
          return res.status(200).send(true);
        })
        .catch((error) => {
          return res.status(403).send(false);
        });
    }
  });
});

router.post("/getService", auth, (req, res) => {
  var id = req.headers["id"];
  service.findOne({ where: { id: id } }).then(function (r1) {
    if (!r1) {
      return res.status(403).send(false);
    } else {
      return res.status(200).json(r1.dataValues);
    }
  });
});

module.exports = router;
