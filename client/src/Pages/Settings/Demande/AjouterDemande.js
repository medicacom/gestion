import React,{useEffect,useCallback} from "react";
import NotificationAlert from "react-notification-alert";
import Select from "react-select";
import { fetchDocument } from "../../../Redux/documentReduce";

// react-bootstrap components
import { Button, Card, Form, Container, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import {
  demandeFile,
  demandeAdded
} from "../../../Redux/demandeReduce";

import { useDispatch } from "react-redux";
import { verification } from "../../../Redux/usersReduce";

function AjouterDemande({obj}) {
  var idPersonnel = obj.user.id;
  var idService = obj.user.id_service;
  const dispatch = useDispatch();
  const location = useParams();
  const [besoin, setBesoin] = React.useState(0);
  const [document, setDocument] = React.useState(null);
  const [sujet, setSujet] = React.useState("");
  const [besoinSelect, setBesoinSelect] = React.useState({
    value: 0,
    label: "Besoin",
  });
  const [option] = React.useState([
    {
      value: "",
      label: "Besoin",
      isDisabled: true,
    },
    { value: 1, label: "Création" },
    { value: 2, label: "Révision" },
  ]);
  const [optionsDoc, setOptionsDoc] = React.useState([
    {
      value: "",
      label: "Document",
      isDisabled: true,
    },
  ]);
  const [documentSelect, setDocumentSelect] = React.useState({
    value: null,
    label: "Document"}
  );
  const [file, setFile] = React.useState("");
  const [type, setType] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [id] = React.useState(0);

  const notificationAlertRef = React.useRef(null);

  const notify = (place, msg, type) => {
    var options = {};
    options = {
      place: place,
      message: (
        <div>
          <div>{msg}</div>
        </div>
      ),
      type: type,
      icon: "nc-icon nc-bell-55",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  };
  function submitForm(event) {
    var fileVal = "";
    if (file) {
      const fileArray = new FormData();
      fileArray.append("file", file);
      fileArray.append("name", file.name);
      fileVal = file.name;
      dispatch(demandeFile({ fileArray }));
    }
    var testBesoin = true;
    switch (besoin) {
      case 0: testBesoin = false;
        break;
      case 1: if(description ==="" || type ==="") testBesoin = false;
        break;
      case 2: if(document === null) testBesoin = false;
        break;   
      default:
        break;
    }
    if(testBesoin && sujet!==""){
      dispatch(demandeAdded({ besoin, idPersonnel, id, fileVal, description, type,document,sujet,idService }));
      notify("tr", "Insertion avec succes", "success");
      setTimeout(() => {
        listeDemande();
      }, 1500);
    }
    else {
      notify("tr", "Tous les champs sont obligatoires", "danger");
    }
  }
  function listeDemande() {
    window.location.replace("/demandeList");
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
    async function getDocument() {
      var document = await dispatch(fetchDocument(idService));
      var entities = document.payload;
      var arrayOption = [];
      arrayOption.push({ value:null, label: "Document" });
      if(entities.length>0)
        entities.forEach((e) => {
          arrayOption.push({ value: e.id, label: e.titre });
        });
      setOptionsDoc(arrayOption);
    }
    verifToken();
    getDocument()
  }, [location.id,dispatch,idPersonnel,idService,verifToken]);
  return (
    <>
      <Container fluid>
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <div className="section-image">
          <Container>
            <Row>
              <Col md="12">
                <Button
                  id="saveBL"
                  className="btn-wd btn-outline mr-1 float-left"
                  type="button"
                  variant="info"
                  onClick={listeDemande}
                >
                  <span className="btn-label">
                    <i className="fas fa-list"></i>
                  </span>
                  Retour à la liste
                </Button>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <Form action="" className="form" method="">
                  <Card>
                    <Card.Header>
                      <Card.Header>
                        <Card.Title as="h4">
                          {typeof location.id == "undefined"
                            ? "Ajouter demande"
                            : "Modifier demande"}
                        </Card.Title>
                      </Card.Header>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                          <Col className="pr-1" md="6">
                            <Form.Group>
                              <label>Titre* </label>
                              <Form.Control
                                defaultValue={sujet}
                                placeholder="Titre"
                                name="sujet"
                                type="text"
                                onChange={(value) => {
                                  setSujet(value.target.value);
                                }}
                              ></Form.Control>
                            </Form.Group>
                          </Col>
                      </Row>
                      <Row>
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>Fichier  </label>
                            <Form.Control
                              defaultValue={type}
                              placeholder="Fichier"
                              type="file"
                              onChange={(value) => {
                                setFile(value.target.files[0]);
                                /* setFile(value.target.value); */
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                        <Col className="pl-1" md="6">
                          <Form.Group>
                            <label>Besoin* </label>
                            <Select
                              className="react-select primary"
                              classNamePrefix="react-select"
                              value={besoinSelect}
                              onChange={(value) => {
                                setBesoinSelect(value);
                                setBesoin(value.value);
                              }}
                              placeholder="besoin"
                              options={option}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      {besoin === 1 ? (
                        <Row>
                          <Col className="pr-1" md="6">
                            <Form.Group>
                              <label>Déscription* </label>
                              <Form.Control
                                defaultValue={description}
                                placeholder="Déscription"
                                name="description"
                                as="textarea"
                                rows="3"
                                onChange={(value) => {
                                  setDescription(value.target.value);
                                }}
                              ></Form.Control>
                            </Form.Group>
                          </Col>
                          <Col className="pl-1" md="6">
                            <Form.Group>
                              <label>Type de document* </label>
                              <Form.Control
                                defaultValue={type}
                                placeholder="Type de document"
                                name="type"
                                type="text"
                                onChange={(value) => {
                                  setType(value.target.value);
                                }}
                              ></Form.Control>

                            </Form.Group>
                          </Col>
                        </Row>
                      ) :besoin === 2 ? (
                        <Row>
                          <Col className="pr-1" md="6">
                            <Form.Group>
                              <label>Liste des documents* </label>
                              <Select
                                className="react-select primary"
                                classNamePrefix="react-select"
                                value={documentSelect}
                                placeholder="Document"
                                onChange={(value) => {
                                  setDocumentSelect(value);
                                  setDocument(value.value);
                                }}
                                options={optionsDoc}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      ): ""}

                      <Button
                        className="btn-fill pull-right"
                        type="button"
                        variant="info"
                        onClick={submitForm}
                      >
                        Enregistrer
                      </Button>
                      <div className="clearfix"></div>
                    </Card.Body>
                  </Card>
                </Form>
              </Col>
            </Row>
          </Container>
        </div>
      </Container>
    </>
  );
}

export default AjouterDemande;
