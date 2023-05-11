import NotificationAlert from "react-notification-alert";
import { Button, Card, Container, Row, Col, Form } from "react-bootstrap";
import React, { useEffect, useCallback } from "react";
import { feuilleGetById, feuilleAdded,generatePdfFeuille,getFileFeuille } from "../../../Redux/feuilleReduce";
import { getReferenceByDoc } from "../../../Redux/referenceReduce";
import { useDispatch } from "react-redux";
import { fetchUsers,verification } from "../../../Redux/usersReduce";
import Select from "react-select";
import { useParams } from "react-router-dom";
import { CardBody } from "reactstrap";
import { fetchFile } from "../../../Redux/documentReduce";

// core components
function AjouterFeuille() {
  const dispatch = useDispatch();
  const location = useParams();
  const idDocument = location.id;
  const idReference = location.ref;
  const notificationAlertRef = React.useRef(null);
  const [file, setFile] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [userSelect, setUserSelect] = React.useState([]);
  const [imprimer, setImprimer] = React.useState("");
  const [optionUser, setOptionUser] = React.useState([
    {
      value: "",
      label: "Utilisateur",
      isDisabled: true,
    },
  ]);
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

  //generer fichier pdf selon user selected et ajouter une nouvlle Feuille émargement
  function imprimerDoc() {
    if (userSelect.length > 0 && imprimer !== "") {
      document.getElementById("loaderTable").classList.remove("hidden")
      dispatch(generatePdfFeuille({userSelect,reference})).then(e=>{
        dispatch(getFileFeuille(e.payload)).then(async e1=>{
          const file = new Blob([e1.payload], {
            type: "application/pdf",
          });

          const fileURL = URL.createObjectURL(file);
          var link = document.getElementById("feuille");
          link.href = fileURL;
          link.download = "Feuille-"+reference;
          link.click();
          document.getElementById("loaderTable").classList.add("hidden")
          var a = document.getElementById("download");
          a.click();
          notify("tr", "Insertion avec succés", "success");
          dispatch(feuilleAdded({ userSelect, idDocument, imprimer,idReference }));
          setTimeout(() => {
            window.location.replace("/feuilleEmargement");
          }, 1500);
        })

      })
    } else {
      notify("tr", "Tous les champs sont obligatoires", "danger");
    }
  }

  //get all user
  const getUser = useCallback(
    async (array) => {
      var user = await dispatch(fetchUsers());
      var entities = user.payload;
      var arrayOption = [];
      var select = [];
      entities.forEach((e) => {
        arrayOption.push({ value: e.id, label: e.nom_prenom,sign:e.signature});
        if (array.includes(e.id)) {
          select.push({ value: e.id, label: e.nom_prenom,sign:e.signature });
        }
      });
      setUserSelect(select);
      setOptionUser(arrayOption);
      return arrayOption;
    },
    [dispatch]
  );

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
        var response = await dispatch(feuilleGetById(idDocument));
        resolve(response.payload);
      }, 0);
    });

    promise.then((value) => {
      var iduser = [];
      if (value.length > 0) {
        setImprimer(value[0].feuilles.imprimer);
        value.forEach((e) => {
          iduser.push(e.id_user);
        });
      }
      getUser(iduser);
      //setEntities(value);
    });
    async function getFile() {
      const promise1 = new Promise((resolve, reject) => {
        setTimeout(async () => {
          var userDoc = await dispatch(getReferenceByDoc(idDocument));
          var entities = userDoc.payload;
          var file = await dispatch(fetchFile(entities.ref.file));
          setFile(file.payload);

          resolve(entities);
        }, 0);
      });

      promise1.then((value) => {
        setReference(value.ref.reference);
      });
    }
    getFile();
  }, [dispatch, getUser, idDocument,verifToken]);
  return (
    <>
      <Container>
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>

        <Card>
          <CardBody>
            <Row>
              <Col className="pr-1" md="6">
                <Form.Group id="redacteurClass">
                  <label>Liste distributions </label>
                  <Select
                    isMulti
                    placeholder="Liste distributions"
                    className="react-select primary"
                    classNamePrefix="react-select"
                    value={userSelect}
                    onChange={(value) => {
                      setUserSelect(value);
                    }}
                    options={optionUser}
                  />
                </Form.Group>
              </Col>
              <Col className="pl-1" md="6">
                <Form.Group>
                  <label>N° imprimer </label>
                  <Form.Control
                    defaultValue={imprimer}
                    type="number"
                    placeholder="N° imprimer"
                    name="Imprimer"
                    onChange={(value) => {
                      setImprimer(value.target.value);
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
              onClick={imprimerDoc}
            >
              Valider
            </Button>
          </CardBody>
          {file !== "" ? (
            <a aria-label="file"
              href={file}
              download
              id="download"  rel="noopener noreferrer"
              className="hidden" aria-hidden
              target="_blank"
            >ici</a>
          ) : (
            ""
          )}
        </Card>
        <a href={"#top"}
         id="feuille"
          rel="noopener noreferrer"
          className="hidden"
          target="_blank"
        >ici</a>
        <div id="loaderTable" className="hidden">
          <img
            className="loaderTable"
            src={require("../../../assets/img/loader.gif").default}
            
            alt="loader"
          />
          <div className="textLoader">En cours de générer feuille d'émergement...</div>
        </div>

      </Container>
    </>
  );
}

export default AjouterFeuille;
