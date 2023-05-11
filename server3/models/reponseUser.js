var Sequelize = require('sequelize');
var configuration = require("../config")
var user = require("./user")
var Document = require("./document")
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
var reponseusers = sequelize.define('reponseusers', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
	score: {
        type: Sequelize.FLOAT,
        unique: false,
        allowNull: true,         
    },
	scoreExamen: {
        type: Sequelize.FLOAT,
        unique: false,
        allowNull: true,         
    },
    id_user: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: false,
        references: {
            model: user,
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
},{ timestamps: false });
reponseusers.belongsTo(user, {as: 'users', foreignKey: 'id_user'}); 
reponseusers.belongsTo(Document, {as: 'documentss', foreignKey: 'id_document'});

// create all the defined tables in the specified database. 
sequelize.sync()
    .then(() => console.log('reponseusers table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export Demande model for use in other files.
module.exports = reponseusers;