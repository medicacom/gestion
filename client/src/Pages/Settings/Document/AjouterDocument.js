import React, { useEffect, useCallback } from "react";
import NotificationAlert from "react-notification-alert";
import Select from "react-select";
import { useParams } from "react-router-dom";

import ReactTable from "../../../components/ReactTable/ReactTable.js";
import SweetAlert from "react-bootstrap-sweetalert";
// react-bootstrap components
import { Button, Card, Form, Container, Row, Col } from "react-bootstrap";
import { documentGetById, identification, documentAdded, getUserDoc,  deleteUserDoc} from "../../../Redux/documentReduce";
import { getUserService } from "../../../Redux/usersReduce";
import { fetchType } from "../../../Redux/typeReduce";
import { useDispatch } from "react-redux";
import { demandeGetById,getFile } from "../../../Redux/demandeReduce";
import validator from "validator";

import { verification } from "../../../Redux/usersReduce";

function AjouterDocument({obj}) {  
  var idRole = obj.user.id_role;
  var mois = new Date().getMonth() + 1;
  var jour = new Date().getDate();
  if (mois < 10) mois = "0" + (new Date().getMonth() + 1);
  if (jour < 10) jour = "0" + new Date().getDate();
  const dateNow = new Date().getFullYear() + "-" + mois + "-" + jour;
  const dispatch = useDispatch();
  const location = useParams();
  const idDoc = location.idDoc;
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
  const [titre, setTitre] = React.useState(null);
  const [tableauR, setTableauR] = React.useState([]);
  const [tableauV, setTableauV] = React.useState([]);
  const [details, setDetails] = React.useState([]);
  const [fileDemande, setFileDemande] = React.useState([]);
  const [tabRedac, setTabRedac] = React.useState([]);
  const [tabValid, setTabValid] = React.useState([]);
  const [note, setNote] = React.useState(null);
  const [date, setDate] = React.useState([]);
  const [userVSelect, setUserVSelect] = React.useState([]);
  const [userRSelect, setUserRSelect] = React.useState([]);
  const [alert, setAlert] = React.useState(null);
  const [optionUser, setOptionUser] = React.useState([
    {
      value: "",
      label: "Utilisateur",
      isDisabled: true,
    },
  ]);
  const [typeSelect, setTypeSelect] = React.useState({
    value: null,
    label: "Type de document",
  });
  const [optionType, setOptionTypeDoc] = React.useState([
    {
      value: "",
      label: "Type de document",
      isDisabled: true,
    },
  ]);
  const hideAlert = () => {
    setAlert(null);
  };
  const notificationAlertRef = React.useRef(null);
  const confirmMessage = (id, e, type, nb) => {
    setAlert(
      <SweetAlert
        style={{ display: "block", marginTop: "-100px" }}
        title="Étes vous sure de supprimer ce utilisateur?"
        onConfirm={() => deleteUser(id, e, type, nb)}
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

  function deleteUser(id, e, type, nb) {
    switch (type) {
      case 1:
        if (tabRedac.length > 1) {
          tabRedac.splice(nb, 1);
          setTabRedac(tabRedac);
          tableauR.splice(nb, 1);
          setTableauR(tableauR);
          notify("tr", "Supprimer avec succes", "success");
          if (id != null) dispatch(deleteUserDoc({ id }));
        } else {
          notify("tr", "il faut contient au moins une ligne", "warning");
        }
        break;
      case 2:
        if (tabValid.length > 1) {
          tabValid.splice(nb, 1);
          setTabValid(tabValid);
          tableauV.splice(nb, 1);
          setTableauV(tableauV);
          notify("tr", "Supprimer avec succes", "success");
          if (id != null) dispatch(deleteUserDoc({ id }));
        } else {
          notify("tr", "il faut contient au moins une ligne", "warning");
        }
        break;
      default:
        break;
    }
    hideAlert();
  }

  function submitForm(event) {
    var typeDoc = typeSelect.value;
    var id_demande = location.id;
    var idService = location.idService;
    var required = document.getElementsByClassName("required");
    for (var i = 0; i < required.length + 1; i++) {
      if (required[i] !== undefined) {
        document.getElementsByClassName("error")[i].innerHTML = "";
        required[i].style.borderColor = "#ccc";
        //condition required
        if (validator.isEmpty(required[i].value)) {
          required[i].style.borderColor = "red";
          document.getElementsByClassName("error")[i].innerHTML =
            required[i].name + " est obligatoire";
          notify("tr", required[i].name + " doit etre non vide", "danger");
        }
      }
    }
    if (idRole === 2) {
      var typeClass = document.querySelector(
        "#typeClass .react-select__control"
      );
      typeClass.style.borderColor = "#ccc";

      var redacteurClass = document.querySelector(
        "#redacteurClass .react-select__control"
      );
      redacteurClass.style.borderColor = "#ccc";

      var verificateurClass = document.querySelector(
        "#verificateurClass .react-select__control"
      );
      verificateurClass.style.borderColor = "#ccc";

      if (typeDoc === null) {
        typeClass.style.borderColor = "red";
        notify("tr", "Choisire un type de document", "danger");
      }

      if (userRSelect.length === 0) {
        redacteurClass.style.borderColor = "red";
        notify("tr", "Choisire un ou plusieur rédacteurs", "danger");
      }

      if (userVSelect.length === 0) {
        verificateurClass.style.borderColor = "red";
        notify("tr", "Choisire un ou plusieur vérificateur", "danger");
      }
      dispatch(
        documentAdded({
          titre,
          userRSelect,
          userVSelect,
          typeDoc,
          note,
          idDoc,
          id_demande,
          idService,
        })
      ).then((data) => {
        var ch = "Création de document avec succès";
        switch (data.payload) {
          case 200:
            notify("tr", ch, "success");
            window.location.replace("/listCreationDocument");
            break;
          case 400:
            notify("tr", "Vérifier vos données", "danger");
            break;
          default:
            break;
        }
      });
    } else {
      var id = location.id;
      var test = true;
      tabRedac.map((e) => {
        if (e.date === null || e.idUser === null) {
          test = false;
          return false;
        }
        return true;
      });
      tabValid.map((e) => {
        if (e.date === null || e.idUser === null) {
          test = false;
          return false;
        }
        return true;
      });
      if (test)
        dispatch(
          identification({
            titre,
            tabRedac,
            tabValid,
            typeDoc,
            note,
            id_demande,
            id,
          })
        ).then((data) => {
          var ch = "Identification de document avec succès";
          switch (data.payload) {
            case 200:
              notify("tr", ch, "success");
              setTimeout(async () => {
                window.location.replace("/ListIdentDocument");
              }, 2000);
              break;
            case 400:
              notify("tr", "Vérifier vos données", "danger");
              break;
            default:
              break;
          }
        });
      else {
        notify("tr", "Vérifier vos données", "danger");
      }
    }
  }

  function listeDocument() {
    if (idRole === 2) window.location.replace("/listCreationDocument");
    else window.location.replace("/ListIdentDocument");
  }

  const getUser = useCallback(
    async (idService) => {
      var user = await dispatch(getUserService(idService));

      var entities = user.payload;
      var arrayOption = [];
      entities.forEach((e) => {
        arrayOption.push({ value: e.id, label: e.nom_prenom });
      });
      setOptionUser(arrayOption);
      return arrayOption;
    },
    [dispatch]
  );

  function AjoutLigne(event) {
    var list = [];
    if (event === "redac") {
      if (tabRedac.length > 0) list = [...tabRedac];
    } else {
      if (tabValid.length > 0) list = [...tabValid];
    }
    list[list.length] = {
      id: null,
      idUser: null,
      date: null,
      nom_prenom: null,
      nb: list.length,
    };
    if (event === "redac") setTabRedac(list);
    else setTabValid(list);
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
    async function getType(p) {
      var type = await dispatch(fetchType());
      var entities = type.payload;
      var arrayOption = [];
      entities.forEach((e) => {
        if (e.id === p) {
          setTypeSelect({ value: e.id, label: e.type });
        }
        arrayOption.push({ value: e.id, label: e.type });
      });
      setOptionTypeDoc(arrayOption);
    }
    async function getUserDocU() {
      const promise = new Promise((resolve, reject) => {
        setTimeout(async () => {
          var userDoc = await dispatch(getUserDoc(location.id));
          var entities = userDoc.payload;
          resolve({ entities });
        }, 0);
      });

      promise.then((value) => {
        var arrayV = [];
        var arrayR = [];
        var arrayDate = [];

        var entities = value.entities;
        var nbR = -1;
        var nbV = -1;
        entities.forEach((e) => {
          arrayDate[e.id] = "";
          setDate(arrayDate);

          if (e.type === 1) {
            nbR++;
            arrayR.push({
              id: e.id,
              idUser: e.id_user,
              date: null,
              nom_prenom: e.users.nom_prenom,
              nb: nbR,
            });
          } else {
            nbV++;
            arrayV.push({
              id: e.id,
              idUser: e.id_user,
              date: null,
              nom_prenom: e.users.nom_prenom,
              nb: nbV,
            });
          }
        });
        setTabValid(arrayV);
        setTabRedac(arrayR);
      });
    }
    const promise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        var detailBD = [];
        var file = ""
        if (idRole === 2){
          detailBD = await dispatch(demandeGetById(location.id));       
          var fileVal ="";
          if(detailBD.payload.file !==""){  
            file = await dispatch(getFile(detailBD.payload.file));
            fileVal=file.payload
          }
        }
        else detailBD = await dispatch(documentGetById(location.id));
        var entities = detailBD.payload;
        resolve({demande:entities,file:fileVal});
      }, 0);
    });

    promise.then((value) => {
      var ty = 0;
      if (typeof value.demande.id_service !== "undefined") {
        getUser(value.demande.id_service);
      } else {
        getUser(value.demande.demande.demandes.id_service);
      }

      if (idRole === 2) {
        setFileDemande(value.file);
        setDetails(value.demande.demande);
      } else {
        setNote(value.demande.note);
        setTitre(value.demande.titre);
        ty = value.demande.id_type;
      }
      getType(ty);
    });
    getUser();
    getUserDocU();
  }, [location.id, dispatch, getUser, idRole,verifToken]);

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
            {details.length !== 0 && idRole === 2 ? (
              <Card className="demande">
                <h3>Détails demande</h3>
                <hr />
                <Row>
                  <Col md="12">
                    Titre : {details.demandes.sujet}
                    <br></br>
                  </Col>
                  <Col md="12">
                    Besoin :
                    {details.demandes.besoin === 1 ? "Création" : "Révision"}
                    <br></br>
                  </Col>
                 
                  {details.demandes.besoin === 1 ? (
                    <Col md="12">
                      <Col md="12">
                        type de document : {details.demandes.type}
                        <br></br>
                      </Col>
                      <Col md="12">
                        Description : {details.demandes.descriptions}
                        <br></br>
                      </Col>
                    </Col>
                  ) : (
                    <Col md="12">
                      Titre de document : {details.demandes.documents.titre}
                      <br></br>
                    </Col>
                  )}
                  <Col md="12">
                    <br/>
                    {fileDemande !== "" ? (
                      <a
                        download
                        rel="noreferrer"
                        href={fileDemande}
                        target="_blank"
                      >
                        <i className="fas fa-file"></i>Fichier
                      </a>
                    )  : ""}
                  </Col>
                </Row>
              </Card>
            ) : (
              ""
            )}
            <Row>
              <Col md="12">
                <Form action="" className="form" method="">
                  <Card>
                    <Card.Header>
                      <Card.Header>
                        <Card.Title as="h4">
                          {idRole === 2
                            ? "Création d'un document"
                            : "identification d'un document"}
                        </Card.Title>
                      </Card.Header>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>Titre* </label>
                            <Form.Control
                              placeholder="Titre"
                              name="Titre"
                              defaultValue={titre}
                              className="required"
                              type="text"
                              onChange={(value) => {
                                setTitre(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                          <div className="error"></div>
                        </Col>
                        <Col className="pl-1" md="6">
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
                        </Col>
                      </Row>
                      <Row>
                        <Col className="pr-1" md="6">
                          <Form.Group id="typeClass">
                            <label>Type de document* </label>
                            <Select
                              className="react-select primary"
                              classNamePrefix="react-select"
                              value={typeSelect}
                              placeholder="Type de document"
                              onChange={(value) => {
                                setTypeSelect(value);
                                /* setTypeDoc(value.value); */
                              }}
                              options={optionType}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      {idRole === 2 ? (
                        <Row>
                          <Col className="pr-1" md="6">
                            <Form.Group id="redacteurClass">
                              <label>Rédacteur* </label>
                              <Select
                                isMulti
                                className="react-select primary"
                                classNamePrefix="react-select"
                                value={userRSelect}
                                placeholder="Rédacteur"
                                onChange={(value) => {
                                  setUserRSelect(value);
                                }}
                                options={optionUser}
                              />
                            </Form.Group>
                          </Col>
                          <Col className="pl-1" md="6">
                            <Form.Group id="verificateurClass">
                              <label>Vérificateur* </label>
                              <Select
                                isMulti
                                className="react-select primary"
                                classNamePrefix="react-select"
                                placeholder="Vérificateur"
                                value={userVSelect}
                                onChange={(value) => {
                                  setUserVSelect(value);
                                }}
                                options={optionUser}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      ) : (
                        <Row>
                          <Col>
                            <Card className="card-header">
                              <Card.Body>
                                <h3>Rédacteurs</h3>
                                <hr />

                                <ReactTable
                                  data={tabRedac}
                                  columns={[
                                    {
                                      Header: "Nom et prenom",
                                      accessor: "nom_prenom",
                                      Cell: ({ cell }) =>
                                        cell.row.values.nom_prenom !== null ? (
                                          cell.row.values.nom_prenom
                                        ) : (
                                          <Select
                                            className="react-select primary"
                                            classNamePrefix="react-select"
                                            placeholder="Nom et prenom"
                                            value={tableauR[cell.row.values.nb]}
                                            onChange={(v) => {
                                              var list = tableauR;
                                              list[cell.row.values.nb] = v;
                                              var listTest = tabRedac;
                                              listTest[
                                                cell.row.values.nb
                                              ].idUser = v.value;
                                              listTest[
                                                cell.row.values.nb
                                              ].nom_prenom = v.label;
                                              setTabRedac(listTest);
                                              setTableauR(list);
                                            }}
                                            options={optionUser}
                                          />
                                        ),
                                    },
                                    {
                                      Header: "Date",
                                      accessor: "date",
                                      Cell: ({ cell }) => (
                                        <Form.Group>
                                          <Form.Control
                                            className="inputTable "
                                            onChange={(dat) => {
                                              if (dat != null)
                                                date[cell.row.values.nb] =
                                                  dat.target.value;
                                              setDate(date);
                                              var list = tabRedac;
                                              list[cell.row.values.nb].date =
                                                dat.target.value;
                                              setTabRedac(list);
                                            }}
                                            name="date"
                                            id={"date_" + cell.row.values.nb}
                                            type="date"
                                            defaultValue={cell.row.values.date}
                                            min={dateNow}
                                          ></Form.Control>
                                        </Form.Group>
                                      ),
                                    },
                                    {
                                      Header: "Action",
                                      accessor: "nb",
                                      Cell: ({ cell }) => (
                                        <div className="actions-right block_action">
                                          <Button
                                            id={
                                              "idLigneR_" + cell.row.values.nb
                                            }
                                            onClick={(ev) => {
                                              confirmMessage(
                                                tabRedac[cell.row.values.nb].id,
                                                ev,
                                                1,
                                                cell.row.values.nb
                                              );
                                            }}
                                            variant="danger"
                                            size="sm"
                                            className="text-danger btn-link delete"
                                          >
                                            <i
                                              className="fa fa-trash"
                                              id={
                                                "idLigneR_" + cell.row.values.nb
                                              }
                                            />
                                          </Button>
                                        </div>
                                      ),
                                    },
                                  ]}
                                  className="-striped -highlight primary-pagination"
                                />
                                <br></br>
                                <Button
                                  className="btn-fill pull-left"
                                  type="button"
                                  variant="info"
                                  name="redac"
                                  onClick={(ev) => AjoutLigne("redac")}
                                >
                                  Ajouter
                                </Button>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col>
                            <Card className="card-header">
                              <Card.Body>
                                <h3>Vérificateur</h3>
                                <hr />

                                <ReactTable
                                  data={tabValid}
                                  columns={[
                                    {
                                      Header: "Nom et prenom",
                                      accessor: "nom_prenom",
                                      Cell: ({ cell }) =>
                                        cell.row.values.nom_prenom !== null ? (
                                          cell.row.values.nom_prenom
                                        ) : (
                                          <Select
                                            className="react-select primary"
                                            classNamePrefix="react-select"
                                            placeholder="Nom et prenom"
                                            value={tableauV[cell.row.values.nb]}
                                            onChange={(v) => {
                                              var list = tableauV;
                                              list[cell.row.values.nb] = v;
                                              var listTest = tabValid;
                                              listTest[
                                                cell.row.values.nb
                                              ].idUser = v.value;
                                              listTest[
                                                cell.row.values.nb
                                              ].nom_prenom = v.label;
                                              setTabValid(listTest);
                                              setTableauV(list);
                                            }}
                                            options={optionUser}
                                          />
                                        ),
                                    },
                                    {
                                      Header: "Date",
                                      accessor: "date",
                                      Cell: ({ cell }) => (
                                        <Form.Group>
                                          <Form.Control
                                            className="inputTable "
                                            onChange={(dat) => {
                                              if (dat != null)
                                                date[cell.row.values.nb] =
                                                  dat.target.value;
                                              setDate(date);
                                              var list = tabValid;
                                              list[cell.row.values.nb].date =
                                                dat.target.value;
                                              setTabValid(list);
                                            }}
                                            name="date"
                                            id={"date_" + cell.row.values.nb}
                                            type="date"
                                            defaultValue={cell.row.values.date}
                                            min={dateNow}
                                          ></Form.Control>
                                        </Form.Group>
                                      ),
                                    },
                                    {
                                      Header: "Action",
                                      accessor: "nb",
                                      Cell: ({ cell }) => (
                                        <div className="actions-right block_action">
                                          <Button
                                            id={
                                              "idLigneV_" + cell.row.values.nb
                                            }
                                            onClick={(ev) => {
                                              confirmMessage(
                                                tabValid[cell.row.values.nb].id,
                                                ev,
                                                2,
                                                cell.row.values.nb
                                              );
                                            }}
                                            variant="danger"
                                            size="sm"
                                            className="text-danger btn-link delete"
                                          >
                                            <i
                                              className="fa fa-trash"
                                              id={
                                                "idLigneV_" + cell.row.values.nb
                                              }
                                            />
                                          </Button>
                                        </div>
                                      ),
                                    },
                                  ]}
                                  className="-striped -highlight primary-pagination"
                                />
                                <br></br>

                                <Button
                                  className="btn-fill pull-left"
                                  type="button"
                                  variant="info"
                                  name="verif"
                                  onClick={(ev) => AjoutLigne("verif")}
                                >
                                  Ajouter
                                </Button>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>
                      )}
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

export default AjouterDocument;
