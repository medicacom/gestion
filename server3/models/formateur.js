var Sequelize = require('sequelize');
var configuration = require("../config")
var User = require("./user")
var Formation = require("./formation")
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
var Formateur = sequelize.define('formateurs', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    id_formation: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: Formation,
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
Formateur.belongsTo(Formation, {as: 'formations', foreignKey: 'id_formation'}); 
Formateur.belongsTo(User, {as: 'users', foreignKey: 'id_user'});  

// create all the defined tables in the specified database. 
sequelize.sync()
    .then(() => console.log('Formateur table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export Demande model for use in other files.
module.exports = Formateur;