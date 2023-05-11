import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/style.css";
import "./assets/scss/style.scss?v=2.0.0";
import { Provider } from "react-redux";
import React from "react";
import ReactDOM from "react-dom";
import store from "./store";
import LoginPage from "./Pages/Settings/User/LoginPage.js";
import { getSettings } from "./Redux/settingsReduce";
import { getDetailUser } from "./Redux/usersReduce";
import RootBase from "./RootBase";
import jwt from "jsonwebtoken";

var token = "";
var loginStorage = null;
var hrefURL = null;
token = localStorage.getItem("x-access-token");

try {
  store.dispatch(getSettings(1));
} catch (error) {
  console.log("settings",error);  
}

if(token !== null){
    try {
      const decoded = jwt.verify(token, "mySecretKeyabs");
      loginStorage = 1;
      if(decoded.id)
        store.dispatch(getDetailUser(decoded.id));
      else {
        localStorage.clear();
        window.location.replace("/login");
      }
    } catch (err) {
      localStorage.clear();
      window.location.replace("/login");
      console.log("token",err)
    }
}
if(hrefURL==="/login"){
  document.title = "login";
}
 
/* document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});
document.onkeydown = function(e) {
  if(e.keyCode === 123) {
    e.preventDefault();
  }
  if(e.ctrlKey && e.shiftKey && e.keyCode === 'I'.charCodeAt(0)) {
    e.preventDefault();
  }
  if(e.ctrlKey && e.shiftKey && e.keyCode === 'C'.charCodeAt(0)) {
    e.preventDefault();
  }
  if(e.ctrlKey && e.shiftKey && e.keyCode === 'J'.charCodeAt(0)) {
    e.preventDefault();
  }
  if(e.ctrlKey && e.keyCode === 'S'.charCodeAt(0)) {
    e.preventDefault();
  }
  if(e.ctrlKey && e.keyCode === 'U'.charCodeAt(0)) {
    e.preventDefault();
  }
} */
ReactDOM.render(
  <Provider store={store}>  
  
    <BrowserRouter>
   
      {loginStorage !==null?
       
        <RootBase/>
        /* ( <div className="wrapper">
          <Sidebar routes={routes} />
          <div className="main-panel">
            <AdminNavbar />
            <div className="content">
              <RootBase idUser={idUser}/>
              <Routes>
                {idrole === 2 || idrole === 3 || idDoc > 0? <Route path="/messagerie" element={<Messagerie />} /> :"" }
                {idDoc > 0 && userType.includes(1) ? <Route path="/redactionDocument" element={<RedactionDocument type="1" />} /> :"" }
                {idDoc > 0 && userType.includes(1) ? <Route path="/detailRedaction/:id" element={<DetailRedaction type="1" />} /> :"" }
                {idDoc > 0 && userType.includes(2) ? <Route path="/verificationDocument" element={<RedactionDocument type="2" />} /> :"" }
                {idDoc > 0 && userType.includes(2) ? <Route path="/validationRedaction" element={<ValidationDocument type="2" />} /> :"" }
                {idDoc > 0 && userType.includes(2) ? <Route path="/detailValidation/:id/:idUserDoc/:type" element={<DetailValidation type="2" />} /> :"" }
                {idDoc > 0 && userType.includes(2) ? <Route path="/detailVerifition/:id" element={<DetailRedaction type="2" />} /> :"" }
                <Route path="/" element={<Navigate replace to="/profil" />} />
                {getRoutes(routes)}
              </Routes>
            </div>
            <AdminFooter />
            <div className="close-layer"
              onClick={() =>
                document.documentElement.classList.toggle("nav-open")
              }
            />
          </div>
        </div>) */
      :
      
      <div className="wrapper wrapper-full-page">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path='/*' element={<Navigate replace to="/login" />} />
        </Routes>
      </div> 
      }
      
    </BrowserRouter>
  </Provider>,

  document.getElementById("root")
);

