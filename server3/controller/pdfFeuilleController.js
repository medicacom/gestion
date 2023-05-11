const express = require("express");
const router = express.Router();
const pdf = require("pdf-creator-node");
const path = require("path");
const options = require("../helpers/options");
const auth = require("../middlewares/passport");
var user = require("../models/user");
var fs = require("fs");
resolve = require("path").resolve;

//generer fichier pdf selon user selected
router.post("/generatePdfFeuille", auth, (req, res) => {
  const html = fs.readFileSync(
    path.join(__dirname, "../views/feuille.html"),
    "utf-8"
  );
  let array = [];
  /** start formating date**/
  var date = new Date();
  var dateR =
    date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
  const filename = req.body.reference.replaceAll(" ", "") + ".pdf";
  req.body.userSelect.forEach((us) => {
    appImgB64 = fs.readFileSync("./upload/signature/" + us.sign, {
      encoding: "base64",
    });
    appImg = "data:image/jpeg;base64," + appImgB64;
    const prod = {
      reference: req.body.reference,
      nom_prenom: us.label,
      signature: appImg,
      date: dateR,
    };
    array.push(prod);
  });
  const obj = {
    prodlist: array,
  };
  const document = {
    html: html,
    data: {
      documents: obj,
    },
    path: "./upload/feuille/" + filename,
  };
  pdf.create(document, options)
    .then((r) => {
      return res.status(200).json(filename);
    })
    .catch((err) => {
      return res.status(200).json(false);
    });
});

router.get("/getFile/:file", (req, res) => {
  if (fs.existsSync("./upload/feuille/" + req.params.file)) {
    var file = fs.createReadStream("./upload/feuille/" + req.params.file);
    file.pipe(res);
  } else return res.status(403).json({ message: false });
});
module.exports = router;
