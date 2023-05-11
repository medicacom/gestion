import NotificationAlert from "react-notification-alert";
import SweetAlert from "react-bootstrap-sweetalert";
import ReactTable from "../../../components/ReactTable/ReactTable.js";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import React,{useEffect,useCallback} from "react";
import { getDemandeByRole,demandeChangeEtat,demandeGetById,getFile } from "../../../Redux/demandeReduce";
import { useDispatch } from "react-redux";
import { verification } from "../../../Redux/usersReduce";
// core components 
function ValidationDemande({obj}) {
  const dispatch = useDispatch();
  var idRole = obj.user.id_role;
  var idService = obj.user.id_service;
  var idUser = obj.user.id;
  const [entitiess, setEntitiess] = React.useState([]);
  const notificationAlertRef = React.useRef(null);
  const [alert, setAlert] = React.useState(null);
  const notify = (place, msg, type) => {
    var options = {};
    options = {
      place: place,
      message: (
        <div>
          <div>
            {msg}
          </div>
        </div>
      ),
      type: type,
      icon: "nc-icon nc-bell-55",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  };
  const confirmMessage = (id,etat,e) => {
    setAlert(
      <SweetAlert
        style={{ display: "block", marginTop: "-100px" }}
        title={etat === 0?"Étes vous sure d'accepter cette demande?":"Étes vous sure d'annuler cette demande?"}
        onConfirm={() => changeEtat(id,etat,e)}
        onCancel={() => hideAlert()}
        confirmBtnBsStyle="info"
        cancelBtnBsStyle="danger"
        confirmBtnText="Oui"
        cancelBtnText="Non"
        showCancel
      >
        {/* Vous éte sure de supprime cette User? */}
      </SweetAlert>
    );
  };
  const hideAlert = () => {
    setAlert(null);
  };
  function changeEtat(id,etat,e) {

    dispatch(demandeChangeEtat({ id,idRole,etat,idUser }));
    document
      .getElementById(e.target.id)
      .parentElement.parentElement.parentElement.remove();
      hideAlert()
    notify("tr", "Demande acceptée avec succès", "success");
  }

  const detailsDemande = (id) => {
    const promise = new Promise((resolve) => {
      setTimeout(async () => {
        var action = await dispatch(demandeGetById(id));
        var demande = action.payload;
        var fileVal ="";
        if(demande.file !==""){  
          var file = await dispatch(getFile(demande.file));
          fileVal=file.payload
        }
        resolve({demande:demande,file:fileVal});
      }, 0);
    });

    promise.then(async (value) => {
      var pop_up = await value.demande.demande;
      setAlert(
        <SweetAlert
          title={pop_up.demandes.sujet}
          style={{ display: "block", marginTop: "-100px" }}
          onConfirm={() => hideAlert()}
          onCancel={() => hideAlert()}
          confirmBtnBsStyle="info"
        >
          <Row>
            <Col md="12">
              Titre : {pop_up.demandes.sujet}
              <br></br>
            </Col>
            <Col md="12">
              Besoin : {pop_up.demandes.besoin===1?"Création":"Révision"}
              <br></br>
            </Col>
            {pop_up.demandes.besoin===1?
              <Col md="12">
                  <Col md="12">
                    type de document : {pop_up.demandes.type}
                    <br></br>
                  </Col>
                  <Col md="12">
                    Description : {pop_up.demandes.descriptions}
                    <br></br>
                  </Col>
                </Col>:

                <Col md="12">
                  Titre de document : {pop_up.demandes.documents.titre}
                  <br></br>
                </Col>
           }
           <Col md="12">
             {value.file !==""?
               <a download rel="noreferrer" href={value.file} className="fileUrl" target='_blank'>
                 <i className="fas fa-file"></i><br></br>Consulter
               </a>
             :""}
           </Col>
          </Row>
        </SweetAlert>
      );
    });
  };

  //verif token
  const verifToken = useCallback(async () => {
    var response = await dispatch(verification());
    if (response.payload === false) {
      localStorage.clear();
      window.location.replace("/login");
    }
  }, [dispatch]);

  useEffect(() => {
    verifToken();
    const promise = new Promise((resolve, reject) => {
      setTimeout(async () => {
          var response = await dispatch(getDemandeByRole({idRole,idService}));
          resolve(response.payload);
      }, 0);
    });

    promise.then((value) => {
      setEntitiess(value);
    });
  }, [dispatch,verifToken,idRole,idService]) //now shut up eslint
  return (
    <>
      {alert}
      <Container fluid>
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <Row>
          <Col md="12">
            <h4 className="title">Liste des demandes en cours</h4>
            <Card className="card-header">
              <Card.Body>
                <ReactTable
                  data={entitiess}
                  columns={[
                    {
                      Header: "Demandeur",
                      accessor: "users.nom_prenom",
                    },
                    {
                      Header: "besoin",
                      accessor: "besoin",
                      Cell: ({ cell }) => (
                        (cell.row.values.besoin === 1? "creation":"Révision")
                      ),
                    },
                    {
                      Header: "sujet",
                      accessor: "sujet",
                    },
                    {
                      Header: "détails",
                      accessor: "id_personnel",
                      Cell: ({ cell }) => (
                        <div className="block_action">
                          
                          <Button
                            id={"idLigne_" + cell.row.values.id}
                            onClick={(e) => {
                              detailsDemande(cell.row.values.id);
                            }}
                            className="btn btn-info"
                          >
                            <i className="fa fa-eye mr-1" id={"idLigne_" + cell.row.values.id}/>Détails
                          </Button>
                        </div>
                      ),
                    },
                    {
                      Header: "actions",
                      accessor: "id",
                      Cell: ({ cell }) => (
                        <div className="actions-right block_action">
                          
                          <Button
                            id={"idLigne_" + cell.row.values.id}
                            onClick={(e) => {
                              confirmMessage(cell.row.values.id,0,e);
                            }}
                            className="delete btn btn-success"
                          >
                            <i className="fa fa-check" id={"idLigne_" + cell.row.values.id}/> Valider
                          </Button>
                          
                          <Button
                            id={"idLigne_" + cell.row.values.id}
                            onClick={(e) => {
                              confirmMessage(cell.row.values.id,1,e);
                            }}
                            className="delete btn btn-danger ml-1"
                          >
                            <i className="fa fa-times" id={"idLigne_" + cell.row.values.id}/> Annuler
                          </Button>
                        </div>
                      ),
                    },
                  ]} 
                  className="-striped -highlight primary-pagination"
                />
                {entitiess.length === 0 ? (
                  <div className="text-center">Aucun donnée trouvé</div>
                ) : ""}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ValidationDemande;
