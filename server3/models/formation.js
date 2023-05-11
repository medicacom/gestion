var Sequelize = require('sequelize');
var configuration = require("../config")
var Service = require("./service")
var Reference = require("./reference")
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
var Formation = sequelize.define('formations', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    etat: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: true,         
    },
    sujet: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true,         
    },
    lieu: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true,         
    },
    type: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: true,         
    },
    typeFormation: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: true,         
    },
	date: {
        type: Sequelize.DATE,
        unique: false,
        allowNull: true,         
    },
    heurD: {
        type: Sequelize.TIME,
        unique: false,
        allowNull: true,         
    },    
    heurF: {
        type: Sequelize.TIME,
        unique: false,
        allowNull: true,         
    },
    fiche: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true
    }, 
    id_reference: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: Reference,
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
}); 
Formation.belongsTo(Reference, {as: 'referencedocs', foreignKey: 'id_reference'}); 
Formation.belongsTo(Service, {as: 'services', foreignKey: 'id_service'});  

// create all the defined tables in the specified database. 
sequelize.sync()
    .then(() => console.log('Formation table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export Demande model for use in other files.
module.exports = Formation;