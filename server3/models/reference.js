var Sequelize = require('sequelize');
var configuration = require("../config")
var User = require("./user")
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
var Reference = sequelize.define('referenceDocs', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
	reference: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true,         
    },
	file: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true,         
    },
    id_document: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: Document,
            key: "id"
        }
    }, 
    id_user: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: "id"
        }
    }, 
}); 
Reference.belongsTo(Document, {as: 'documents', foreignKey: 'id_document'}); 
Reference.belongsTo(User, {as: 'users', foreignKey: 'id_user'});  

// create all the defined tables in the specified database. 
sequelize.sync()
    .then(() => console.log('Reference table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export Demande model for use in other files.
module.exports = Reference;