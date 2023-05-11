import React from "react";
import { Link, useLocation } from "react-router-dom";
// react-bootstrap components
import { Collapse, Nav } from "react-bootstrap";
import { useSelector } from "react-redux";

function Sidebar({ routes, background,users }) {
  let location = useLocation();
  const { entities } = useSelector((state) => state.settings);
  const [state, setState] = React.useState({});
  var idrole = users.user.id_role;
  var idDoc = users.userDoc;
  var userType = users.userType;
  const getCollapseInitialState = (routes) => {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse && getCollapseInitialState(routes[i].views)) {
        return true;
      } else if (location.pathname === routes[i].layout + routes[i].path) {
        return true;
      }
    }
    return false;
  };
  // this function creates the links and collapses that appear in the sidebar (left menu)
  const createLinks = (routes) => {
    return routes.map((prop, key) => {
      var st = {};
      if ( prop.role.includes(idrole) || prop.role.includes(0) ||
       (prop.role.includes(20) && idDoc > 0 && userType.includes(parseInt(prop.type))) ||
        (prop.role.includes(21) && (( idDoc > 0 && userType.includes(prop.type) ) || (idrole ===2 || idrole === 3))) ) {
        if (prop.redirect) {
          return null;
        }
        if (prop.collapse) {
          st[prop["state"]] = !state[prop.state];
          return (
            <Nav.Item
              className={getCollapseInitialState(prop.views) ? "active" : ""}
              as="li"
              key={key}
            >
              <Nav.Link
                className={state[prop.state] ? "collapsed" : ""}
                data-toggle="collapse"
                onClick={(e) => {
                  e.preventDefault();
                  setState({ ...state, ...st });
                }}
                aria-expanded={state[prop.state]}
              >
                <i className={prop.icon}></i>
                <p>
                  {prop.name} <b className="caret"></b>
                </p>
              </Nav.Link>
              <Collapse in={state[prop.state]}>
                <div>
                  <Nav as="ul">{createLinks(prop.views)}</Nav>
                </div>
              </Collapse>
            </Nav.Item>
          );
        }
        return (
          <Nav.Item className={activeRoute(prop.path)} key={key} as="li">
            {getTitle(prop.path, prop.name)}
            <Nav.Link className={prop.className} to={prop.path} as={Link}>
              {prop.icon ? (
                <>
                  <i className={prop.icon} />
                  <p>{prop.name}</p>
                </>
              ) : (
                <>
                  <span className="sidebar-mini">{prop.mini}</span>
                  <span className="sidebar-normal">{prop.name}</span>
                </>
              )}
            </Nav.Link>
          </Nav.Item>
        );
      } else {      
        return null;
      }
    });
  };
  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname === routeName ? "active" : "";
  };
  function getTitle(routeName, name) {
    var splitpath = location.pathname.split("/");
    var splitRoute = routeName.split("/");
    if (splitpath[1] === splitRoute[1]) {
      document.title = name;
      //return location.pathname === routeName ? routeName : "";
    }
  }
  return (
    <>
      <div className="sidebar" data-color={background}>
        <div className="sidebar-wrapper">
          <div className="logo">
            <div className="bglogo">
              {entities.length > 0 ? (
                <img
                  src={require("../../assets/img/" + entities[0].logo).default}
                  alt="medicacom"
                />
              ) : ""}
              {/* <img alt="medicacom" src={medicacom}></img> */}
            </div>
          </div>

          <Nav as="ul">{createLinks(routes)}</Nav>
        </div>
      </div>
    </>
  );
}

Sidebar.defaultProps = {
  image: "",
  background: "black",
  routes: [],
};

export default Sidebar;
