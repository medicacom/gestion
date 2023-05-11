var Sequelize = require('sequelize');
var configuration = require("../config")
var role = require("./role")
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

// setup TypeDocument model and its fields.
var Vigueur = sequelize.define('vigueurs', {
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
        allowNull: true, 
        
    },
	reference: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true,        
    },
	arborescence: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true,        
    },
	file: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true, 
        
    },
    id_role: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: false,
        references: {
            model: role,
            key: "id"
        } 
    },
}, { timestamps: false }); 
Vigueur.belongsTo(role, {as: 'roles', foreignKey: 'id_role'}); 

// create all the defined tables in the specified database. 
sequelize.sync()
    .then(() => console.log('Vigueur table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export TypeDocument model for use in other files.
module.exports = Vigueur;