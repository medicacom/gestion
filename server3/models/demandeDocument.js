var Sequelize = require("sequelize");
var configuration = require("../config");
var User = require("./user");
var Document = require("./document");
var Demande = require("./demande");
var config = configuration.connection;

// create a sequelize instance with our local postgres database information
const sequelize = new Sequelize(config.base, config.root, config.password, {
  host: config.host,
  port: config.port,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  operatorsAliases: false,
});

// setup DemandeDocument model and its fields.
var DemandeDocument = sequelize.define("demandedocuments",
  {
    id: {
      type: Sequelize.INTEGER,
      unique: true,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    id_rh: {
      type: Sequelize.INTEGER,
      unique: false,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    id_rq: {
      type: Sequelize.INTEGER,
      unique: false,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    id_document: {
      type: Sequelize.INTEGER,
      unique: false,
      allowNull: true, 
      references: {
        model: Document,
        key: "id",
      },
    },
    id_demande: {
      type: Sequelize.INTEGER,
      unique: false,
      allowNull: false,
      references: {
        model: Demande,
        key: "id",
      },
    },
  },
);

DemandeDocument.belongsTo(Demande, {as: 'demandes', foreignKey: 'id_demande'});  
DemandeDocument.belongsTo(Document, {as: 'documents', foreignKey: 'id_document'});  

// create all the defined tables in the specified database.
sequelize.sync()
  .then(() =>console.log("demandedocuments table has been successfully created, if one doesn't exist")
  )
  .catch((error) => console.log("This error occured", error));

// export DemandeDocument model for use in other files.
module.exports = DemandeDocument;
