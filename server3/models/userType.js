var Sequelize = require('sequelize');
var configuration = require("../config")
var User = require("./user")
var Type = require("./typeDocument")
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

// setup userType model and its fields.
var UserType = sequelize.define('usertypes', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
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
   id_type: {
      type: Sequelize.INTEGER,
      unique: false,
      allowNull: false,
      references: {
          model: Type,
          key: "id"
      }
  }, 
}, { timestamps: false }); 

UserType.belongsTo(Type, {as: 'typeDocuments', foreignKey: 'id_type'}); 

UserType.belongsTo(User, {as: 'users', foreignKey: 'id_user'});  
// create all the defined tables in the specified database. 
sequelize.sync()
    .then(() => console.log('UserType table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));
// export userType model for use in other files.
module.exports = UserType;