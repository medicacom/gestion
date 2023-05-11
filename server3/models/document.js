var Sequelize = require('sequelize');
var configuration = require("../config")
var typeDocument = require("./typeDocument")
var Service = require("./service")
var config = configuration.connection;
	
// create a sequelize instance with our local postgres database information.
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

// setup Document model and its fields.
var Document = sequelize.define('documents', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
	titre: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false,         
    },
	note: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true,         
    },
	commentaire: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true,         
    },
	etat: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false,    
    },
    id_type: {
       type: Sequelize.INTEGER,
       unique: false,
       allowNull: false,
       references: {
           model: typeDocument,
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
    revision: {
       type: Sequelize.INTEGER,
       allowNull: true,
    },
	version: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: true,    
    },
    type_doc: {
      type: Sequelize.INTEGER,
      unique: false,
      allowNull: true,
      defaultValue: 0,
    },
}); 
Document.belongsTo(typeDocument, {as: 'types', foreignKey: 'id_type'});
Document.belongsTo(Service, {as: 'services', foreignKey: 'id_service'}); 

// create all the defined tables in the specified database. 
sequelize.sync({alter:true})
    .then(() => console.log('documents table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export Document model for use in other files.
module.exports = Document;