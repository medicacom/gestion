import ReactTable from "../../../components/ReactTable/ReactTable.js";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import React,{useEffect,useCallback} from "react";
import { getDocVerification } from "../../../Redux/userDocumentReduce";
import { useDispatch } from "react-redux";
import { verification } from "../../../Redux/usersReduce";
import { useLocation } from "react-router-dom";

// core components
function ValidationDocument() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [entities, setEntities] = React.useState([]);
  const [type, setType] = React.useState(0);
  /* var id = obj.user.id; */

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
    if(location.pathname === "/validationRedaction")
      setType(1)
    else 
      setType(2)
    const promise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        var etat = 0;
        if(type===1)
          etat = 2;
        else 
          etat = 5;
        var response = await dispatch(getDocVerification({etat,type}));
        resolve(response.payload);
      }, 0);
    });

    promise.then((value) => {
      setEntities(value);
    });
  }, [dispatch,type,verifToken,location.pathname])
  return (
    <>
      <Container fluid>
        <Row>
          <Col md="12">
            <h4 className="title">{type===1 ?"Validation de la rédaction de document":"Validation de la vérification de document"}</h4>
            <Card className="card-header">
              <Card.Body>
                <ReactTable
                  data={entities}
                  columns={[
                    {
                      Header: "Nom rédacteur",
                      accessor: "users.nom_prenom",
                    },
                    {
                      Header: "Titre",
                      accessor: "documents.titre",
                    },
                    {
                      Header: "détails",
                      accessor: "id_document",
                      Cell: ({ cell }) => (
                        <div className="block_action">
                          
                          <Button
                            id={"idLigne_" + cell.row.values.id_document}
                            onClick={(e) => {
                              window.location.replace("/detailValidation/"+cell.row.values.id_document+"/"+entities[cell.row.id].id_user+"/"+entities[cell.row.id].type);
                            }}
                            className="btn btn-info"
                          >
                            <i className="fa fa-eye mr-1" id={"idLigne_" + cell.row.values.id_document}/>Validation
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

export default ValidationDocument;
