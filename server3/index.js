// Importing the packages required for the project.
// {alter:true }
const express = require("express");
var app = express();
const path = require("path");
var cors = require("cors");
app.use(cors());
app.use(express.static(path.join(__dirname, "../client/build")));
// Used for sending the Json Data to Node API 
app.use(express.json());
/* sequelize.sync({alter:true}) cette commande pour alter table dans n import model*/
app.use("/formation/", require("./controller/formationController")); 
app.use("/role/", require("./controller/roleController"));
app.use("/service/", require("./controller/serviceController")); 
app.use("/user/", require("./controller/userController")); 
app.use("/typeDocument/", require("./controller/typeDocController"));
app.use("/demande/", require("./controller/demandeController"));
app.use("/document/", require("./controller/documentController"));
app.use("/userDocument/", require("./controller/userDocController"));
app.use("/settings/", require("./controller/settingsController"));
app.use("/notification/", require("./controller/notificationController")); 
app.use("/vigueur/", require("./controller/vigueurController")); 
app.use("/reference/", require("./controller/referenceController")); 
app.use("/feuille/", require("./controller/feuilleController"));  
app.use("/generatePdf/", require("./controller/pdfController")); 
app.use("/sendMail/", require("./controller/sendMailController")); 
app.use("/messagerie/", require("./controller/messagerieController")); 
app.use("/video/", require("./controller/videoController")); 
app.use("/pdfFeuille/", require("./controller/pdfFeuilleController")); 
app.use("/root/", require("./controller/rootController")); 

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
}); 

const PORT = 4003 || 5000 || 6000;
app.listen(PORT, (err) =>
  err ? console.log(err) : console.log(`app listening on port ${PORT}!`)
);
