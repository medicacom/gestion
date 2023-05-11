var Sequelize = require('sequelize');
var configuration = require("../config")
var User = require("./user")
var Document = require("./document")
var Service = require("./service")
var config = configuration.connection;
	
// create a sequelize instance with our local postgres database information
const sequelize = new Sequelize(config.base, config.root, config.password, {
	host:config.host,
	port: config.port,
	dialect:'mysql',
	pool:{
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	}, 
	operatorsAliases: false
});

// setup Demande model and its fields.
var Demande = sequelize.define('demandes', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
	besoin : {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: true,        
    },
	type: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true,        
    },
	descriptions: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true,         
    },
	sujet: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true,         
    },
	file: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true,         
    },
	etat: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: true, 
        defaultValue: 0
    },
    id_personnel: {
       type: Sequelize.INTEGER,
       unique: false,
       allowNull: false,
       references: {
           model: User,
           key: "id"
       }
   }, 
   id_document: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
          model: Document,
          key: "id"
      }
    }, 
    id_service: {
       type: Sequelize.INTEGER,
       allowNull: true,
       references: {
           model: Service,
           key: "id"
       }
     },
}, { timestamps: false }); 

Demande.belongsTo(User, {as: 'users', foreignKey: 'id_personnel'});  
Demande.belongsTo(Service, {as: 'services', foreignKey: 'id_service'}); 
Demande.belongsTo(Document, {as: 'documents', foreignKey: 'id_document'}); 
// create all the defined tables in the specified database. 
sequelize.sync()
    .then(() => console.log('demandes table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export Demande model for use in other files.
module.exports = Demande;