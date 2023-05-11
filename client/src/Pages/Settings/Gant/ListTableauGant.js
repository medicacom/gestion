import ReactTable from "../../../components/ReactTable/ReactTable.js";
import { Card, Container, Row, Col, Form,Tab,Nav} from "react-bootstrap";
import React, { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";

import { getGant } from "../../../Redux/documentReduce";
import { fetchService } from "../../../Redux/serviceReduce";
import Select from "react-select";
import { verification } from "../../../Redux/usersReduce";

// core components
function ListTableauGant({obj}) {
  const dispatch = useDispatch();

  var idRole = obj.user.id_role;
  var idService = obj.user.id_service;
  if (idRole === 3 || idRole === 4) idService = null;
  const [entities, setEntities] = React.useState([]);
  const [historique, setHistorique] = React.useState([]);

  const [optionService, setOptionService] = React.useState([
    {
      value: "",
      label: "Service",
      isDisabled: true,
    },
  ]);
  const [serviceSelect, setServiceSelect] = React.useState({
    value: null,
    label: "Service",
  });

  const getEntities = useCallback(
    async (ser) => {
      var user = await dispatch(getGant({ idService: ser, idRole: idRole }));
      var value = user.payload;
      var list = [];
      var list1 = [];
      value.forEach(e=>{
        if(e.documents.etat <= 9 && e.etat === 0) list.push(e)
        else list1.push(e)
      })
      setEntities(list);
      setHistorique(list1)
    },
    [dispatch, idRole]
  );
  /* const formatDate = useCallback(
    async (d) => {    
    var date1 = new Date(d); // Or the date you'd like converted.
    var date = new Date(date1.getTime() - (date1.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
    return date;
    },
    []
  ); */

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
    async function getService() {
      var service = await dispatch(fetchService());
      var entities = service.payload;
      var arrayOption = [];
      arrayOption.push({ value: null, label: "Service" });
      entities.forEach((e) => {
        arrayOption.push({ value: e.id, label: e.nom });
      });
      setOptionService(arrayOption);
    }
    getEntities(idService);
    getService();
  }, [dispatch, idRole, idService, getEntities,verifToken]); //now shut up eslint

  return (
    <>
      <Container fluid>
        <Row>
          {idRole === 3 || idRole === 4 ? (
            <Col className="pl-1" md="6">
              <Form.Group id="serviceClass">
                <label>Service </label>
                <Select
                  placeholder="Service"
                  className="react-select primary"
                  classNamePrefix="react-select"
                  value={serviceSelect}
                  onChange={(value) => {
                    setServiceSelect(value);
                    getEntities(value.value);
                  }}
                  options={optionService}
                />
              </Form.Group>
            </Col>
          ) : (
            ""
          )}
        </Row>
        <Row>
          <Col md="12">
            <Card className="card-header">
              <Card.Body>
                <Tab.Container
                  id="plain-tabs-example"
                  defaultActiveKey="encours"
                >
                  <Nav role="tablist" variant="tabs">
                    <Nav.Item>
                      <Nav.Link eventKey="encours">En cours</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="historique">Historique</Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <Tab.Content>
                    <Tab.Pane eventKey="encours">
                      {/* <ReactTable
                        data={entities}
                        columns={[
                          {
                            Header: "Document",
                            accessor: "documents.titre",
                          },
                          {
                            Header: "Date",
                            accessor: "date",
                            Cell: ({ cell }) => (
                              <div className="block_action">
                                {cell.row.values.date !== null?formatDate(cell.row.values.date):""}
                              </div>
                            ),
                          },
                          {
                            Header: "Type document",
                            accessor: "documents.types.type",
                          },
                          {
                            Header: "Personnel",
                            accessor: "users.nom_prenom",
                          },
                          {
                            Header: "Type document",
                            accessor: "documents.services.nom",
                          },
                          {
                            Header: "Role",
                            accessor: "type",
                            Cell: ({ cell }) => (
                              <div className="block_action">
                                {cell.row.values.type === 1
                                  ? "Rédacteur"
                                  : "Vérificateur"}
                              </div>
                            ),
                          },
                          {
                            Header: "Action",
                            accessor: "",
                          },
                        ]}
                        className="-striped -highlight primary-pagination"
                      /> */}
                      {entities.length === 0 ? (
                        <div className="text-center">Aucun donnée trouvé</div>
                      ) : 
                      <ReactTable
                        data={entities}
                        columns={[
                          {
                            Header: "Document",
                            accessor: "documents.titre",
                          },
                          {
                            Header: "Date",
                            accessor: "date",
                            Cell: ({ cell }) => (
                              <div className="block_action">
                                {cell.row.values.date !== null?new Date(new Date(cell.row.values.date).getTime() - (new Date(cell.row.values.date).getTimezoneOffset() * 60000)).toISOString().slice(0, 10):""}
                              </div>
                            ),
                          },
                          {
                            Header: "Type document",
                            accessor: "documents.types.type",
                          },
                          {
                            Header: "Personnel",
                            accessor: "users.nom_prenom",
                          },
                          {
                            Header: "Type document",
                            accessor: "documents.services.nom",
                          },
                          {
                            Header: "Role",
                            accessor: "type",
                            Cell: ({ cell }) => (
                              <div className="block_action">
                                {cell.row.values.type === 1
                                  ? "Rédacteur"
                                  : "Vérificateur"}
                              </div>
                            ),
                          },
                          {
                            Header: "Action",
                            accessor: "",
                          },
                        ]}
                        className="-striped -highlight primary-pagination"
                      /> }
                    </Tab.Pane>
                    <Tab.Pane eventKey="historique">
                      <ReactTable
                        data={historique}
                        columns={[
                          {
                            Header: "Document",
                            accessor: "documents.titre",
                          },
                          {
                            Header: "Date",
                            accessor: "date",
                            Cell: ({ cell }) => (
                              <div className="block_action">
                                {cell.row.values.date !== null?new Date(cell.row.values.date)
                                  .toISOString()
                                  .slice(0, 10):""}
                              </div>
                            ),
                          },
                          {
                            Header: "Type document",
                            accessor: "documents.types.type",
                          },
                          {
                            Header: "Personnel",
                            accessor: "users.nom_prenom",
                          },
                          {
                            Header: "Type document",
                            accessor: "documents.services.nom",
                          },
                          {
                            Header: "Role",
                            accessor: "type",
                            Cell: ({ cell }) => (
                              <div className="block_action">
                                {cell.row.values.type === 1
                                  ? "Rédacteur"
                                  : "Vérificateur"}
                              </div>
                            ),
                          },
                          {
                            Header: "Action",
                            accessor: "",
                          },
                        ]}
                        className="-striped -highlight primary-pagination"
                      />
                      {historique.length === 0 ? (
                        <div className="text-center">Aucun donnée trouvé</div>
                      ) : (
                        ""
                      )}
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

export default ListTableauGant;
