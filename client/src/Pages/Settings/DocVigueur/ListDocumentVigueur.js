import ReactTable from "../../../components/ReactTable/ReactTable.js";
import {Card, Container, Row, Col, Nav, Tab,Button } from "react-bootstrap";
import React,{useEffect,useCallback} from "react";
import { allDocumentVigueur } from "../../../Redux/documentReduce";
import { demandeAdded } from "../../../Redux/demandeReduce";
import { useDispatch } from "react-redux";
import { verification } from "../../../Redux/usersReduce";

import SweetAlert from "react-bootstrap-sweetalert";
import NotificationAlert from "react-notification-alert";

// core components
function ListDemande({obj}) {
  const dispatch = useDispatch();  
  var idPersonnel = obj.user.id;
  var idService = obj.user.id_service;
  var idRole = obj.user.id_role;
  const notificationAlertRef = React.useRef(null);
  const [entities, setEntities] = React.useState([]);
  const [entitiesPublier, setEntitiesPublier] = React.useState([]);
  const [entitiesDepasser, setEntitiesDepasser] = React.useState([]);
  const [alert, setAlert]  = React.useState(null);
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
  const confirmRevision = (id,type,fileVal) => {
    setAlert(
      <SweetAlert
        style={{ display: "block", marginTop: "-100px" }}
        title="Vous éte sure?"
        onConfirm={() => revision(id,type,fileVal)}
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
  const hideAlert = () => {
    setAlert(null);
  };
  function revision(id,type,fileVal){
    notify("tr", "Révision avec succes", "success");
    dispatch(demandeAdded({ besoin:2, idPersonnel:idPersonnel, id:0, fileVal:fileVal, description:null, type:type,document:id,sujet:"Révision",idService:idService,test:1 }));
    hideAlert();
    setTimeout(() => {
      window.location.reload();
    }, 1000);

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
          var response = await dispatch(allDocumentVigueur({idService,idRole}));
          resolve(response.payload);
      }, 0);
    });

    promise.then((value) => {
      var arrayEnCours = [];
      var arrayDepasser = [];
      var arrayPublier = [];
      value.forEach(val=>{
        var lastYear = new Date(val.updatedAt).getFullYear();
        var year = new Date().getFullYear();
        if(parseInt(val.etat) <10 && (year-lastYear)<2){
          arrayEnCours.push(val)
        } else if(parseInt(val.etat) === 10 && (year-lastYear)<2 ){
          arrayPublier.push(val)
        } else {
          arrayDepasser.push(val)
        } 
        //return val;
      })
      setEntities(arrayEnCours);
      setEntitiesPublier(arrayPublier);
      setEntitiesDepasser(arrayDepasser)
    });
  }, [dispatch,idPersonnel,idRole,idService,verifToken]) //now shut up eslint
  return (
    <>
      {alert}
      <Container fluid>
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        {idRole === 1?
          <Row>
            <Col md="12">
            <Button
              className="btn-fill pull-left"
              type="button"
              variant="info"
              onClick={() => window.location.replace("/oldProcedure")}
            >
              Ajouter old procedure
            </Button>   
            </Col>

          </Row>
        :""}
        <Row>
          <Col md="12">
            <Card> 
                <Card.Body>
                  <Tab.Container id="plain-tabs-example" defaultActiveKey="info-plain">
                    <Nav role="tablist" variant="tabs">
                      <Nav.Item>
                        <Nav.Link eventKey="info-plain">En cours</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="account-plain">Publier</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="style-plain">Dépasser</Nav.Link>
                      </Nav.Item>
                    </Nav>
                    <Tab.Content>
                      <Tab.Pane eventKey="info-plain">
                        <Col md="12">
                          <h4 className="title">Liste des documents vigueurs en cours</h4>
                          <Card className="card-header">
                            <Card.Body>
                              <ReactTable
                                data={entities}
                                columns={[
                                  {
                                    Header: "Titre",
                                    accessor: "titre",
                                  },
                                  {
                                    Header: "Type document",
                                    accessor: "type",
                                  },
                                  {
                                    Header: "Service",
                                    accessor: "service",
                                  },
                                  
                                  {
                                    Header: "Date",
                                    accessor: "date",
                                    Cell: ({ cell }) => (
                                     new Date(cell.row.values.date).getDate()+'-'+(new Date(cell.row.values.date).getMonth()+1)+'-'+new Date(cell.row.values.date).getFullYear()
                                    )
                                  },
                                    {
                                    Header: "Action",
                                    accessor: "",
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
                          <h4 className="title">Liste des documents vigueurs publier</h4>
                          <Card className="card-header">
                            <Card.Body>
                              <ReactTable
                                data={entitiesPublier}
                                columns={[
                                  {
                                    Header: "Titre",
                                    accessor: "titre",
                                  },
                                  {
                                    Header: "Type document",
                                    accessor: "type",
                                  },
                                  {
                                    Header: "Service",
                                    accessor: "service",
                                  },
                                  {
                                    Header: "Référence",
                                    accessor: "reference",
                                  },
                                  
                                  {
                                    Header: "Date",
                                    accessor: "date",
                                    Cell: ({ cell }) => (
                                      new Date(cell.row.values.date).getDate()+'-'+(new Date(cell.row.values.date).getMonth()+1)+'-'+new Date(cell.row.values.date).getFullYear()
                                   )
                                  },
                                  {
                                    Header: "Visualiser",
                                    accessor: "id",
                                    Cell: ({ cell }) => (
                                      <div className="actions-right block_action">
                                        <Button
                                          onClick={() => {
                                            window.location.replace("/visualisation/"+cell.row.values.id)
                                          }}
                                          className="btn-info btn"
                                        >
                                          <i className="fa fa-eye" /> Visualiser
                                        </Button>
                                      </div>
                                    ),
                                  },
                                  {
                                    Header: "Nb. consultation",
                                    accessor: "count",
                                    Cell: ({ cell }) => (
                                      (idRole<=3)?<p>{cell.row.values.count}</p>:<p></p>
                                    )
                                  },
                                  
                                ]} 
                                className="-striped -highlight primary-pagination"
                              />
                              {entitiesPublier.length === 0 ? (
                                <div className="text-center">Aucun donnée trouvé</div>
                              ) : ""}
                            </Card.Body>
                          </Card>
                        </Col>
                      </Tab.Pane>
                      <Tab.Pane eventKey="style-plain">
                        <Col md="12">
                          <h4 className="title">Liste des documents vigueurs dépasser</h4>
                          <Card className="card-header">
                            <Card.Body>
                              <ReactTable
                                data={entitiesDepasser}
                                columns={[
                                  {
                                    Header: "Titre",
                                    accessor: "titre",
                                  },
                                  {
                                    Header: "Type document",
                                    accessor: "type",
                                  },
                                  {
                                    Header: "Service",
                                    accessor: "service",
                                  },                                  
                                  {
                                    Header: "Date",
                                    accessor: "date",
                                    Cell: ({ cell }) => (
                                      new Date(cell.row.values.date).getDate()+'-'+(new Date(cell.row.values.date).getMonth()+1)+'-'+new Date(cell.row.values.date).getFullYear()
                                   )
                                  },
                                  {
                                    Header: "Nb. consultation",
                                    accessor: "count",
                                    Cell: ({ cell }) => (
                                      (parseInt(idRole)<=3)?<p>{cell.row.values.count}</p>:<p></p>
                                    )
                                  },
                                  {
                                    Header: "Action",
                                    accessor: "id",
                                    Cell: ({ cell }) => (
                                      <div className="actions-right block_action">
                                        <Button
                                          onClick={() => {
                                            window.location.replace("/visualisation/"+cell.row.values.id)
                                          }}
                                          className="btn-info btn"
                                        >
                                          <i className="fa fa-eye" /> Visualiser
                                        </Button>
                                        <br></br>
                                        <Button
                                          onClick={() => {
                                            confirmRevision(cell.row.values.id,cell.row.values.type,cell.row.original.file);
                                            //window.location.replace("/rev/"+cell.row.values.id)
                                          }}
                                          className="btn-danger btn"
                                        >
                                          Révision
                                        </Button>
                                      </div>
                                    ),
                                  },   
                                  
                                ]} 
                                className="-striped -highlight primary-pagination"
                              />
                              {entitiesDepasser.length === 0 ? (
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
