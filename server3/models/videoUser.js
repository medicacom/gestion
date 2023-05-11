var Sequelize = require('sequelize');
var configuration = require("../config")
var video = require("./video")
var user = require("./user")
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
var VideoUser = sequelize.define('videousers', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    id_video: {
        type: Sequelize.INTEGER,
        unique: false,
        allowNull: false,
        references: {
            model: video,
            key: "id"
        } 
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
}); 

VideoUser.belongsTo(video, {as: 'videos', foreignKey: 'id_video'}); 
VideoUser.belongsTo(user, {as: 'users', foreignKey: 'id_user'}); 

// create all the defined tables in the specified database. alter:true 
sequelize.sync()
    .then(() => console.log('VideoUser table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export Etape model for use in other files.
module.exports = VideoUser;