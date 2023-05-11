import React, { useEffect } from "react";
import NotificationAlert from "react-notification-alert";

// react-bootstrap components
import { Button, Card, Form, Container, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { vigueurAdded, vigueurUpdated, vigueurGetById,vigueurFile,getFileText } from "../../../Redux/vigueurReduce";

import { useDispatch } from "react-redux";
import Select from "react-select";

function AjouterDocReference({obj}) {
  var role = obj.user.id_role;
  const dispatch = useDispatch();
  const location = useParams();
  const [titre, setTitre] = React.useState("");
  const [file, setFile] = React.useState(""); 
  const [arborescence, setArborescence] = React.useState(null); 
  const [reference, setReference] = React.useState(null);
  const [id, setId] = React.useState(0);
  const notificationAlertRef = React.useRef(null);
  const [option] = React.useState([
    {
      value: "",
      label: "Service Responsable",
      isDisabled: true,
    },
    { value: 9, label: "Médical" },
    { value: 10, label: "Technique" },
    { value: 11, label: "Juridique" },
  ]);
  const [responsable, setResponsable] = React.useState(null);

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
      dispatch(vigueurFile({fileArray}))
    }
    if(file && titre !==""){
      if (isNaN(location.id) === true) {
        dispatch(vigueurAdded({ titre, id,fileVal,reference,arborescence,responsable }));
        notify("tr", "Insertion avec succes", "success");
      } else {
        dispatch(vigueurUpdated({ titre, id,fileVal,reference,arborescence,responsable  }));
        notify("tr", "Modifier avec succes", "success");
      }
      setTimeout(() => {
        listeVigueur();
      }, 1500);
    }
    else {
      notify("tr", "Tous les champs sont obligatoires", "danger");
    }  
  }

  useEffect(() => {
    async function getVigueur() {
      if (isNaN(location.id) === false) {
        var service = await dispatch(vigueurGetById(location.id));
        var entities = service.payload;
        setTitre(entities.titre);
        setReference(entities.reference);
        setArborescence(entities.arborescence);
        setResponsable({value:entities.id_role,label:entities.roles.nom})
        if(entities.file !== null){
          var files = await dispatch(getFileText(entities.file));
          var entities1 = files.payload;
          setFile(entities1);
        }
     
        setId(location.id);
      }
    }
    getVigueur();
  }, [location.id,dispatch]);

  function listeVigueur() {
    window.location.replace("/listDocReference");
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
                  onClick={listeVigueur}
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
                            ? "Ajouter un référence en document"
                            : "Modifier un référence en document"}
                        </Card.Title>
                      </Card.Header>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>Titre document* </label>
                            <Form.Control
                              defaultValue={titre}
                              placeholder="Titre document"
                              type="text"
                              onChange={(value) => {
                                setTitre(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
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
                      {(role === 9 || role === 10 || role === 11)?<Row>
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>Arborescence </label>
                            <Form.Control
                              defaultValue={arborescence}
                              placeholder="Arborescence"
                              type="text"
                              onChange={(value) => {
                                setArborescence(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                        <Col className="pl-1" md="6">
                          <Form.Group>
                            <label>Référence </label>
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

                      </Row>:
                        <Col className="pl-1" md="6">
                          <Form.Group>
                            <label>Service responsable* </label>
                            <Select
                              placeholder="responsable"
                              className="react-select primary"
                              classNamePrefix="react-select"
                              value={responsable}
                              onChange={(value) => {
                                setResponsable(value);
                              }}
                              options={option}
                            />
                          </Form.Group>
                        </Col>}
                      

                      <Button
                        className="btn-fill pull-right"
                        type="button"
                        variant="info"
                        onClick={submitForm}
                      >
                        {(role === 9 || role === 10 || role === 11)? "Enregistrer":"Envoyer responsable"}
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

export default AjouterDocReference;
