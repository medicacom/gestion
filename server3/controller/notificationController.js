const express = require("express");
const Sequelize = require('sequelize');
var config = require("../config")
const router = express.Router();
var notification = require("../models/notification");
const auth = require("../middlewares/passport");
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

//get notification by idUser, role et service
router.get("/getNotification/:id/:role/:service",auth, (req, res) => {
  /** 
  * etat 
  * 0-Nouvelle demande
  * 1-Nouvelle demande
  * 2-Création de document
  * 3-Identification d'un document  
  * 4-Rédaction du document (type =1)
  * 4-Vérification du document (type =2)
  * 5-Validation rédaction
  * 6-Signature rédaction
  * 8-Validation vérification
  * 9-Signature vérification
  * 10-Référence document
  * 11-Approbation document
  * 12-Duplication
  * 14-Nouvelle formation
  * 15-Référence règlementaire
  **/
  var condition=[];
  var where=" ";
  if(req.params.role!=4) where=" where  (etape=14 and id_service="+req.params.service+" and lu=0 ) or (etape=14 and lu=0 ) or ";
  else where=" where ";

  switch(req.params.role){ 
    case "2": condition.push(' etape in (0,2) ');break;
    case "3": condition.push(' etape in (1,3,8,10) '); condition.push(' (accept =1 or accept=4) ');break;
    case "4": condition.push(' etape in (12) ');break;
    case "5": condition.push(' id_user ='+req.params.id);condition.push(' etape in (11,4) ');break;
    default: condition.push(' id_user ='+req.params.id);condition.push(' accept > 1 ');condition.push(' etape in (2,1,7,15) ');break;
  }  
  condition.push(' lu=0 ');
  if(condition.length>0) {where+=condition.join(' and ');}
  if(req.params.id!=null || req.params.id!="null"){
    where+=' or (etape =4 and lu=0 and id_user ='+req.params.id+') or (etape =5 and lu=0 and id_user ='+req.params.id+') or (etape =6 and lu=0 and id_user ='+req.params.id+') or (etape =9 and lu=0 and id_user ='+req.params.id+')' 
  }

    var sql = `SELECT * FROM notifications   ${where} `;
    sequelize.query(sql, { type: sequelize.QueryTypes.SELECT}).then(function (r1) {
      if (!r1) {
        return res.status(403).send(false);
      } else {
        return res.status(200).json(r1);
      }
    });
});

router.put("/update/:id/:idUser",auth, (req, res) => {
  var id = req.params.id; 
  var idUser = req.params.idUser; 
  var where = {};
  if((id)==0) where={id_user:idUser}
  else where ={ id: id }
  notification.update({lu:1},{ where: where }).then(function (r1) {
    if (!r1) {
      return res.status(403).send(false);
    } else {
      return res.status(200).json(r1.dataValues);
    }
  });
});

module.exports = router;
