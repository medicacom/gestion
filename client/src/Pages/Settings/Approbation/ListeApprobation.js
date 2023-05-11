import NotificationAlert from "react-notification-alert";
import ReactTable from "../../../components/ReactTable/ReactTable.js";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import React,{useEffect,useCallback} from "react";
import { getDocApprobateur } from "../../../Redux/documentReduce";
import { useDispatch } from "react-redux";

import { getTypeUser,verification } from "../../../Redux/usersReduce";

// core components
function ListeApprobation({obj}) {
  const dispatch = useDispatch();
  var idType = obj.user.id_type;
  var idUser = obj.user.id;
  const [entities, setEntities] = React.useState([]);
  const notificationAlertRef = React.useRef(null); 

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
        var typeUser = await dispatch(getTypeUser(idUser));
        var entities = typeUser.payload;
        var tab = [];
        entities.forEach(element => {
          tab.push(element.id_type)
          
        });
        var response = await dispatch(getDocApprobateur({tab}));
        resolve(response.payload);
      }, 0);
    });

    promise.then((value) => {
      setEntities(value);
    });
  }, [dispatch,idType,idUser,verifToken])
  return (
    <>
      <Container fluid>
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <Row>
          <Col md="12">
            <h4 className="title">Approbation</h4>
            <Card className="card-header">
              <Card.Body>
                <ReactTable
                  data={entities}
                  columns={[
                    {
                      Header: "Document",
                      accessor: "titre",
                    },
                    {
                      Header: "actions",
                      accessor: "id",
                      Cell: ({ cell }) => (
                        <div className="actions-right block_action">
                          <Button
                            onClick={() => {
                              window.location.replace("/detailApprobation/" + cell.row.values.id);
                            }}
                            className="btn-info btn"
                          >
                            <i className="fa fa-eye" /> Visualiser
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

export default ListeApprobation;
