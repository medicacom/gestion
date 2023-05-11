import React, { useEffect, useState,useCallback } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import NotificationAlert from "react-notification-alert";
// react-bootstrap components
import { useDispatch } from "react-redux";
import { getReferenceByDoc } from "../../../Redux/referenceReduce";
import { docChangeEtat } from "../../../Redux/userDocumentReduce";
import { generatePdfSign,fetchFile } from "../../../Redux/documentReduce";
import { verification } from "../../../Redux/usersReduce";

function DetailApprobation({obj}) {
  const dispatch = useDispatch();
  const location = useParams();
  var idApp = obj.user.id;
  var idDoc = location.id;
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
  const [details, setDetails] = useState(false);
  const [file, setFile] = useState(false);
  const [userDocument, setUserDocument] = useState([]);

  function listeDocument() {
    window.location.replace("/listApprobation");
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
        var detailBD = await dispatch(getReferenceByDoc(location.id));
        var entities = detailBD.payload;
        var file = await dispatch(fetchFile(entities.ref.file));
        setFile(file.payload)
        resolve(entities);
      }, 0);
    });

    promise.then((value) => {
      setDetails(value.ref);
      setUserDocument(value.userDoc);
    });
  }, [dispatch,location.id,verifToken]);
  function submitForm() {
    notify("tr", "Envoyer avec succès", "success");
    dispatch(docChangeEtat( {id: location.id, etat: 9,comm:null, iduser: null }));
    dispatch(generatePdfSign( {idDoc,idApp }));
    setTimeout(() => {
      listeDocument()
    }, 2000);
  }
  function getUserDoc(type) {
    var listnom = "";
    userDocument.forEach((x) => {
      if (x.type === type) listnom += x.users.nom_prenom + " , ";
    });
    return listnom;
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
                  onClick={listeDocument}
                >
                  <span className="btn-label">
                    <i className="fas fa-list"></i>
                  </span>
                  Retour à la liste
                </Button>
              </Col>
            </Row>
            {details !== false ? (
              <Card className="demande">
                <h3>Titre document: {details.documents.titre}</h3>
                <hr />

                <Row>
                  <Col md="12">
                    <h4>Référence document : {details.reference}</h4>
                    <br></br>
                  </Col>
                  {userDocument.length > 0 ? (
                    <Col>
                      <h5>Rédacteurs :{getUserDoc(1)}</h5>
                      <h5>Vérificateur :{getUserDoc(2)}</h5>
                    </Col>
                  ) : (
                    ""
                  )}
                  {details !== null ? (
                    <Col md="12">
                      <a
                        download
                        rel="noreferrer"
                        href={file}
                        target="_blank"
                      >
                        <i className="fas fa-file"></i>
                        <div>Téléchargez</div>
                      </a>
                    </Col>
                  ) : ""}
                  <Col md="12">
                    <br></br>
                    <Button
                      className="btn-fill"
                      type="button"
                      variant="info"
                      name="redac"
                      onClick={submitForm}
                    >
                      Approuver
                    </Button>
                  </Col>
                  
                </Row>
                <br></br>
              </Card>
            ) :""}
          </Container>
        </div>
      </Container>
    </>
  );
}

export default DetailApprobation;
