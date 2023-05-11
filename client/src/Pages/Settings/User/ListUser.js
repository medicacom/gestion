import ReactTable from "../../../components/ReactTable/ReactTable.js";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import React,{useEffect,useCallback} from "react";
import { fetchUsers,userChangeEtat } from "../../../Redux/usersReduce";
import { useDispatch } from "react-redux";
import { verification } from "../../../Redux/usersReduce";
//store.dispatch(fetchuser());

// core components
function ListUser() {
  const dispatch = useDispatch();
  const [entities, setEntities] = React.useState([]);
  function ajouter() {
    window.location.href = "/ajouterUtilisateur";
  }
  function changeEtat(id) {
    dispatch(userChangeEtat({ id }));
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
          var response = await dispatch(fetchUsers());
          resolve(response.payload);
      }, 0);
    });

    promise.then((value) => {
      setEntities(value);
    });
  }, [dispatch,verifToken])
  /* var { entities } = useSelector((state) => state.users); */
  return (
    <>
      <Container fluid>
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
              Ajouter un utilisateur
            </Button>
          </Col>
          <Col md="12">
            <h4 className="title">Liste des utilisateurs</h4>
            <Card className="card-header">
              <Card.Body>
                <ReactTable
                  data={entities}
                  columns={[
                    {
                      Header: "Nom et Prenom",
                      accessor: "nom_prenom",
                    },
                    {
                      Header: "Login",
                      accessor: "login",
                    },
                    {
                      Header: "e-mail",
                      accessor: "email",
                    },
                    {
                      Header: "téléphone",
                      accessor: "tel",
                    },
                    {
                      Header: "Etat",
                      accessor: "etat",
                      Cell: ({ cell }) => (cell.row.values.etat === 1?"Activé":"Désactivé"),
                    },
                    {
                      Header: "role",
                      accessor: "roles",
                      Cell: ({ cell }) => (cell.row.values.roles.nom),
                    },

                    {
                      Header: "actions",
                      accessor: "id",
                      Cell: ({ cell }) => (
                        <div className="actions-right block_action">
                          <Button
                            onClick={() => {
                              window.location.replace(
                                "/utilisateur/update/" + cell.row.values.id
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
                            onClick={(event) => {
                              changeEtat(cell.row.values.id);
                              window.location.replace("/utilisateurListe");
                            }}
                            variant="danger"
                            size="sm"
                            className={cell.row.values.etat === 1?"text-success btn-link delete":"text-danger btn-link delete"}
                          >
                            <i className={cell.row.values.etat === 1?"fa fa-check":"fa fa-times"} id={"idLigne_" + cell.row.values.id}/>
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

export default ListUser;
