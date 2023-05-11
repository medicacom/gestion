import ReactTable from "../../../components/ReactTable/ReactTable.js";
import { Card, Container, Row, Col,Form } from "react-bootstrap";
import React, { useEffect, useCallback } from "react";
import { dashbord } from "../../../Redux/documentReduce";
import { useDispatch } from "react-redux";
import { verification, getActiveUser } from "../../../Redux/usersReduce";
import { getAllDoc } from "../../../Redux/documentReduce";
import Select from "react-select";

// core components
function ListDemande({ obj }) {
  const dispatch = useDispatch();
  const [entities, setEntities] = React.useState([]);
  const [entitiesScore, setEntitiesScore] = React.useState([]);
  const [document, setDocument] = React.useState(null);
  const [idDocument, setIdDocument] = React.useState(0);
  const [idUser, setIdUser] = React.useState(0);
  const [user, setUser] = React.useState(null);

  const [optionDocument, setOptionDocument] = React.useState([
    {
      value: "",
      label: "Document",
      isDisabled: true,
    },
  ]);
  const [optionUser, setOptionUser] = React.useState([
    {
      value: "",
      label: "User",
      isDisabled: true,
    },
  ]);

  //verif token
  const verifToken = useCallback(async () => {
    var response = await dispatch(verification());
    if (response.payload === false) {
      localStorage.clear();
      window.location.replace("/login");
    }
  }, [dispatch]);

  //dashbord
  const getDash = useCallback(async (idDocument,idUser) => {
    var response = await dispatch(dashbord({idDocument,idUser}));
    var res = response.payload;
    setEntities(res.nbVu)
    setEntitiesScore(res.findReponse)
  }, [dispatch]);

  //getAllDoc
  const getDocument = useCallback(async () => {
    var response = await dispatch(getAllDoc());
    var res = response.payload;
    var arrayOption = [];
    arrayOption.push({ value: 0, label: "Tous" });
    res.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.titre });
    });
    setOptionDocument(arrayOption);
  }, [dispatch]);

  //getUsers
  const getUsers = useCallback(async () => {
    var response = await dispatch(getActiveUser());
    var res = response.payload;
    var arrayOption = [];
    arrayOption.push({ value: 0, label: "Tous" });
    res.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.nom_prenom });
    });
    setOptionUser(arrayOption);
  }, [dispatch]);

  useEffect(() => {
    verifToken();
    getDocument();
    getUsers();
    getDash(0,0);
  }, [verifToken,getDash,getUsers,getDocument]); //now shut up eslint

  return (
    <>
      <Container fluid>
        <h4 className="title">Tableau de bord</h4>
        <Row>
          <Col className="pr-1" md="6">
            <Form.Group id="redacteurClass">
              <label>Document* </label>
              <Select
                className="react-select primary"
                classNamePrefix="react-select"
                value={document}
                placeholder="Document"
                onChange={(value) => {
                  setDocument(value);
                  setIdDocument(value.value);
                  getDash(value.value,idUser);
                }}
                options={optionDocument}
              />
            </Form.Group>
          </Col>
          <Col className="pl-1" md="6">
            <Form.Group id="verificateurClass">
              <label>Utilisateur* </label>
              <Select
                className="react-select primary"
                classNamePrefix="react-select"
                placeholder="Utilisateur"
                value={user}
                onChange={(value) => {
                  setUser(value);
                  setIdUser(value.value);
                  getDash(idDocument,value.value);
                }}
                options={optionUser}
              />
            </Form.Group>
          </Col>

        </Row>
        <Row>
          <Col md="12">
            <Card>
              <Card.Body>
                <ReactTable
                  data={entities}
                  columns={[
                    {
                      Header: "Titre",
                      accessor: "documentss.titre",
                    },
                    {
                      Header: "Nb. de vu",
                      accessor: "nb",
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
        <Row>
          <Col md="12">
            <Card>
              <Card.Body>
                <ReactTable
                  data={entitiesScore}
                  columns={[
                    {
                      Header: "Document",
                      accessor: "documentss.titre",
                    },
                    {
                      Header: "Utilisateur",
                      accessor: "users.nom_prenom",
                    },
                    {
                      Header: "Score avant video",
                      accessor: "score",
                      Cell: ({ cell }) => (cell.row.values.score !==null ?cell.row.values.score+"%":"")
                    },
                    {
                      Header: "Score apres video",
                      accessor: "scoreExamen",
                      Cell: ({ cell }) => (cell.row.values.scoreExamen !==null ?cell.row.values.scoreExamen+"%":"")
                    },
                  ]}
                  className="-striped -highlight primary-pagination"
                />
                {entitiesScore.length === 0 ? (
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

export default ListDemande;
