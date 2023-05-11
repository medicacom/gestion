var Sequelize = require("sequelize");
var configuration = require("../config");
var User = require("./user");
var Document = require("./document");
var Reference = require("./reference");
var Feuille = require("./feuille");
var User = require("./user");
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

// setup Demande model and its fields.
var FeuilleDocument = sequelize.define("feuilleDocuments", {
  id: {
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  id_document: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: Document,
      key: "id",
    },
  },
  id_feuille: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: Feuille,
      key: "id",
    },
  },
  id_reference: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: Reference,
      key: "id",
    },
  },
  id_user: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: "id",
    },
  },
},{ timestamps: false });
FeuilleDocument.belongsTo(Feuille, {as: 'feuilles', foreignKey: 'id_feuille'});   
FeuilleDocument.belongsTo(Document, {as: 'documents', foreignKey: 'id_document'});  
FeuilleDocument.belongsTo(User, {as: 'users', foreignKey: 'id_user'});  
FeuilleDocument.belongsTo(Reference, {as: 'referencedocs', foreignKey: 'id_reference'}); 
// create all the defined tables in the specified database.
sequelize.sync()
  .then(() => console.log("Feuille Document table has been successfully created, if one doesn't exist"))
  .catch((error) => console.log("This error occured", error));

// export Demande model for use in other files.
module.exports = FeuilleDocument;
