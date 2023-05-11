import { Button, Card, Container, Row, Col } from "react-bootstrap";
import React, { useEffect, useCallback, useState } from "react";
import { getByReference } from "../../../Redux/referenceReduce";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchFile,
  pdfsignature,
  verifFeuilleUser,
  documentGetById
} from "../../../Redux/documentReduce";
import {
  getQuestion,
  getReponse,
  getScore,
  verifReponse,
} from "../../../Redux/userDocumentReduce";
import {
  getVideo,
  getVideoDocument,
  fetchVideo,
  saveVideoUser,
} from "../../../Redux/videoReduce";
import PDFMerger from "pdf-merger-js/browser";

/* import Questionnaire from "../UserDocument/Questionnaire/Questionnaire"; */
import Questionnaire from "./Questionnaire";
import SweetAlert from "react-bootstrap-sweetalert";
import { verification } from "../../../Redux/usersReduce";
// core components
function Visualisation({ obj }) {
  const [alert, setAlert] = React.useState(null);
  const [questionnaire, setQuestionnaire] = React.useState([]);
  const [examen, setExamen] = React.useState([]);
  const [reponse, setReponse] = React.useState([]);
  const dispatch = useDispatch();
  const location = useParams();
  const id = location.id;
  var idUser = obj.user.id;
  const [mergedPdfUrl, setMergedPdfUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState();
  const [testVideoUrl, setTestVideoUrl] = useState(false);
  const [testDepasse, setDepasse] = useState(false);
  const [testExamen, setTestExamen] = useState(false);
  const [scoreExamen, setScoreExamen] = useState(-1);
  const [score, setScore] = useState(-1);
  const [verif, setVerif] = useState(false);
  const confirmMessage = useCallback(async (sc, type) => {
    /* var msg = sc < 75 ? "Ressayer" : "Suivant"; */
    setAlert(
      <SweetAlert
        style={{ display: "block", marginTop: "-100px" }}
        title={"Votre score est " + sc}
        onConfirm={() => hideAlertScore(sc, type)}
        confirmBtnBsStyle="info"
        cancelBtnBsStyle="danger"
        confirmBtnText={"Fermer"}
        cancelBtnText="Non"
      >
        {/* Vous éte sure de supprime cette User? */}
      </SweetAlert>
    );
  }, []);

  const hideAlertScore = (sc, type) => {
    setScore(sc);
    setAlert(null);    
    window.location.reload()
  };

  const confirmScore = useCallback(async (sc, scFinal) => {
    setAlert(
      <SweetAlert
        style={{ display: "block", marginTop: "-100px" }}
        title={"Votre scores"}
        onConfirm={() => hideAlert()}
        confirmBtnBsStyle="info"
        cancelBtnBsStyle="danger"
        confirmBtnText={"ok"}
        cancelBtnText="Non"
      >
        <ul>
          <li> Score question : {sc!==-1?sc:0} % </li>
          <li> Score examen : {scFinal!==-1?scFinal:0} % </li>
        </ul>
        {/* Vous éte sure de supprime cette User? */}
      </SweetAlert>
    );
  }, []);

  const hideAlert = (sc, type) => {
    setAlert(null);
  };

  const getVideoU = useCallback(async () => {
    if (id !== "undefined") {
      var videoDoc = await dispatch(getVideoDocument(id));
      var entities = videoDoc.payload;
      if (entities) {
        var v = await dispatch(fetchVideo(entities.video));
        setVideoUrl(v.payload);
      }
    }
  }, [dispatch, id]);

  const suivant = useCallback(
    async (quest) => {
      setTestVideoUrl(true);
      //dispatch(saveVideoUser({ idDoc: id, idUser: idUser }));
    },
    []
  );

  const suivantExamen = useCallback(async () => {
    setTestExamen(true);
    setScoreExamen(0);
  }, []);

  const getVideoVerif = useCallback(async () => {
    if (id !== "undefined") {
      var v = await dispatch(getVideo({ idDoc: id, idUser: idUser }));
      if (v.payload) {
        setTestVideoUrl(true);
      }
    }
  }, [dispatch, idUser, id]);

  const getScoreUser = useCallback(async () => {
    var data = await dispatch(getScore({ idUser, id }));
    if (data.payload !== 0) {
      setScore(data.payload.score);
      setScoreExamen(data.payload.scoreExamen);
    }
  }, [dispatch, idUser, id]);

  //mergeDocument
  const mergeDocument = useCallback(
    async (action) => {
      const merger = new PDFMerger();
      var sign = await dispatch(pdfsignature(action.ref));
      var file = await dispatch(fetchFile(action.file));
      await merger.add(sign.payload);
      await merger.add(file.payload);
      const mergedPdf = await merger.saveAsBlob();
      const url = URL.createObjectURL(mergedPdf);

      return setMergedPdfUrl(url);
    },
    [dispatch, setMergedPdfUrl]
  );

  function listeDocument() {
    window.location.replace("/listDocumentVigueur");
  }

  const verifFeuille = useCallback(async () => {
    var feille = await dispatch(verifFeuilleUser({ id, idUser }));
    var s = feille.payload;
    if (s.length > 0) setVerif(true);
  }, [dispatch, idUser, id]);

  const getQuestionnaire = useCallback(
    async (testVideo) => {
      var req1 = await dispatch(getQuestion(id));
      var quest = await req1.payload;
      var req2 = await dispatch(getReponse(id));
      var rep = await req2.payload;
      /* setReponse(rep); */
      var array = [];
      var array1 = [];
      var arrayExamen = [];
      quest.forEach((val, key) => {
        var data = rep.filter(function (value, index, arr) {
          var init = value;
          init.valide = null;
          return parseInt(init.id_quest) === parseInt(val.id);
        });
        array1[key] = 0;
        if (val.type === 0)
          array.push({
            id: val.id,
            question: val.text,
            id_document: parseInt(id),
            reponse: data,
          });
        else
          arrayExamen.push({
            id: val.id,
            question: val.text,
            id_document: parseInt(id),
            reponse: data,
          });
      });
      if (testVideo && array.length === 0) {
        setScore(100);
      }
      setReponse(array1);
      setQuestionnaire(array);
      setExamen(arrayExamen);
    },
    [dispatch, id]
  );

  //verif token
  const verifToken = useCallback(async () => {
    var response = await dispatch(verification());
    if (response.payload === false) {
      localStorage.clear();
      window.location.replace("/login");
    }
  }, [dispatch]);

  //verif token
  const getDoc = useCallback(async () => {
    var response = await dispatch(documentGetById(id));
    var val= await response.payload;    
    var lastYear = new Date(val.updatedAt).getFullYear();
    var year = new Date().getFullYear();
    if((year-lastYear)>=2) {
      setTestVideoUrl(true)
      setDepasse(true)
    }
  }, [dispatch,id]);

  useEffect(() => {
    verifToken();
    getQuestionnaire(testVideoUrl);
    const promise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        var response = await dispatch(getByReference({ id }));
        resolve(response.payload);
      }, 0);
    });

    promise.then((value) => {
      var file = "";
      var ref = "";
      if (value !== null) {
        if (typeof value.file != "undefined") file = value.file;
        if (typeof value.reference != "undefined")
          ref = value.reference.replaceAll(" ", "") + ".pdf";
        mergeDocument({ ref, file });
      }
    });
    getVideoVerif();
    getVideoU();
    verifFeuille();
    getScoreUser();
    getDoc();
  }, [
    dispatch,
    mergeDocument,
    verifFeuille,
    getVideoU,
    getVideoVerif,
    id,
    getQuestionnaire,
    getScoreUser,
    verifToken,
    testVideoUrl,
    getDoc
  ]);

  const submitQuestion = useCallback(
    async (data, quest, type) => {
      var sc = await dispatch(
        verifReponse({
          data: data,
          id: id,
          idUser: idUser,
          count: quest.length,
          type: type,
        })
      );
      confirmMessage(sc.payload.score, type);
    },
    [dispatch, id, confirmMessage, idUser]
  );

  function Document() {
    if (questionnaire.length !== 0 && score === -1 && testVideoUrl === false) {
      return (
        <Card>
          <Card.Body>
            <Questionnaire
              question={questionnaire}
              setReponse={setReponse}
              reponse={reponse}
            ></Questionnaire>
            {/* <Button
                id="saveBL"
                className="btn-wd mr-1 float-left"
                type="button"
                variant="info"
                onClick={()=>{
                  window.location.reload()
                }}
              >
                <span className="btn-label">
                  <i className="fas fa-arrow-left"></i>
                </span>
                Précédent
              </Button> */}
            <Button
              className="btn-fill pull-right"
              type="button"
              variant="info"
              name="redac"
              onClick={() => submitQuestion(reponse, questionnaire, 0)}
            >
              Suivant
              <span className="btn-label">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Button>
          </Card.Body>
        </Card>
      );
    } else if (
      (questionnaire.length !== 0 && testVideoUrl === false) ||
      (questionnaire.length === 0 && testVideoUrl === false)
    ) {
      return (
        <div>
          <video
            className="VideoInput_video"
            width="100%"
            height={"500px"}
            controls
            src={videoUrl}
          />
          <br></br>
          <br></br>
          <Button
            id="saveBL"
            className="btn-wd mr-1 float-right"
            type="button"
            variant="info"
            onClick={() => suivant(questionnaire)}
          >
            Suivant
            <span className="btn-label">
              <i className="fas fa-arrow-right"></i>
            </span>
          </Button>
        </div>
      );
    } else {
      //if (mergedPdfUrl !== "" && testVideoUrl === true && testExamen === false)
      if (mergedPdfUrl !== "" && testVideoUrl === true && testExamen === false) {
        return (
          <div>
            {scoreExamen <= 0 && examen.length > 0 && !testDepasse ? (
              <Button
                id="saveBL"
                className="btn-wd mr-1 float-right"
                type="button"
                variant="success"
                onClick={suivantExamen}
              >
                Passer examen
              </Button>
            ) : ""}
            <iframe
              height={1000}
              src={`${mergedPdfUrl}#toolbar=0`}
              title="pdf-viewer"
              width="100%"
            ></iframe>
            <br></br>
            <Button
              className="btn-wd mr-1 float-right"
              type="button"
              variant="success"
              onClick={() => {
                confirmScore(score, scoreExamen);
              }}
            >
              Score
              {/* <span className="btn-label">
                <i className="fas fa-arrow-right"></i>confirmMessage(sc.payload.score,type)  
              </span> */}
            </Button>
            {verif === true ? (
              <a
                href={mergedPdfUrl}
                download
                className="btn btn-info float-right"
              >
                <i className="fas fa-download"></i>Télécharger
              </a>
            ) : (
              ""
            )}
          </div>
        );
      } else
        return (
          <div>
            <Questionnaire
              question={examen}
              setReponse={setReponse}
              reponse={reponse}
            ></Questionnaire>
            <Button
              className="btn-fill pull-right"
              type="button"
              variant="info"
              name="redac"
              onClick={() => submitQuestion(reponse, examen, 1)}
            >
              Save score
              <span className="btn-label">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Button>
          </div>
        );
    }
  }
  
  return (
    <>
      {alert}
      <Container fluid>
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
        <Col md="12">
          <h4 className="title">Vusialisation document</h4>
          <Card>
            <Card.Body>
              <Document></Document>
              {/* {(testVideoUrl === false) ? (
                <div>
                  <video
                    className="VideoInput_video"
                    width="100%"
                    height={"500px"}
                    controls
                    src={videoUrl}
                  />
                  <br></br>
                  <br></br>
                  <Button
                    id="saveBL"
                    className="btn-wd mr-1 float-right"
                    type="button"
                    variant="info"
                    onClick={()=>suivant(questionnaire)}
                  >
                    Suivant
                    <span className="btn-label">
                      <i className="fas fa-arrow-right"></i>
                    </span>
                  </Button>
                </div>)             
              : <Document></Document>} */}
              {/* {(testVideoUrl === false && score===-1) ? (
                <div>
                  <video
                    className="VideoInput_video"
                    width="100%"
                    height={"500px"}
                    controls
                    src={videoUrl}
                  />
                  <br></br>
                  <br></br>
                  <Button
                    id="saveBL"
                    className="btn-wd mr-1 float-right"
                    type="button"
                    variant="info"
                    onClick={()=>suivant(questionnaire)}
                  >
                    Suivant
                    <span className="btn-label">
                      <i className="fas fa-arrow-right"></i>
                    </span>
                  </Button>
                </div>)             
              : <Document></Document>} */}
              <div className="clear"></div>
              <br></br>
            </Card.Body>
          </Card>
        </Col>
      </Container>
    </>
  );
}
export default Visualisation;
