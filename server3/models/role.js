var Sequelize = require("sequelize");
var configuration = require("../config");
var config = configuration.connection;

// create a sequelize instance with our local postgres database information.
const sequelize = new Sequelize(config.base, config.root, config.password, {
  host: config.host,
  port: config.port,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  operatorsAliases: false,
});

// setup Role model and its fields.
var Role = sequelize.define(
  "roles",
  {
    id: {
      type: Sequelize.INTEGER,
      unique: true,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true,
    },
  },
  { timestamps: false }
);

// create all the defined tables in the specified database. alter:true
sequelize
  .sync()
  .then(() => {
    console.log(
      "Roles table has been successfully created, if one doesn't exist"
    );

    Role.findAll().then(function (r) {
      if (r.length == 0) {
        Role.create({
          nom: "Admin",
        })
          .then((u) => {})
          .catch((error) => {
            return res.status(403).send(false);
          });
      }
    });
  })
  .catch((error) => console.log("This error occured", error));

// export Role model for use in other files.
module.exports = Role;
