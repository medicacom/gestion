import React, { useEffect,useCallback } from "react";
// react-bootstrap components
import { Button, Navbar, Nav, Container, Dropdown } from "react-bootstrap";
import { getNotification, updateNotif } from "../../Redux/notificationReduce";
import { useDispatch } from "react-redux";
import { getMessageByIdUser } from "../../Redux/messagerieReduce";

function AdminNavbar({users}) {
  let nom = users.user.nom_prenom;
  let role = users.user.id_role;
  let id = users.user.id;
  let service = users.user.id_service;
  let docu = users.docu;
  const [arrayMsg, setArrayMsg] = React.useState([]);
  const [countMsg, setCountMsg] = React.useState([]);
  const [entities, setEntities] = React.useState([]);
  /* const { entities } = useSelector((state) => state.notification);  */
  const dispatch = useDispatch();
  function LogOut(e) {
    e.preventDefault();
    localStorage.clear();
    window.location.replace("/login");
  }
  function Notification() {
    var array = [];
    array.push(
      <Dropdown.Item
        className="enteteDropDown"
        href="#"
        key={"entete-"+entities.length}
      >
        {entities.length} notification 
      </Dropdown.Item>
    );
    if (entities.length > 0) {
      entities.forEach((e) => {
        switch (e.etape) {
          case 0:
          case 1:
            if (role === 2 || role === 3)
              array.push(
                <Dropdown.Item
                  className={e.lu === 0 ? "nonlu" : ""}
                  href="#"
                  key={e.id}
                  onClick={(event) => {
                    dispatch(updateNotif({id:e.id,idUser:0}));
                    window.location.replace("/validationDemande");
                  }}
                >
                  Nouvelle demande
                </Dropdown.Item>
              );
            else if (e.id_user === id)
              array.push(
                <Dropdown.Item
                  className={e.lu === 0 ? "nonlu" : ""}
                  href="#"
                  key={e.id}
                  onClick={(event) => {
                    dispatch(updateNotif({id:e.id,idUser:0}));
                    window.location.replace("/demandeList");
                  }}
                >
                  Votre demande refusée
                </Dropdown.Item>
              );
            break;
          case 2:
            if (role === 2)
              array.push(
                <Dropdown.Item
                  className={e.lu === 0 ? "nonlu" : ""}
                  href="#"
                  key={e.id}
                  onClick={(event) => {
                    dispatch(updateNotif({id:e.id,idUser:0}));
                    window.location.replace("/listCreationDocument");
                  }}
                >
                  Creation de document
                </Dropdown.Item>
              );
            else
              array.push(
                <Dropdown.Item
                  className={e.lu === 0 ? "nonlu" : ""}
                  href="#"
                  key={e.id}
                  onClick={(event) => {
                    dispatch(updateNotif({id:e.id,idUser:0}));
                    window.location.replace("/demandeList");
                  }}
                >
                  {e.accept === 3
                    ? "Votre demande acceptée"
                    : "Votre demande refusée"}
                </Dropdown.Item>
              );
            break;
          case 3:
            array.push(
              <Dropdown.Item
                className={e.lu === 0 ? "nonlu" : ""}
                href="#"
                key={e.id}
                onClick={(event) => {
                  dispatch(updateNotif({id:e.id,idUser:0}));
                  window.location.replace("/ListIdentDocument");
                }}
              >
                Identification d'un document
              </Dropdown.Item>
            );
            break;
          case 4:
              var link ="";
              var msg="";
              switch(e.type){
                case 1:link ="/redactionDocument";msg="Rédaction";break;
                case 2:link ="/verificationDocument";msg="Vérification";break;
                default:break;
              }
              array.push(
                <Dropdown.Item
                  className={e.lu === 0 ? "nonlu" : ""}
                  href="#"
                  key={e.id}
                  onClick={(event) => {
                    dispatch(updateNotif({id:e.id,idUser:0}));
                    window.location.replace(link)
                  }}
                >

                {msg +" du document"}
                </Dropdown.Item>
              );
            break;
          case 5:
              array.push(
                <Dropdown.Item
                  className={e.lu === 0 ? "nonlu" : ""}
                  href="#"
                  key={e.id}
                  onClick={(event) => {
                    dispatch(updateNotif({id:e.id,idUser:id}));
                    window.location.replace("/validationRedaction");
                  }}
                >
                  Validation rédaction
                </Dropdown.Item>
              );
            break;
          case 6:
            array.push(
              <Dropdown.Item
                className={e.lu === 0 ? "nonlu" : ""}
                href="#"
                key={e.id}
                onClick={(event) => {
                  dispatch(updateNotif({id:e.id,idUser:0}));
                  window.location.replace("/redactionDocument");
                }}
              >
                Signature
              </Dropdown.Item>
            );
            break;
          case 8:
            if (role === 3)
              array.push(
                <Dropdown.Item
                  className={e.lu === 0 ? "nonlu" : ""}
                  href="#"
                  key={e.id}
                  onClick={(event) => {
                    dispatch(updateNotif({id:e.id,idUser:0}));
                    window.location.replace("/validationVerification");
                  }}
                >
                  Validation vérification
                </Dropdown.Item>
              );
            break;
          case 9:
            array.push(
              <Dropdown.Item
                className={e.lu === 0 ? "nonlu" : ""}
                href="#"
                key={e.id}
                onClick={(event) => {
                  dispatch(updateNotif({id:e.id,idUser:0}));
                  window.location.replace("/verificationDocument");
                }}
              >
                Signature
              </Dropdown.Item>
            );
            break;
          case 10:
            array.push(
              <Dropdown.Item
                className={e.lu === 0 ? "nonlu" : ""}
                href="#"
                key={e.id}
                onClick={(event) => {
                  dispatch(updateNotif({id:e.id,idUser:0}));
                  window.location.replace("/listReference");
                }}
              >
                Référence document
              </Dropdown.Item>
            );
            break;
          case 11:
            array.push(
              <Dropdown.Item
                className={e.lu === 0 ? "nonlu" : ""}
                href="#"
                key={e.id}
                onClick={(event) => {
                  dispatch(updateNotif({id:e.id,idUser:0}));
                  window.location.replace("/listApprobation");
                }}
              >
                Approbation document
              </Dropdown.Item>
            );
            break;
          case 12:            
              if (role === 4)
                array.push(
                  <Dropdown.Item
                    className={e.lu === 0 ? "nonlu" : ""}
                    href="#"
                    key={e.id}
                    onClick={(event) => {
                      dispatch(updateNotif({id:e.id,idUser:0}));
                      window.location.replace("/feuilleEmargement");
                    }}
                  >
                    Duplication
                  </Dropdown.Item>
                );
            break;
         case 14:            
            if (role !== 4)
              array.push(
                <Dropdown.Item
                  className={e.lu === 0 ? "nonlu" : ""}
                  href="#"
                  key={e.id}
                  onClick={(event) => {
                    dispatch(updateNotif({id:e.id,idUser:0}));
                    window.location.replace("/listeFormation");
                  }}
                >
                  Nouvelle formation
                </Dropdown.Item>
              );
          break;
          case 15:        
            array.push(
              <Dropdown.Item
                className={e.lu === 0 ? "nonlu" : ""}
                href="#"
                key={e.id}
                onClick={(event) => {
                  dispatch(updateNotif({id:e.id,idUser:id}));
                  window.location.replace("/listDocReference");
                }}
              >
                Référence règlementaire
              </Dropdown.Item>
            );
        break;          
          default:
            break;
        }
        
      });
    } else {
      array.push(
        <Dropdown.Item href="#" key={"no-data"}>
          Aucun notification
        </Dropdown.Item>
      );
    }
    array.push(
      <Dropdown.Item
        className="footerDropDown"
        href="#"
        key={"Lire"+array.length}
        onClick={(event) => {
          dispatch(updateNotif({id:0,idUser:id}));
          window.location.reload()
        }}
      >
        Lire toutes les notifications
      </Dropdown.Item>
    );
    return array;
  }
  const getMsg = useCallback(async () =>{  
    var array = [];
    var msg = await dispatch(getMessageByIdUser({id:id,role:role,docu:docu,service:service}));  
    var message = msg.payload;
    var i=0;
    array.push(
      <Dropdown.Item
        className="enteteDropDown"
        href="#"
        key={"msg-"+i}
      >
        {message.length} Message
      </Dropdown.Item>
    );
    if (message.length > 0) {
      message.forEach((e) => {
        i++;
        array.push(
          <Dropdown.Item
            className={e.lu === 0 ? "nonlu" : ""}
            href="#"
            key={"msgs-"+i}
            onClick={(event) => {
              
              localStorage.setItem("idDoc",e.documents.id);  
              localStorage.setItem("titreDoc",e.documents.titre);              
              window.location.replace("/messagerie");
            }}
          >
            {e.documents.titre} ({e.msg})
          </Dropdown.Item>
        );
      })
      
      setCountMsg(i)
     
    }else {
      array.push(
        <Dropdown.Item
          className=""
          href="#"
          key={"msg"}
         
        >
          Aucun message
        </Dropdown.Item>
      );
      
      setCountMsg(0)
    }
     array.push(
        <Dropdown.Item
          className="footerDropDown"
          href="#"
          key={"msg-fin"}
          onClick={(event) => {
            if (message.length > 0) {
              localStorage.setItem("idDoc",message[0].documents.id);  
              localStorage.setItem("titreDoc",message[0].documents.titre);    
            }
            window.location.replace("/messagerie");
          }}
        >
          Voir tous les messages <i className="fas fa-arrow-right"></i>
        </Dropdown.Item>
      );
    setArrayMsg(array)
    return array;
  }, [dispatch,docu, id, role, service])
  const getNotif = useCallback(async () =>{
    var notif = await dispatch(getNotification({ id, role,service }));
    setEntities(notif.payload)
  }, [dispatch, id, role, service])
  useEffect(() =>{
    getMsg();
    getNotif()
  }, [getNotif,getMsg])
  return (
    <>
      <Navbar expand="lg">
        <Container fluid>
          <div className="navbar-wrapper">
            <div className="navbar-minimize">
              <Button
                className="btn-fill btn-round btn-icon d-none d-lg-block bg-dark border-dark"
                variant="dark"
                onClick={() => document.body.classList.toggle("sidebar-mini")}
              >
                <i className="fas fa-ellipsis-v visible-on-sidebar-regular"></i>
                <i className="fas fa-bars visible-on-sidebar-mini"></i>
              </Button>
              <Button
                className="btn-fill btn-round btn-icon d-block d-lg-none bg-dark border-dark"
                variant="dark"
                onClick={() =>
                  document.documentElement.classList.toggle("nav-open")
                }
              >
                <i className="fas fa-list"></i>
                <i className="fas fa-bars visible-on-sidebar-mini"></i>
              </Button>
            </div>
            <Navbar.Brand
              href="#pablo"
              onClick={(e) => e.preventDefault()}
            ></Navbar.Brand>
          </div>

          <Nav navbar>
            <Dropdown as={Nav.Item} className="dropdown-notification">
              <Dropdown.Toggle
                as={Nav.Link}
                id="dropdown-414718872"
                variant="default"
              >
                <i className="nc-icon nc-bell-55 mr-1"></i>
                <span className="notification">{entities.length}</span>
                {/* <span className="d-lg-none">Notification</span> */}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Notification entities={entities}/>             
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown as={Nav.Item} className="dropdown-msg">
              <Dropdown.Toggle
                as={Nav.Link}
                id="dropdown-msg"
                variant="default"
              >
                <i className="nc-icon nc-chat-round"></i>
                <span className="notification">{countMsg}</span>              
               {/*  <span className="d-lg-none">Message</span> */}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {arrayMsg}
              </Dropdown.Menu>
            </Dropdown>

            <Dropdown as={Nav.Item} className="dropdown-profile">
              <Dropdown.Toggle
                as={Nav.Link}
                id="dropdown-41471887333"
                variant="default"
              >
                <span className="float-left">
                  <i className="nc-icon nc-single-02"></i>
                  {nom}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu aria-labelledby="navbarDropdownMenuLink">
                {role === 1 ? (
                  <Dropdown.Item
                    href="#"
                    onClick={(e) => window.location.replace("/Settings")}
                  >
                    <i className="fas fa-users-cog"></i>
                    Settings
                  </Dropdown.Item>
                ) : ""}
                <Dropdown.Item
                  href="#"
                  onClick={(e) => window.location.replace("/profile")}
                >
                  <i className="fas fa-user"></i>
                  Profil
                </Dropdown.Item>
                <div className="divider"></div>
                <Dropdown.Item
                  className="text-danger"
                  href="#"
                  onClick={LogOut}
                >
                  <i className="nc-icon nc-button-power"></i>
                  Déconnecter
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
}

export default AdminNavbar;
