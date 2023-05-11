import React, { useEffect, useCallback } from "react";
import NotificationAlert from "react-notification-alert";
import { useParams } from "react-router-dom";
// react-bootstrap components
import { Button, Card, Form, Container, Row, Col } from "react-bootstrap";
import { getFileEtapeDoc,referenceAdded,referenceFile } from "../../../Redux/referenceReduce";
import { getVersionReference,fetchFile } from "../../../Redux/documentReduce";
import { useDispatch } from "react-redux";

import { CardBody } from "reactstrap";
import { verification } from "../../../Redux/usersReduce";

function AjouterReference({obj}) {
  const dispatch = useDispatch();
  const location = useParams();
  const idDocument = location.idDoc;
  const idUser = obj.user.id;
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
  const [reference, setReference] = React.useState("");  
  const [details, setDetails] = React.useState(null);
  const [fileFinale, setFileFinale] = React.useState("");
  const [fileUrl, setFileUrl] = React.useState(null);

  const notificationAlertRef = React.useRef(null);

  function submitForm(event) {
    var test =true;
    if(reference ===""){
      notify("tr", "Référence obligatoire", "danger");
      test = false;
    } 
    if (!fileFinale){
      notify("tr", "Document obligatoire", "danger");
      test = false;
    }
    if(test){
      notify("tr", "Insertion avec suceés", "success");
      var type=details[0].id_type;
      var fileVal = "";
      const fileArray = new FormData();
      fileArray.append("file", fileFinale);
      fileArray.append("name", fileFinale.name);
      fileVal = fileFinale.name;
      dispatch(referenceFile({ fileArray }));
      dispatch(referenceAdded({reference,fileVal,idDocument,idUser,type}));
      setTimeout(() => {
        window.location.replace("/listReference");
      }, 1000);
    }
  }

  function listReference() {
    window.location.replace("/listReference");
  }

  // get version et reference du document
  const getVersion = useCallback(async () => {
    var version = await dispatch(getVersionReference(location.idDoc));
    var entities = version.payload;
    setReference(entities);
  }, [dispatch,location.idDoc]);

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
    async function getFile() {
      const promise1 = new Promise((resolve, reject) => {
        setTimeout(async () => {
          var userDoc = await dispatch(getFileEtapeDoc(location.idDoc));
          var entities = userDoc.payload;
          var file = await dispatch(fetchFile(entities[0].file));
          setFileUrl(file.payload)
          resolve( entities );
        }, 0);
      });

      promise1.then((value) => {
        setDetails(value)
      });
    }
    getFile();
    getVersion();
  }, [dispatch,location.idDoc,getVersion,verifToken]);

  return (
    <>
    <Container>
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
                  onClick={listReference}
                >
                  <span className="btn-label">
                    <i className="fas fa-list"></i>
                  </span>
                  Retour à la liste
                </Button>
              </Col>
            </Row>
            </Container>
            </div>
            <Card className="demande">
              
              <CardBody>
                {details !== null ? (<h3> Titre document : {details[0].titre}</h3>):""}
                <hr />
                <Row>
                     <br></br>
                  {details !== null ?
                  <Col md="12">
                    <a download
                      rel="noreferrer"
                      href={fileUrl}
                      target="_blank"
                    >
                      <i className="fas fa-file"></i>
                      <div>Téléchargez</div>
                    </a>
                  </Col>:""}
                </Row>
                  <br></br>
                <Row>
                  <Col className="pr-1" md="12">
                    <Form.Group>
                      <label>Référence* </label>
                      <Form.Control
                        placeholder="Référence"
                        name="Référence"
                        defaultValue={reference}
                        onChange={(value) => {
                          setReference(value.target.value);
                        }}
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                  <Col className="pr-1" md="12">
                    <Form.Group>
                      <label>Importer dernier version de document en pdf  </label>
                      <Form.Control
                        defaultValue={fileFinale}
                        placeholder="Fichier"
                        type="file"
                        accept="application/pdf"
                        onChange={(value) => {
                          setFileFinale(value.target.files[0]);
                        }}
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                  
                </Row>
                <br></br>
                <Button
                  className="btn-fill pull-right"
                  type="button"
                  variant="info"
                  onClick={submitForm}
                >
                  Valider référence
                </Button>  
              </CardBody>
            </Card>
          </Container>   
    </>
  );
}

export default AjouterReference;
