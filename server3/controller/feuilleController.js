const express = require("express");
const router = express.Router();
var feuille = require("../models/feuille");
var feuilleDocument = require("../models/feuilleDocument");
var notification = require("../models/notification");
var user = require("../models/user");
const auth = require("../middlewares/passport");

// Desplay all lignes of client ...
router.post("/addFeuille", auth, (req, res) => {
  feuille.findOne({ where: { id_document: req.body.idDocument } })
    .then(function (f) {
      if (f == null) {
        feuille.create({
            imprimer: req.body.imprimer,
            id_document: req.body.idDocument,
          })
          .then((ref) => {
            req.body.userSelect.forEach((element) => {
              feuilleDocument.create({
                id_user: element.value,
                id_feuille: ref.id,
                id_document: req.body.idDocument,
                id_reference: req.body.idReference,
              });
              user.findOne({ where: { id: element.value } }).then(function (u) {
                notification.create({
                  id_user: u.id,
                  lu: 0,
                  etape: 13,
                  accept: 4,
                });
              });
            });
          });
        return res.status(200).send(true);
      } else {
        feuille.update(
            {
              imprimer: req.body.imprimer,
              id_document: req.body.idDocument,
            },
            { where: { id: f.id } }
          )
          .then((ref) => {
            feuilleDocument.destroy({
                where: { id_document: req.body.idDocument, id_feuille: f.id },
              })
              .then((doc) => {
                req.body.userSelect.forEach((element) => {
                  feuilleDocument.create({
                    id_user: element.value,
                    id_feuille: f.id,
                    id_document: req.body.idDocument,
                    id_reference: req.body.idReference,
                  });
                  user.findOne({ where: { id: element.value } })
                    .then(function (u) {
                      notification.create({
                        id_user: u.id,
                        lu: 0,
                        etape: 13,
                        accept: 4,
                      });
                    });
                });
              });

            return res.status(200).send(true);
          });
      }
    })
    .catch((error) => {
      return res.status(403).send(false);
    });
});

router.post("/getFeuille", auth, (req, res) => {
  var id = req.headers["id"];
  feuilleDocument
    .findAll({ where: { id_document: id }, include: ["feuilles"] })
    .then(function (r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        return res.status(200).json(r1);
      }
    });
});
module.exports = router;
