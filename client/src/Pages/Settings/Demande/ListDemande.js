import NotificationAlert from "react-notification-alert";
import SweetAlert from "react-bootstrap-sweetalert";
import ReactTable from "../../../components/ReactTable/ReactTable.js";
import { Button, Card, Container, Row, Col, Nav, Tab, } from "react-bootstrap";
import React,{useEffect,useCallback} from "react";
import { fetchDemande,demandeDeleted,demandeGetById,getFile } from "../../../Redux/demandeReduce";
import { useDispatch } from "react-redux";

import { verification } from "../../../Redux/usersReduce";

// core components
function ListDemande({obj}) {
  const dispatch = useDispatch();
  var idPersonnel = obj.user.id;
  const [entities, setEntities] = React.useState([]);
  const [entitiesAnnuler, setEntitiesAnnuler] = React.useState([]);
  const [entitiesValider, setEntitiesValider] = React.useState([]);
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
  const confirmMessage = (id,e) => {
    setAlert(
      <SweetAlert
        style={{ display: "block", marginTop: "-100px" }}
        title="Étes vous sure de supprimer cette demande?"
        onConfirm={() => deleteDemande(id,e)}
        onCancel={() => hideAlert()}
        confirmBtnBsStyle="info"
        cancelBtnBsStyle="danger"
        confirmBtnText="Oui"
        cancelBtnText="Non"
        showCancel
      >
      </SweetAlert>
    );
  };
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
  const hideAlert = () => {
    setAlert(null);
  };
  function ajouter() {
    window.location.href = "/ajouterDemande";
  }
  function deleteDemande(id,e) {
    dispatch(demandeDeleted({ id }));
    document
      .getElementById(e.target.id)
      .parentElement.parentElement.parentElement.remove();
      hideAlert()
    notify("tr", "Demande supprimer avec succes", "success");
  }

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
          var response = await dispatch(fetchDemande(idPersonnel));
          resolve(response.payload);
      }, 0);
    });

    promise.then((value) => {
      var arrayEnCours = [];
      var arrayValider = [];
      var arrayAnnuler = [];
      value.map(val=>{
        if(val.etat <=1){
          arrayEnCours.push(val)
        } else if(val.etat ===2 || val.etat ===4 ){
          arrayAnnuler.push(val)
        } else {
          arrayValider.push(val)
        } 
        return val;
      })
      setEntities(arrayEnCours);
      setEntitiesAnnuler(arrayAnnuler);
      setEntitiesValider(arrayValider)
    });
  }, [dispatch,idPersonnel,verifToken]) //now shut up eslint
  return (
    <>
      {alert}
      <Container fluid>
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <Row>
          <Col md="12">
            <Button
              id="saveBL"
              className="btn-wd btn-outline mr-1 float-left"
              type="button"
              variant="info"
              onClick={ajouter}
            >
              <span className="btn-label">
                <i className="fas fa-plus"></i>
              </span>
              Ajouter une demande
            </Button>
          </Col>
          <Col md="12">
            <Card className="card-header"> 
                <Card.Body>
                  <Tab.Container id="plain-tabs-example" defaultActiveKey="info-plain">
                    <Nav role="tablist" variant="tabs">
                      <Nav.Item>
                        <Nav.Link eventKey="info-plain">En cours</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="account-plain">Annuler</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="style-plain">Valider</Nav.Link>
                      </Nav.Item>
                    </Nav>
                    <Tab.Content>
                      <Tab.Pane eventKey="info-plain">
                        <Col md="12">
                          <h4 className="title">Liste des demandes en cours</h4>
                          <Card className="card-header">
                            <Card.Body>
                              <ReactTable
                                data={entities}
                                columns={[
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
                                            confirmMessage(cell.row.values.id,e);
                                          }}
                                          variant="danger"
                                          size="sm"
                                          className="text-danger btn-link delete"
                                        >
                                          <i className="fa fa-trash" id={"idLigne_" + cell.row.values.id}/>
                                        </Button>
                                      </div>
                                    ),
                                  },
                                ]} 
                                className="-striped -highlight primary-pagination"
                              />
                              {entities.length === 0 ? (
                                <div className="text-center">Aucun donnée trouvé</div>
                              ) : ""}
                            </Card.Body>
                          </Card>
                        </Col>
                      </Tab.Pane>
                      <Tab.Pane eventKey="account-plain">
                        <Col md="12">
                          <h4 className="title">Liste des demandes annuler</h4>
                          <Card className="card-header">
                            <Card.Body>
                              <ReactTable
                                data={entitiesAnnuler}
                                columns={[
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
                                            confirmMessage(cell.row.values.id,e);
                                          }}
                                          variant="danger"
                                          size="sm"
                                          className="text-danger btn-link delete"
                                        >
                                          <i className="fa fa-trash" id={"idLigne_" + cell.row.values.id}/>
                                        </Button>
                                      </div>
                                    ),
                                  },
                                ]} 
                                className="-striped -highlight primary-pagination"
                              />
                              {entitiesAnnuler.length === 0 ? (
                                <div className="text-center">Aucun donnée trouvé</div>
                              ) : ""}
                            </Card.Body>
                          </Card>
                        </Col>
                      </Tab.Pane>
                      <Tab.Pane eventKey="style-plain">
                        <Col md="12">
                          <h4 className="title">Liste des demandes valider</h4>
                          <Card className="card-header">
                            <Card.Body>
                              <ReactTable
                                data={entitiesValider}
                                columns={[
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
                                            detailsDemande(cell.row.original.id);
                                          }}
                                          className="btn btn-info"
                                        >
                                          <i className="fa fa-eye mr-1" id={"idLigne_" + cell.row.values.id}/>Détails
                                        </Button>
                                      </div>
                                    ),
                                  },
                               
                                ]} 
                                className="-striped -highlight primary-pagination"
                              />
                              {entitiesValider.length === 0 ? (
                                <div className="text-center">Aucun donnée trouvé</div>
                              ) : ""}
                            </Card.Body>
                          </Card>
                        </Col>
                      </Tab.Pane>
                    </Tab.Content>
                  </Tab.Container>
                </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ListDemande;
