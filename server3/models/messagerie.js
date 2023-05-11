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

// setup UserDocument model and its fields.
var Messagerie = sequelize.define('messagerie', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
	text: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false,     
    },
	type: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false,     
    },
    id_user: {
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
        unique: false,
        allowNull: false,
        references: {
            model: Document,
            key: "id"
        }
    }, 
}); 

Messagerie.belongsTo(Document, {as: 'documents', foreignKey: 'id_document'}); 

Messagerie.belongsTo(User, {as: 'users', foreignKey: 'id_user'});  
// create all the defined tables in the specified database. 
sequelize.sync()
    .then(() => console.log('Messagerie table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));
// export UserDocument model for use in other files.
module.exports = Messagerie;