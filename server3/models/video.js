var Sequelize = require('sequelize');
var configuration = require("../config")
var Document = require("./document")
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

// setup Etape model and its fields.
var Video = sequelize.define('videos', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
	video: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: true,        
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

Video.belongsTo(Document, {as: 'documents', foreignKey: 'id_document'}); 
// create all the defined tables in the specified database. alter:true 
sequelize.sync()
    .then(() => console.log('Etapes table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export Etape model for use in other files.
module.exports = Video;