var Sequelize = require('sequelize');
var configuration = require("../config")
var user = require("./user")
var formation = require("./formation");
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
var Invite = sequelize.define('inviteformations', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    id_user: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: user,
            key: "id"
        }
    },
    id_formation: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: formation,
            key: "id"
        }
    },
});  
Invite.belongsTo(user, {as: 'users', foreignKey: 'id_user'}); 
Invite.belongsTo(formation, {as: 'formations', foreignKey: 'id_formation'}); 

// create all the defined tables in the specified database. 
sequelize.sync()
    .then(() => console.log('Invite table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export Demande model for use in other files.
module.exports = Invite;