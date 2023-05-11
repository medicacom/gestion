import React, { useCallback, useEffect } from "react";
import Components from "./components";
import Sidebar from "./components/Sidebar/Sidebar";
import AdminNavbar from "./components/Navbars/AdminNavbar";
import AdminFooter from "./components/Footers/AdminFooter";
import { Route, Routes, Navigate } from "react-router-dom";
import { getRootByRole } from "./Redux/rootBaseReduce";
import { useDispatch,useSelector } from "react-redux";
import RedactionDocument from "./Pages/Settings/UserDocument/RedactionDocument";
import DetailRedaction from "./Pages/Settings/UserDocument/DetailRedaction";
import ValidationDocument from "./Pages/Settings/Validation/ValidationDocument"; 
import DetailValidation from "./Pages/Settings/Validation/DetailValidation"; 
import Messagerie from "./Pages/Settings/Messagerie/Messagerie";

function RootBase() {
  const dispatch = useDispatch();
  const {users} = useSelector((state) => state.users);
  const [entities, setEntities] = React.useState([]);
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.collapse) {
        return getRoutes(prop.views);
      }
      if (
        prop.role.includes(users[0].data.user.id_role) ||
        prop.role.includes(0)
      ) {
        var component = React.createElement(
          Components[prop.componentStr],
          {obj:users[0].data},
          null
        );
        return <Route path={prop.path} key={key} element={component} />;
      }
      return null;
    });
  };
  //verif token
  const getUser = useCallback(async (user) => {
    if (user) {
      var root = await dispatch(getRootByRole(user[0].data.user.id_role));
      var resRoot = await root.payload;
      setEntities(resRoot);
    }
  }, [dispatch]);
  useEffect(() => {
    getUser(users);
  }, [getUser,users]);

  return (
    <>
      {users && entities.length>0 ? (
        <div className="wrapper">
          <Sidebar users={users[0].data} routes={entities} />
          <div className="main-panel">
            <AdminNavbar users={users[0].data} />
            <div className="content">
              <Routes>
                <Route path="/messagerie" element={<Messagerie users={users[0].data.user} />} />
                {users[0].data.userDoc > 0 && users[0].data.userType.includes(1) ? <Route path="/redactionDocument" element={<RedactionDocument type="1" users={users[0].data.user}/>} /> :"" }
                {users[0].data.userDoc > 0 && users[0].data.userType.includes(1) ? <Route path="/detailRedaction/:id" element={<DetailRedaction type="1" users={users[0].data.user} />} /> :"" }
                {users[0].data.userDoc > 0 && users[0].data.userType.includes(2) ? <Route path="/verificationDocument" element={<RedactionDocument type="2" users={users[0].data.user} />} /> :"" }
                {users[0].data.userDoc > 0 && users[0].data.userType.includes(2) ? <Route path="/validationRedaction" element={<ValidationDocument type="2" users={users[0].data.user} />} /> :"" }
                {users[0].data.userDoc > 0 && users[0].data.userType.includes(2) ? <Route path="/detailValidation/:id/:idUserDoc/:type" element={<DetailValidation type="2" users={users[0].data.user} />} /> :"" }
                {users[0].data.userDoc > 0 && users[0].data.userType.includes(2) ? <Route path="/detailVerifition/:id" element={<DetailRedaction type="2" users={users[0].data.user} />} /> :"" }
                
                {entities.length>0?getRoutes(entities):""}
                <Route
                  path="/login"
                  element={<Navigate replace to="/profile" />}
                />
                <Route path="/" element={<Navigate replace to="/profile" />} />
              </Routes>
            </div>
            <AdminFooter />
            <div
              className="close-layer"
              onClick={() =>
                document.documentElement.classList.toggle("nav-open")
              }
            />
          </div>
        </div>
      ) : ""}
    </>
  );
}

export default RootBase;
