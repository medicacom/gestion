import NotificationAlert from "react-notification-alert";
import SweetAlert from "react-bootstrap-sweetalert";
import ReactTable from "../../../components/ReactTable/ReactTable.js";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import React,{useEffect,useCallback} from "react";
import { getDemandeValider,demandeGetById,getFile } from "../../../Redux/demandeReduce";
import { useDispatch } from "react-redux";

import { verification } from "../../../Redux/usersReduce";

// core components
function ListCreationDocument({obj}) {
  const dispatch = useDispatch();
  const [entities, setEntities] = React.useState([]);
  const notificationAlertRef = React.useRef(null);
  const [alert, setAlert] = React.useState(null);
  
  var idService = obj.user.id_service;
  const hideAlert = () => {
    setAlert(null);
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
          var response = await dispatch(getDemandeValider(idService));
          resolve(response.payload);
      }, 0);
    });

    promise.then((value) => {
      setEntities(value);
    });
  }, [dispatch,idService,verifToken]) 

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
  return (
    <>
      {alert}
      <Container fluid>
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <Row>
          <Col md="12">
            <h4 className="title">Créer un document</h4>
            <Card className="card-header">
              <Card.Body>
                <ReactTable
                  data={entities}
                  columns={[
                    {
                      Header: "besoin",
                      accessor: "demandes",
                      Cell: ({ cell }) => (
                        (cell.row.values.demandes.besoin === 1? "creation":"Révision")
                      ),
                    },
                    {
                      Header: "sujet",
                      accessor: "demandes.sujet",
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
                            onClick={() => {
                              window.location.replace(
                                "/ajouterDocument/" + cell.row.values.demandes.id+"/"+cell.row.original.demandes.id_service+"/"+cell.row.original.demandes.id_document
                              );
                            }}
                            className="btn-info btn"
                          >
                            <i className="fa fa-plus" /> Créer
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
        </Row>
      </Container>
    </>
  );
}

export default ListCreationDocument;
