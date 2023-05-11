const express = require("express");
const router = express.Router();
var messagerie = require("../models/messagerie");
var document = require("../models/document");
const auth = require("../middlewares/passport");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");

// Desplay all lignes of client ...
router.post("/addMessage", auth, (req, res) => {
  messagerie
    .create({
      text: req.body.text,
      type: req.body.type,
      id_user: req.body.idUser,
      id_document: req.body.idDocument,
      lu: 0,
    })
    .then((d) => {
      return res.status(200).send(true);
    })
    .catch((error) => {
      console.log(error);
      return res.status(403).send(false);
    });
});

router.get("/getMessage/:id", auth, (req, res) => {
  messagerie
    .findAll({ where: { id_document: req.params.id }, include: ["users"] })
    .then(function (r) {
      return res.status(200).send(r);
    });
});

router.post("/getMessageByIdUser", auth, (req, res) => {
  switch (req.body.role) {
    case 3:
      messagerie.findAll({
          where: { id_user: { [Op.ne]: req.body.id } },group:'id_document',attributes: [
          [ Sequelize.fn("COUNT", Sequelize.col("id_document")), "msg"] ],
          include: ["users", "documents"],
        order: [[ "createdAt", 'DESC']]  })
        .then(function (r) {
          return res.status(200).send(r);
        });
      break;
    case 2:
      messagerie.findAll({
          where: { id_user: { [Op.ne]: req.body.id } },
          group:'id_document',attributes: [
            [ Sequelize.fn("COUNT", Sequelize.col("id_document")), "msg"] ],
          include: [
            "users",
            {
              model: document,
              as: "documents",
              where: { id_service: req.body.service },
            },
          ],
          order: [[ "createdAt", 'DESC']]  })
        .then(function (r) {
          return res.status(200).send(r);
        });
      break;
    default:
      messagerie.findAll({
          where: {
            id_user: { [Op.ne]: req.body.id}, id_document: req.body.docu 
          }
          ,group:'id_document',attributes: [
            [ Sequelize.fn("COUNT", Sequelize.col("id_document")), "msg"] ],
          include: ["users", "documents"],
          order: [[ "createdAt", 'DESC']]  })
        .then(function (r) {
          return res.status(200).send(r);
        });
      break;
  }
});

router.put("/update/:id", auth, (req, res) => {
  var id = req.params.id;
  messagerie.update({ lu: 1 }, { where: { id: id } }).then(function (r1) {
    if (!r1) {
      return res.status(403).send(false);
    } else {
      return res.status(200).json(r1.dataValues);
    }
  });
});

module.exports = router;
