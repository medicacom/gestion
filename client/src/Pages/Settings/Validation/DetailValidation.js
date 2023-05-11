import React, { useEffect, useState,useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  Form,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import NotificationAlert from "react-notification-alert";
// react-bootstrap components
import { useDispatch } from "react-redux";
import { documentGetById,fetchFile } from "../../../Redux/documentReduce";
import {docChangeEtat,getQuestion,getReponse,getEtape} from "../../../Redux/userDocumentReduce";
import Select from "react-select";
import ReactTable from "../../../components/ReactTable/ReactTable.js";
import { CardBody } from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import { getTextReglement } from "../../../Redux/documentReduce";
import { fetchVideo,getVideoDocument } from "../../../Redux/videoReduce";
import { getFileText } from "../../../Redux/vigueurReduce";
import Questionnaire from "../UserDocument/Questionnaire/Questionnaire";
import { verification } from "../../../Redux/usersReduce";
function DetailValidation(props) {
  const [questionnaire, setQuestionnaire] = React.useState([]);
  const [typeQuestion, setTypeQuestion] = React.useState([]);
  const dispatch = useDispatch();
  const location = useParams();
  var userType = parseInt(location.type);
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
  const [alert, setAlert] = React.useState(null);
  const [details, setDetails] = useState(false);
  const [testCancel, setTestCancel] = useState(false);
  const [note, setNote] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [entities, setEntities] = useState([]);
  const [textReglement, setTextReglement] = useState([]);
  const [etapeSelect, setEtapeSelect] = React.useState([]);
  const [videoUrl, setVideoUrl] = React.useState("");
  const [optionEtape] = React.useState([
    {
      value: "",
      label: "Etape",
    },
    {
      value: 0,
      label: "Début",
    },
    {
      value: 101,
      label: "avancement(%)",
    },
    {
      value: 100,
      label: "Fin",
    },
  ]);
  const getText = useCallback(async () => {
    var doc = await dispatch(getTextReglement(location.id));
    var res = doc.payload;
    
    var col =[];
    res.forEach(async (e,key)=>{
    
      var file =  await dispatch(getFileText(e.vigueurs.file));
      col.push(
        <Col md="3" key={"key_"+e.id} className="text-center font30">
          <a download rel="noreferrer" href={file.payload} target='_blank'><i className="fas fa-file"></i><br></br>{e.vigueurs.titre+"("+e.vigueurs.reference+")"}</a>
        </Col>
      )
      if(res.length === (key+1)) { setTextReglement(col);}
    })
  }, [dispatch,location.id]);

  function listeDocument() {
    if(parseInt(location.type) ===1)
      window.location.replace("/validationRedaction");
    else 
      window.location.replace("/validationVerification");
  }
  function getFullDate(dat) {
    var date = new Date(dat);
    var d =
      date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    return d;
  }
  const getVideo = useCallback(async () => {
    var videoDoc = await dispatch(getVideoDocument(location.id));
    var entities = videoDoc.payload;
    if(entities !== false){
      var v = await dispatch(fetchVideo(entities.video));
      setVideoUrl(v.payload)
    }
  },
    [dispatch,location.id]
  );

  const getFiles = useCallback(async (file,key) => {
      var f = await dispatch(fetchFile(file));
      var res = f.payload;
      return res;
    },
    [dispatch]
  );
  const getQuestionnaire = useCallback(async () => {
      var req1 = await dispatch(getQuestion(location.id));
      var quest = await req1.payload;
      var req2 = await dispatch(getReponse(location.id));
      var rep = await req2.payload;
      var array = [];
      var list = [];
      quest.forEach((val,key)=>{
        var data = rep.filter(function(value, index, arr){
          return parseInt(value.id_quest ) === parseInt(val.id);
        });
        array.push({
          id:val.id,
          question:val.text,
          id_document:parseInt(location.id),
          type:val.type,
          reponse:data,
        })
        if(val.type === 0)
          list.push({
            value: 0,
            label: "Avant vidéo",
          })
        else 
          list.push({
            value: 1,
            label: "Aprés vidéo",
          })
      })
      setQuestionnaire(array)
      setTypeQuestion(list)
    },
    [dispatch,location.id]
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
    getQuestionnaire()
    const promise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        var detailBD = await dispatch(documentGetById(location.id));
        var entities = detailBD.payload;
        resolve(entities);
      }, 0);
    });

    promise.then((value) => {
      setNote(value.note);
      if(value.commentaire !=="" && value.commentaire !== null)
      {
        setTestCancel(true)
        setCommentaire(value.commentaire)
      }
      setDetails(value);
    });

    const promise2 = new Promise((resolve, reject) => {
      setTimeout(async () => {
        var detailBD = await dispatch(getEtape({ idDoc: location.id, idUser: userType })
        );
        var entities = detailBD.payload;
        resolve(entities);
      }, 0);
    });

    promise2.then((value) => {
      if (value.length > 0) {
        var array=[];
        value.forEach(async (e,key)=>{
            var r = await getFiles(e.file);
            array.push({
              id:e.id,
              user:e.userdocuments.users.nom_prenom,
              createdAt:e.createdAt,
              note:e.note,
              id_role:e.id_role,
              file:r,
              etape:e.etape
            })
            if((key+1) === value.length){       
              setEntities(array);  
            }
        })
        setEntities(value);
      }
    });
    getText();
    getVideo();
  }, [dispatch,getText,userType,getVideo,getFiles,getQuestionnaire,location.id,verifToken]);
  
  function submitFormRedaction(etat) {
    hideAlert()
    if (etat === 1 && userType ===1) {
      setTestCancel(true);
      if(commentaire !=="" && commentaire !==null){
        dispatch(docChangeEtat({id: location.id,etat:1,comm:commentaire, iduser: location.idUserDoc}))
        notify("tr", "Envoyer avec succès", "success");
        setTimeout(() => {
          listeDocument()
        }, 1000);
      }      
      else notify("tr", "Commentaire est obligatoire", "danger");
    } else if(etat === 3 && userType ===1) {
      dispatch(docChangeEtat({id: location.id,etat:3,comm:commentaire, iduser: location.idUserDoc}))
      notify("tr", "Envoyer avec succès", "success");
      setTimeout(() => {
        listeDocument()
      }, 1000);
    }
    
    if (etat === 4 && userType ===2) {
      setTestCancel(true);
      if(commentaire !=="" && commentaire !==null){
        dispatch(docChangeEtat({id: location.id,etat:4,comm:commentaire, iduser: location.idUserDoc}))
        notify("tr", "Envoyer avec succès", "success");
        setTimeout(() => {
          listeDocument()
        }, 1000);
      }      
      else notify("tr", "Commentaire est obligatoire", "danger");
    } else if(etat === 6 && userType ===2) {
      dispatch(docChangeEtat({id: location.id,etat:6,comm:commentaire, iduser: location.idUserDoc}))
      notify("tr", "Envoyer avec succès", "success");
      setTimeout(() => {
        listeDocument()
      }, 1000);
    }
  }
  const hideAlert = () => {
    setAlert(null);
  };
  const confirmMessage = (etat) => {
    setAlert(
      <SweetAlert
        style={{ display: "block", marginTop: "-100px" }}
        title="Étes vous sure?"
        onConfirm={() => submitFormRedaction(etat)}
        onCancel={() => hideAlert()}
        confirmBtnBsStyle="info"
        cancelBtnBsStyle="danger"
        confirmBtnText="Oui"
        cancelBtnText="Non"
        showCancel
      >
      </SweetAlert>
    );
  };
  return (
    <>
      {alert}
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
                <h3>Détails document</h3>
                <hr />

                <Row>
                  <Col md="12">
                    Titre : {details.titre}
                    <br></br>
                  </Col>
                  <Col md="12">
                    Type de document : {details.types.type}
                    <br></br>
                  </Col>

                  <Col md="12">
                    <Form.Group>
                      <label>Note </label>
                      <Form.Control
                        placeholder="Note"
                        name="Note"
                        defaultValue={note}
                        as="textarea"
                        rows="3"
                        onChange={(value) => {
                          setNote(value.target.value);
                        }}
                      ></Form.Control>
                    </Form.Group>
                    <br></br>
                  </Col>
                
                </Row>
              </Card>
            ) : (
              ""
            )}
            <br></br>
            <Card>
              <CardBody>
                {parseInt(details.etat) >3 || userType === 2 ?<div>
                    <h3>Vidéo</h3>
                    <video
                      className="VideoInput_video"
                      width="100%"
                      height={"500px"}
                      controls
                      src={videoUrl}
                    />
                </div>:""}
                  <div>
                    <h3>Text reglementaire</h3>
                    <Row>
                    
                      {textReglement}
                    </Row>
                  </div>
                <Row>
                  <Col>
                    <h3>Etape</h3>
                    <hr />

                    <ReactTable
                      data={entities}
                      columns={[
                        {
                          Header: "Ajouter par",
                          accessor: "user",
                        },
                        {
                          Header: "Fichier",
                          accessor: "file",
                          Cell: ({ cell }) =>
                            cell.row.original.id === null ||
                            cell.row.values.file === "" ||
                            cell.row.values.file === null ? (
                              <Form.Group>
                                <Form.Control
                                  placeholder="Fichier"
                                  type="file"
                                  onChange={(value) => {
                                    var file = entities;
                                    file[cell.row.id].file =
                                      value.target.files[0];
                                    setEntities(file);
                                  }}
                                ></Form.Control>
                              </Form.Group>
                            ) : (
                              <a
                                rel="noreferrer"
                                download
                                href={cell.row.values.file}
                                target="_blank"
                              >
                                <i className="fas fa-file"></i>
                                Consulter
                              </a>
                            ),
                        },
                        {
                          Header: "etape",
                          accessor: "etape",
                          Cell: ({ cell }) =>
                            cell.row.original.id === null ? (
                              <div>
                                <Select
                                  placeholder="etape"
                                  className="react-select primary"
                                  classNamePrefix="react-select"
                                  value={etapeSelect[cell.row.id]}
                                  onChange={(v) => {
                                    var e = entities;
                                    if (v.value !== 101) {
                                      document
                                        .getElementById("aven" + cell.row.id)
                                        .classList.add("hidden");
                                    } else {
                                      document
                                        .getElementById("aven" + cell.row.id)
                                        .classList.remove("hidden");
                                    }
                                    var testTab = e.filter((x) => {
                                      return x.etape === 100;
                                    });
                                    var select = etapeSelect;
                                    if (testTab.length > 0 && v.value === 100) {
                                      notify(
                                        "tr",
                                        "Vous avez déjà sélectionné étape fin merci de vérifier vos données",
                                        "danger"
                                      );
                                      select[cell.row.id] = {
                                        value: "",
                                        label: "Etape",
                                      };
                                    } else {
                                      if (v.value !== 101) {
                                        e[cell.row.id].etape = v.value;
                                      }
                                      select[cell.row.id] = v;
                                      setEtapeSelect(select);
                                    }
                                    setEntities(e);
                                  }}
                                  options={optionEtape}
                                />
                                <Form.Group>
                                  <Form.Control
                                    id={"aven" + cell.row.id}
                                    className="hidden"
                                    placeholder="Avencement(%)"
                                    type="number"
                                    min={"1"}
                                    max={"99"}
                                    onChange={(value) => {
                                      var e = entities;
                                      e[cell.row.id].etape = parseInt(
                                        value.target.value
                                      );
                                      setEntities(e);
                                    }}
                                  ></Form.Control>
                                </Form.Group>
                              </div>
                            ) : cell.row.values.etape === 0 ? (
                              "Début"
                            ) : cell.row.values.etape === 100 ? (
                              "Fin"
                            ) : (
                              "Avencement(%):" + cell.row.values.etape
                            ),
                        },
                        {
                          Header: "Note",
                          accessor: "note",
                        },
                        {
                          Header: "Date",
                          accessor: "createdAt",
                          Cell: ({ cell }) =>
                            cell.row.original.id !== null
                              ? getFullDate(cell.row.values.createdAt)
                              : cell.row.original.createdAt,
                        },
                      ]}
                      className="-striped -highlight primary-pagination"
                    />
                    <br></br>
                  </Col>
                </Row>
              </CardBody>
            </Card>
            <br></br>
            <Card>
              <CardBody>
                {(questionnaire.length !== 0)?
                  <Questionnaire
                    typeQuestion={typeQuestion}
                    setQuestionnaire={setQuestionnaire} 
                    array={questionnaire} 
                    type={2} 
                    typeUser ={1} 
                    setReponse={[]} 
                    reponse={[]}
                  ></Questionnaire>
                :""}
                
              </CardBody>
            </Card>
            <br></br>
            {testCancel === true ? (
              <Form.Group>
                <label>Commentaire </label>
                <Form.Control
                  defaultValue={commentaire}
                  placeholder="Commentaire"
                  name="Commentaire"
                  as="textarea"
                  rows="3"
                  onChange={(value) => {
                    setCommentaire(value.target.value);
                  }}
                ></Form.Control>
              </Form.Group>
            ) :""}
            <br></br>
            {testCancel === false ?
            <Button
              className="btn-fill pull-right"
              type="button"
              variant="info"
              name="redac"
              onClick={() => {
                var etat = null;
                userType ===1 ? etat=3:etat=6
                confirmMessage(etat)}
              }
            >
              Valider
            </Button>:""}
            <Button
              className="btn-fill pull-right mr-2"
              type="button"
              variant="danger"
              name="redac"
              onClick={() => {
                var etat = null;
                userType ===1 ? etat=1:etat=4
                confirmMessage(etat)}
              }
            >
              Retour
            </Button>
            <br></br>
          </Container>
        </div>
      </Container>
    </>
  );
}

export default DetailValidation;
