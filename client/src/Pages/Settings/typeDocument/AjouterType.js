import React, { useEffect,useCallback } from "react";
import NotificationAlert from "react-notification-alert";

// react-bootstrap components
import { Button, Card, Form, Container, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { typeDocumentAdded, typeDocumentUpdated, typeDocumentGetById,typeDocFile,getFile } from "../../../Redux/typeReduce";
import { verification } from "../../../Redux/usersReduce";
import { useDispatch } from "react-redux";

function AjouterType() {
  const dispatch = useDispatch();
  const location = useParams();
  const [type, setType] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [file, setFile] = React.useState("");
  const [id, setId] = React.useState(0);
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
    var fileVal='';
    if(file){
      const fileArray = new FormData();
      fileArray.append("file", file);
      fileArray.append("name", file.name);
      fileVal=file.name;
      dispatch(typeDocFile({fileArray}))
    }
    if(file!=="" && type !=="" && reference !==""){
      if (isNaN(location.id) === true) {
        dispatch(typeDocumentAdded({ type, id,fileVal,reference }));
        notify("tr", "Insertion avec succes", "success");
      } else {
        dispatch(typeDocumentUpdated({ type, id,fileVal,reference }));
        notify("tr", "Modifier avec succes", "success");
      }
    }
    else {
      notify("tr", "Tous les champs sont obligatoires", "danger");
    }  
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
    async function getType() {
      if (isNaN(location.id) === false) {
        var service = await dispatch(typeDocumentGetById(location.id));
        var entities = service.payload;
        setType(entities.type);
        setReference(entities.reference);
        if(entities.file !== null){
          var files = await dispatch(getFile(entities.file));
          var entities1 = files.payload;
          setFile(entities1);
        }
     
        setId(location.id);
      }
    }
    getType();
  }, [location.id,dispatch,verifToken]);

  function listeType() {
    window.location.replace("/ListType");
  }
  

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
                  onClick={listeType}
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
                            ? "Ajouter un type de document"
                            : "Modifier un type de document"}
                        </Card.Title>
                      </Card.Header>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>Type * </label>
                            <Form.Control
                              defaultValue={type}
                              placeholder="Type document"
                              type="text"
                              onChange={(value) => {
                                setType(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                        <Col className="pl-1" md="6">
                          <Form.Group>
                            <label>Référence * </label>
                            <Form.Control
                              defaultValue={reference}
                              placeholder="Référence"
                              type="text"
                              onChange={(value) => {
                                setReference(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>Fichier * </label>
                            <Form.Control
                              placeholder="Fichier"
                              type="file"
                              onChange={(value) => {
                                setFile(value.target.files[0])
                              }}
                            ></Form.Control>
                            {(file !== '' && isNaN(location.id) === false) ? <a rel="noreferrer" href={file} target='_blank'><i className="fas fa-file"></i>Télécharger</a>:""}
                          </Form.Group>
                        </Col>
                      </Row>

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

export default AjouterType;
