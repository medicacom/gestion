import NotificationAlert from "react-notification-alert";
import SweetAlert from "react-bootstrap-sweetalert";
import ReactTable from "../../../components/ReactTable/ReactTable.js";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import React,{useEffect,useCallback} from "react";
import { fetchService,serviceDeleted } from "../../../Redux/serviceReduce";
import { useDispatch } from "react-redux";
import { verification } from "../../../Redux/usersReduce";


// core components
function ListService() {
  const dispatch = useDispatch();
  const [entities, setEntities] = React.useState([]);
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
        title="Vous éte sure de supprime ce service?"
        onConfirm={() => deleteService(id,e)}
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
  function ajouter() {
    window.location.href = "/ajouterService";
  }
  function deleteService(id,e) {
    dispatch(serviceDeleted({ id }));
    document
      .getElementById(e.target.id)
      .parentElement.parentElement.parentElement.remove();
      hideAlert()
    notify("tr", "Service supprimer avec succes", "success");
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
          var response = await dispatch(fetchService());
          resolve(response.payload);
      }, 0);
    });

    promise.then((value) => {
      setEntities(value);
    });
  }, [dispatch,verifToken]) //now shut up eslint
  /* var { entities } = []; */
  /* var{ entities }  = useSelector((state) => state.service); */
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
              Ajouter un service
            </Button>
          </Col>
          <Col md="12">
            <h4 className="title">Liste des services</h4>
            <Card className="card-header">
              <Card.Body>
                <ReactTable
                  data={entities}
                  columns={[
                    {
                      Header: "Nom",
                      accessor: "nom",
                    },
                    {
                      Header: "actions",
                      accessor: "id",
                      Cell: ({ cell }) => (
                        <div className="actions-right block_action">
                          <Button
                            onClick={() => {
                              window.location.replace(
                                "/service/update/" + cell.row.values.id
                              );
                            }}
                            variant="warning"
                            size="sm"
                            className="text-warning btn-link edit"
                          >
                            <i className="fa fa-edit" />
                          </Button>
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
                ) : (
                  ""
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ListService;
