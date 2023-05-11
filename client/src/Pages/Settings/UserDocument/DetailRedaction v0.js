import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {  Alert, Button,  Card, Form,  Container,  Row,  Col } from "react-bootstrap";
import NotificationAlert from "react-notification-alert";
// react-bootstrap components
import { useDispatch } from "react-redux";
import { documentGetById,fetchFile } from "../../../Redux/documentReduce";
import {  getEtape,  saveEtape,  saveFiles,  deleteEtapeDoc,  docChangeEtat, getQuestion,getReponse,
  saveQuestion, getFileEtape,  saveVigueurDoc,  getDocVigeur} from "../../../Redux/userDocumentReduce";
import Select from "react-select";
import ReactTable from "../../../components/ReactTable/ReactTable.js";

import { CardBody } from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import { fetchVigueur,getFileText } from "../../../Redux/vigueurReduce";
import { getTextReglement } from "../../../Redux/documentReduce";
import { fetchVideo,getVideoDocument,saveVideoDoc } from "../../../Redux/videoReduce";
import { getFile } from "../../../Redux/typeReduce";
import Dropzone from "react-dropzone";
import Questionnaire from "./Questionnaire/Questionnaire";
import { verification } from "../../../Redux/usersReduce";

function DetailRedaction(props) {
  const navigate = useNavigate();
  const [questionnaire, setQuestionnaire] = React.useState([]);
  const [typeQuestion, setTypeQuestion] = React.useState([]);
  const [saveQ, setSaveQ] = React.useState(0);
  if(parseInt(props.type)===1)document.title = "Redaction";
  else document.title = "Vérification";
  const dispatch = useDispatch();
  const location = useParams();  
  var iduser = props.users.id;
  var nomUser = props.users.nom_prenom;
  var userType = parseInt(props.type);
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
  const [video, setVideo] = React.useState("");
  const [videoUrl, setVideoUrl] = React.useState("");
  const [fileType, setFileType] = React.useState("");
  
  const [alert, setAlert] = React.useState(null);
  const [fileEtape, setFileEtape] = React.useState(null);
  const [details, setDetails] = useState(false);
  const [testEtape, setTestEtape] = useState(false);
  const [note, setNote] = useState("");
  const [entities, setEntities] = useState([]);
  const [vigueurSelect, setVigueurSelect] = React.useState([]);
  const [textReglement, setTextReglement] = useState([]);
  const [optionVigueur, setOptionVigueur] = React.useState([
    {
      value: "",
      label: "Vigueur",
      isDisabled: true,
    },
  ]);
  const [etapeSelect, setEtapeSelect] = React.useState([]);
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
  const uploadVideo = (acceptedFiles) => {
    setVideo(acceptedFiles[0]);
    setVideoUrl(URL.createObjectURL(acceptedFiles[0]));
  };
  const getQuestionnaire = useCallback(async () => {
      var req1 = await dispatch(getQuestion(location.id));
      var quest = await req1.payload;
      var req2 = await dispatch(getReponse(location.id));
      var rep = await req2.payload;
      var array = [];
      var list = [];
      quest.forEach((val,key)=>{
        var data = rep.filter(function(value, index, arr){
          return parseInt(value.id_quest) === parseInt(val.id);
        });
        array.push({
          id:val.id,
          type:val.type,
          question:val.text,
          id_document:parseInt(location.id),
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
      setTypeQuestion(list)
      setSaveQ(array.length)
      setQuestionnaire(array)
    },
    [dispatch,location.id]
  );
  /* const getQuestionnaire = useCallback(async () => {
      var videoDoc = await dispatch(getQuestion(location.id));
      var res = videoDoc.payload;
      setQuestionnaire(res)
    },
    [dispatch,location.id]
  ); */
  function AjoutLigne(event) {
    var list = [];
    var date = new Date();
    var d =
      date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    if (entities.length > 0) list = [...entities];
    list[list.length] = {
      id: null,
      etape: null,
      file: null,
      id_document: location.id,
      id_user: iduser,
      createdAt: d,
      note: "",
    };
    setEntities(list);
  }

  function listeDocument() {
    navigate('/redactionDocument');
  }
  function getFullDate(dat) {
    var date = new Date(dat);
    var d =
      date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    return d;
  }

  //save etape
  function submitFormEtape(event) {
    const fileL = new FormData();
    var listSave = [...entities];
    var fileList = [];
    var d = new Date();
    var error = false;
    var testetape = false;
    listSave.forEach((e, k) => {
      var fi = "";
      if (e.file !== null && e.file !== "") {
        if (typeof e.file.name !== "undefined") {
          if (!error) {
            var f = e.file.name;
            var rest = f.substring(0, f.lastIndexOf(".") + 1);
            var last = f.substring(f.lastIndexOf(".") + 1, f.length);
            fi = d.getTime() + rest + last;
            const fileArray = new FormData();
            fileArray.append("file", e.file, fi);
            dispatch(saveFiles(fileArray));
          }
        } else {
          if (e.id !== null) fi = e.fileName;
        }
      }

      if (listSave[k].etape === null || listSave[k].etape === "") {
        error = true;
      } else {
        if (e.etape === 100) {
          if (e.file === null || e.file === "") {
            error = true;
            testetape = true;
          } else if (userType === 2 && e.file.type !== "application/pdf") {
            error = true;
            testetape = true;
          }
        }
        fileList[k] = {
          id: e.id,
          etape: e.etape,
          file: fi,
          id_document: location.id,
          id_user: iduser,
          nom: nomUser,
          createdAt: e.createdAt,
          note: e.note,
          type: userType,
        };
      }
    });
    fileL.append("listEtape", fileList);
    if (!error) {
      notify("tr", "Données enregistrées avec succès", "success");
      dispatch(saveEtape({ fileList }));
      if (vigueurSelect.length > 0 && userType === 1)
        dispatch(
          saveVigueurDoc({ idDocument: location.id, vigueur: vigueurSelect })
        );
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      if (testetape === false) {
        notify("tr", "Etape est obligatoire", "danger");
      } else {
        if (userType === 2)
          notify("tr", "Le format de fichier doit être en PDF !", "danger");
        else notify("tr", "Fichier est obligatoire", "danger");
      }
    }
  }

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

  const getVigueur = useCallback(
    async (p) => {
      var user = await dispatch(fetchVigueur());

      var entities = user.payload;
      var arrayOption = [];
      var selected = [];
      entities.forEach((e) => {
        arrayOption.push({ value: e.id, label: e.titre });
        if (p.length > 0 && p.includes(e.id)) {
          selected.push({ value: e.id, label: e.titre });
        }
      });
      setVigueurSelect(selected);
      setOptionVigueur(arrayOption);
      return arrayOption;
    },
    [dispatch]
  );
  const getVideo = useCallback(async () => {
      var videoDoc = await dispatch(getVideoDocument(location.id));
      var entities = videoDoc.payload;
      if(entities){ 
        var v = await dispatch(fetchVideo(entities.video));
        setVideo(entities.video);
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
        var file = await dispatch(getFile(detailBD.payload.types.file));
        resolve({document:entities,file:file.payload});
      }, 0);
    });

    promise.then((value) => {
      setNote(value.document.note);
      setDetails(value.document);
      setFileType(value.file);
    });

    const promise2 = new Promise((resolve, reject) => {
      setTimeout(async () => {
        var detailBD = await dispatch(getEtape({ idDoc: location.id, idUser: userType })   );
        var etapes = detailBD.payload;
        var detailFiles = await dispatch(getFileEtape({ idDoc: location.id, idUser: iduser }));
        var etapesfiles = detailFiles.payload;
        
        var docVigeur = await dispatch(getDocVigeur({ idDoc: location.id }));
        var docVigeurs = docVigeur.payload;
        // file 
        var file = "";
        var resFile = "";
        if(etapesfiles !== false){
          file = await dispatch(fetchFile(etapesfiles.file));
          resFile = file.payload;
        }
        resolve({ etapes, etapesfiles, docVigeurs,resFile });
      }, 0);
    });

    promise2.then((value) => {
      if (value.etapesfiles !== false) setFileEtape(value.resFile);

      if (value.etapes.length > 0) {
        setTestEtape(true);
        var array=[];
        value.etapes.forEach(async (e,key)=>{
            var r = await getFiles(e.file);
            array.push({
              id:e.id,
              user:e.userdocuments.users.nom_prenom,
              createdAt:e.createdAt,
              note:e.note,
              id_role:e.id_role,
              file:r,
              etape:e.etape,
              fileName:e.file
            })
            if((key+1) === value.etapes.length){ 
              setEntities(array);  
            }
        })
      } else AjoutLigne();
      var p = [];
      if (value.docVigeurs.length > 0) {
        value.docVigeurs.forEach((x) => {
          p.push(x.id_vigueur);
        });
      }
      getVigueur(p);
      getText();
    });
    getVideo();
  }, [location.id, iduser, getVigueur, getText, dispatch, userType,getVideo,getFiles,getQuestionnaire,verifToken]);

  //save etat
  function submitFormRedaction() {
    hideAlert();
    var testTab = "";
    if (details.etat === "1" && userType === 1) {
      testTab = entities.filter((x) => {
        return x.etape === 100;
      });
      if (testTab.length === 1 &&
        testTab[0].file !== null &&
        testTab[0].file !== "" &&
        vigueurSelect.length > 0
      ) {
        dispatch(docChangeEtat({id: location.id,etat: 2,comm: null,iduser: iduser}) );
        dispatch(saveVigueurDoc({ idDocument: location.id, vigueur: vigueurSelect }));
        notify("tr", "Votre document a été envoyer", "success");
        setTimeout(() => {
          navigate('/redactionDocument');
        }, 1500);
      } else if (vigueurSelect.length === 0) {
        notify("tr","Il faut séléctionner un ou plusieur texte réglementaire","danger");
      }else {
        notify("tr","Il faut être une étape finit merci de vérifier vos données","danger");
      }
    } else if (details.etat === "3" && userType === 1) {
      if(video !==""){
        const videoArray = new FormData();
        videoArray.append("video", video);
        videoArray.append("name", video.name);
        videoArray.append("idDoc", location.id);          
        dispatch(saveVideoDoc( videoArray ));   
        dispatch(docChangeEtat({ id: location.id, etat: 4, comm: null, iduser: iduser }));
        notify("tr", "Signature a été envoyer", "success");
        setTimeout(() => {
          navigate('/redactionDocument');
        }, 2000);        
      }else if (video ==="") {
        notify("tr","Video ! ","danger");
      } 
    }
    if (details.etat === "4" && userType === 2) {
      testTab = entities.filter((x) => {
        return x.etape === 100;
      });
      if (
        testTab.length === 1 &&
        testTab[0].file !== null &&
        testTab[0].file !== ""
      ) {
        dispatch(
          docChangeEtat({
            id: location.id,
            etat: 5,
            comm: null,
            iduser: iduser,
          })
        );
        notify("tr", "Votre document a été envoyer", "success");
        setTimeout(() => {
          navigate('/verificationDocument');
        }, 1500);
      } else {
        notify(
          "tr",
          "Il faut être une étape finit merci de vérifier vos données",
          "danger"
        );
      }
    } else if (details.etat === "6" && userType === 2) {
      dispatch(docChangeEtat({ id: location.id, etat: 7, comm: null, iduser: iduser }));
      notify("tr", "Signature a été envoyer", "success");
      setTimeout(() => {
        navigate('/verificationDocument');
      }, 2000);
    }
  }
  const hideAlert = () => {
    setAlert(null);
  };
  const confirmMessage = (id, nb) => {
    setAlert(
      <SweetAlert
        style={{ display: "block", marginTop: "-100px" }}
        title="Étes vous sure de supprimer cette etape?"
        onConfirm={() => deleteEtape(id, nb)}
        onCancel={() => hideAlert()}
        confirmBtnBsStyle="info"
        cancelBtnBsStyle="danger"
        confirmBtnText="Oui"
        cancelBtnText="Non"
        showCancel
      ></SweetAlert>
    );
  };
  const confirmMessageEnv = () => {
    setAlert(
      <SweetAlert
        style={{ display: "block", marginTop: "-100px" }}
        title="Étes vous sure?"
        onConfirm={() => submitFormRedaction()}
        onCancel={() => hideAlert()}
        confirmBtnBsStyle="info"
        cancelBtnBsStyle="danger"
        confirmBtnText="Oui"
        cancelBtnText="Non"
        showCancel
      >
        {/* Vous éte sure de supprime cette User? */}
      </SweetAlert>
    );
  };

  function deleteEtape(id, nb) {
    if (entities.length > 1) {
      entities.splice(nb, 1);
      setEntities(entities);
      notify("tr", "Supprimer avec succes", "success");
      if (id != null) dispatch(deleteEtapeDoc({ id }));
    } else {
      notify("tr", "il faut contient au moins une ligne", "warning");
    }
    hideAlert();
  }
  function submitQuestion (){
    var id = location.id;
    notify("tr", "Enregistrer avec succes", "success");
    dispatch( saveQuestion({ questionnaire,id}) );
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }
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
            {(parseInt(details.etat) >= 4 && userType === 2) ||
            userType === 1 ? (
              <div>
                {details !== false &&
                details.commentaire !== null &&
                details.commentaire !== "" ? (
                  <Alert variant="danger">
                    <span>{details.commentaire}</span>
                  </Alert>
                ) : (
                  ""
                )}
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
                      <Col md="12">
                        {details.types.file !== "" && userType === 1 ? (
                          <a
                            download
                            rel="noreferrer"
                            href={fileType}
                            target="_blank"
                          >
                            <i className="fas fa-file"></i>
                            <div>Téléchargez</div>
                          </a>
                        ) : fileEtape !== null ? (
                          <a
                            download
                            rel="noreferrer"
                            href={fileEtape}
                            target="_blank"
                          >
                            <i className="fas fa-file"></i>
                            <div>Téléchargez</div>
                          </a>
                        ) : (
                          ""
                        )}
                      </Col>
                    </Row>
                  </Card>
                ) : ""}
                <Card>
                  <CardBody>
                    {/* video */}

                    { (userType === 1 && details.etat ==="3") || userType === 2 ? (
                      <div className="App">
                        <h3>Vidéo *</h3>
                        {userType === 1 && details.etat ==="3" ? (
                          <Dropzone onDrop={uploadVideo} accept="video/*">
                            {({ getRootProps, getInputProps }) => (
                              <div
                                {...getRootProps({
                                  className: "dropzone",
                                })}
                              >
                                <input {...getInputProps()} />
                                <p>
                                  {videoUrl !== "" ? (
                                    <video
                                      className="VideoInput_video"
                                      width="100%"
                                      height={"500px"}
                                      controls
                                      src={videoUrl}
                                    />
                                  ) : (
                                    "Aucun vidéo selectionner"
                                  )}
                                </p>
                                <p>Choisissez un vidéo</p>
                              </div>
                            )}
                          </Dropzone>
                        ) : (
                          <video
                            className="VideoInput_video"
                            width="100%"
                            height={"500px"}
                            controls
                            src={videoUrl}
                          />
                        )}
                      </div>
                    ) : (
                        (userType === 1 && details.etat ==="4")?
                          <video
                            className="VideoInput_video"
                            width="100%"
                            height={"500px"}
                            controls
                            src={videoUrl}
                          />:""
                    )}
                    {(textReglement.length > 0 && userType === 2) || (userType === 1 && (details.etat>="3"))? (
                   
                      <div>  
                        <h3>Text reglementaire</h3>
                        <Row>
                          {textReglement}
                        </Row>
                      </div>
                    ) : ""}
                    <Row>
                      {userType === 1 && (details.etat<="3")? (
                        <Col className="pr-1" md="12">
                          <Form.Group id="vigueurClass">
                            <h3>Texte réglementaire* </h3>
                            <Select
                              isMulti
                              placeholder="Texte réglementaire"
                              className="react-select primary"
                              classNamePrefix="react-select"
                              value={vigueurSelect}
                              onChange={(value) => {
                                setVigueurSelect(value);
                                /* setTypeDoc(value.value); */
                              }}
                              options={optionVigueur}
                            />
                          </Form.Group>
                        </Col>
                      ) : (
                        ""
                      )}
                    </Row>
                    {/* etape */}
                    <Row>
                      <Col>
                        <Card className="card-header">
                          <CardBody>
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
                                                .getElementById(
                                                  "aven" + cell.row.id
                                                )
                                                .classList.add("hidden");
                                            } else {
                                              document
                                                .getElementById(
                                                  "aven" + cell.row.id
                                                )
                                                .classList.remove("hidden");
                                            }
                                            var testTab = e.filter((x) => {
                                              return x.etape === 100;
                                            });
                                            var select = etapeSelect;
                                            if (
                                              testTab.length > 0 &&
                                              v.value === 100
                                            ) {
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
                                  Cell: ({ cell }) => (
                                    <Form.Group>
                                      <label>Note </label>
                                      <Form.Control
                                        placeholder="Note"
                                        name="Note"
                                        defaultValue={entities[cell.row.id].note}
                                        as="textarea"
                                        rows="3"
                                        onChange={(value) => {
                                          var e = entities;
                                          e[cell.row.id].note = value.target.value;
                                          setEntities(e);
                                        }}
                                      ></Form.Control>
                                    </Form.Group>
                                  ),
                                },
                                {
                                  Header: "Date",
                                  accessor: "createdAt",
                                  Cell: ({ cell }) =>
                                    cell.row.original.id !== null
                                      ? getFullDate(cell.row.values.createdAt)
                                      : cell.row.original.createdAt,
                                },
                                {
                                  Header: "Action",
                                  accessor: "id",
                                  Cell: ({ cell }) =>
                                    details.etat === "1" ||
                                    (details.etat === "4" && userType === 2) ? (
                                      <div className="actions-right block_action">
                                        <Button
                                          id={"idLigneR_" + cell.row.id}
                                          onClick={(ev) => {
                                            confirmMessage(
                                              entities[cell.row.id].id,
                                              cell.row.id
                                            );
                                          }}
                                          variant="danger"
                                          size="sm"
                                          className="text-danger btn-link delete"
                                        >
                                          <i
                                            className="fa fa-trash"
                                            id={"idLigneR_" + cell.row.id}
                                          />
                                        </Button>
                                      </div>
                                    ) : (
                                      ""
                                    ),
                                },
                              ]}
                              className="-striped -highlight primary-pagination"
                            />
                            <br></br>
                            {(details.etat === "1" && userType === 1) ||
                            (userType === 2 && details.etat === "4") ? (
                              <Button
                                className="btn-fill pull-left"
                                type="button"
                                variant="info"
                                name="redac"
                                onClick={(ev) => AjoutLigne("redac")}
                              >
                                Ajouter
                              </Button>
                            ) : (
                              ""
                            )}
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>
                    {(details.etat === "1" && userType === 1) ||
                    (userType === 2 && details.etat === "4") ? (
                      <Button
                        className="btn-fill pull-right"
                        type="button"
                        variant="info"
                        name="redac"
                        onClick={submitFormEtape}
                      >
                        Enregistrer étape
                      </Button>
                    ) : ""}
                  </CardBody>
                </Card>
                {(( testEtape === true && userType === 1) || userType === 2) ?
                  <Card>
                    <CardBody>
                      <Questionnaire
                        setQuestionnaire={setQuestionnaire} 
                        array={questionnaire}
                        typeQuestion={typeQuestion}
                        type={props.type} 
                        typeUser ={1} 
                        setReponse={[]} 
                        reponse={[]}
                        details={details}
                      ></Questionnaire>
                      <br></br>
                      {(userType === 1 && parseInt(details.etat)<=3)?
                      <Button
                        className="btn-fill pull-right"
                        type="button"
                        variant="info"
                        name="redac"
                        onClick={submitQuestion}
                      >
                        Enregistrer Question
                      </Button>:""}
                    </CardBody>
                  </Card>
                :""}

                {(details.etat === "1" && userType === 1 && saveQ !== 0) ||
                (userType === 2 && details.etat === "4") ? (
                  (testEtape === true && questionnaire.length !==0) ? (
                    <Button
                      className="btn-fill pull-right"
                      type="button"
                      variant="info"
                      name="redac"
                      onClick={confirmMessageEnv}
                    >
                      Envoyer {userType === 1 ? "Vérificateur" : "Resposnable"}
                    </Button>
                  ) :  ""
                ) : (details.etat === "3" && userType === 1) ||
                  (userType === 2 && details.etat === "6") ? (
                  <Button
                    className="btn-fill pull-right"
                    type="button"
                    variant="info"
                    name="redac"
                    onClick={confirmMessageEnv}
                  >
                    Signature
                  </Button>
                ) :  ""}
                <br></br>
              </div>
            ) : (
              <Container fluid className="page404">
                <div>En cours de rédaction</div>
              </Container>
            )}
          </Container>
        </div>
      </Container>
    </>
  );
}

export default DetailRedaction;
