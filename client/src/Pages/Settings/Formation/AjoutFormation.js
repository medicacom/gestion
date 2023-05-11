import { Button, Card, Form, Container, Row, Col } from "react-bootstrap";
import React, { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { CardBody } from "reactstrap";
import { formationAdded, saveFiche, addInvite } from "../../../Redux/formationReduce";
import { fetchService } from "../../../Redux/serviceReduce";
import { getRefByService } from "../../../Redux/referenceReduce";
import { getActiveUser,getResponsable } from "../../../Redux/usersReduce";
import Select from "react-select";
import NotificationAlert from "react-notification-alert";
import { verification } from "../../../Redux/usersReduce";

// core components
function ListeFormation({obj}) {
  const dispatch = useDispatch();
  const notificationAlertRef = React.useRef(null);
  var idRole = obj.user.id_role;
  var idService = obj.user.id_service;

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
  const [sujet, setSujet] = React.useState("");
  const [date, setDate] = React.useState(null);
  const [heurD, setHeurD] = React.useState(null);
  const [heurF, setHeurF] = React.useState(null);
  const [service, setService] = React.useState(null);
  const [invite, setInvite] = React.useState([]);
  const [fiche, setFiche] = React.useState("");
  const [optionService, setOptionService] = React.useState([
    {
      value: "",
      label: "Service",
      isDisabled: true,
    },
  ]);
  const [reference, setReference] = React.useState("");
  const [optionReference, setOptionReference] = React.useState([
    {
      value: "",
      label: "Reference",
      isDisabled: true,
    },
  ]); 
  const [optionInvite, setOptionInvite] = React.useState([
    {
      value: "",
      label: "Invité",
      isDisabled: true,
    },
  ]);
  const [lieu, setLieu] = React.useState("");
  const [type, setType] = React.useState("");
  const [typeFormation, setTypeFormation] = React.useState("");
  const [optionType] = React.useState([
    {
      value: "",
      label: "Type",
      isDisabled: true,
    },
    {
      value: 1,
      label: "Présentiel",
    },
    {
      value: 2,
      label: "Webinaire",
    },
  ]);
  const [optionTypeFormation] = React.useState([
    {
      value: "",
      label: "Type Formation",
      isDisabled: true,
    },
    {
      value: 1,
      label: "TOT",
    },
    {
      value: 2,
      label: "Par service",
    },
  ]);
  const [etat] = React.useState({ value: 0, label: "Publiée" });
  const [formateur, setFormateur] = React.useState([]);
  const [optionFormateur, setOptionFormateur] = React.useState([
    {
      value: "",
      label: "Formateur",
      isDisabled: true,
    },
  ]);

  //get all service
  const getService = useCallback(
    async (p) => {
      var service = await dispatch(fetchService());
      var entities = service.payload;
      var arrayOption = [];

      entities.forEach((e) => {
        if (p === 0) arrayOption.push({ value: e.id, label: e.nom });
        else if (p === e.id) arrayOption.push({ value: e.id, label: e.nom });
      });
      if (idRole === 7) setService(arrayOption[0]);
      setOptionService(arrayOption);
      return arrayOption;
    },
    [dispatch, idRole]
  );

  //get reference by service
  const getReference = useCallback(
    async (idServie) => {
      var service = await dispatch(getRefByService(idServie));
      var entities = service.payload;
      var arrayOption = [];
      entities.forEach((e) => {
        arrayOption.push({
          value: e.id,
          label: e.reference,
          idDoc: e.id_document,
        });
      });
      setOptionReference(arrayOption);
      return arrayOption;
    },
    [dispatch]
  );

  //get responsable by role
  const getInvite = useCallback(
    async (role) => {
      var invi = await dispatch(getResponsable(role));
      var entities = invi.payload;
      var arrayOption = [];
      entities.forEach((e) => {
        arrayOption.push({ value: e.id, label: e.nom_prenom });
      });
      setOptionInvite(arrayOption);
      return arrayOption;
    },
    [dispatch]
  );

  //get active user (etat=1)
  const getFormateur = useCallback(async () => {
    var service = await dispatch(getActiveUser());
    var entities = service.payload;
    var arrayOption = [];
    entities.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.nom_prenom });
    });
    setOptionFormateur(arrayOption);
    return true;
  }, [dispatch]);

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
    var p = 0;
    if (idRole === 7) {
      p = idService;
    }
    getService(p);
    getInvite(7)
    getFormateur()
  }, [getService, idRole, idService,getInvite,getFormateur,verifToken]);

  function submitForm() {
    if (
      date !== null &&
      heurD !== null &&
      heurF !== null &&
      etat !== "" &&
      (service !== null || invite !== "") &&
      reference !== "" &&
      type !== "" &&
      lieu !== "" &&
      sujet !== "" &&
      formateur.length >0
    ) {
      var fileVal = null;
      if (fiche) {
        const fileArray = new FormData();
        fileArray.append("file", fiche);
        fileArray.append("name", fiche.name);
        fileVal = fiche.name;
        dispatch(saveFiche({ fileArray }));
      }
      notify("tr", "Insertion avec succés", "success");

      dispatch(formationAdded({date,heurD,heurF,etat,service,reference,sujet,type,lieu,formateur,fileVal,typeFormation}) ).then((e) => {
        
        if(invite.length>0)
          dispatch(addInvite({invite:invite,id:e.payload.id}))
      })

      setTimeout(() => {
        window.location.replace("/listeFormation");
      }, 1000);
    } else notify("tr", "Vérifier vos données", "danger");
  }
  return (
    <>
      <Container fluid>
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <Card>
          <CardBody>
            <Row>
              <Col className="pr-1" md="6">
                <Form.Group>
                  <label>Type Formation* </label>
                  <Select
                    className="react-select primary"
                    placeholder="Type Formation"
                    classNamePrefix="react-select"
                    value={typeFormation}
                    onChange={(value) => {
                      setTypeFormation(value);
                      getReference(null);
                    }}
                    options={optionTypeFormation}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col className="pr-1" md="6">
                <Form.Group>
                  <label>Formateur* </label>
                  <Select
                    isMulti
                    className="react-select primary"
                    classNamePrefix="react-select"
                    placeholder="Formateur"
                    value={formateur}
                    onChange={(value) => {
                      setFormateur(value);
                    }}
                    options={optionFormateur}
                  />
                </Form.Group>
              </Col>
              {typeFormation.value === 2 ? (
                <Col className="pr-1" md="6">
                  <Form.Group>
                    <label>Service* </label>
                    <Select
                      className="react-select primary"
                      classNamePrefix="react-select"
                      placeholder="Service"
                      value={service}
                      onChange={(value) => {
                        setService(value);                     
                        getReference(value.value);
                      }}
                      options={optionService}
                    />
                  </Form.Group>
                </Col>
              ) : (typeFormation.value === 1 && idRole !== 7) ? (
                <Col className="pl-1" md="6">
                  <Form.Group>
                    <label>Invité* </label>
                    <Select
                      isMulti
                      className="react-select primary"
                      classNamePrefix="react-select"
                      placeholder="Invité"
                      value={invite}
                      onChange={(value) => {
                        setInvite(value);
                      }}
                      options={optionInvite}
                    />
                  </Form.Group>
                </Col>
              ) : ""}
            </Row>        
            <Row>
              <Col className="pr-1" md="6">
                <Form.Group>
                  <label>Date* </label>
                  <Form.Control
                    placeholder="Date"
                    name="Date"
                    defaultValue={date}
                    className="required"
                    type="date"
                    onChange={(value) => {
                      setDate(value.target.value);
                    }}
                  ></Form.Control>
                </Form.Group>
                <div className="error"></div>
              </Col>
              <Col className="pl-1" md="6">
                <Form.Group>
                  <label>Document* </label>
                  <Select
                    placeholder="Document"
                    className="react-select primary"
                    classNamePrefix="react-select"
                    value={reference}
                    onChange={(value) => {
                      setReference(value);
                    }}
                    options={optionReference}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col className="pr-1" md="6">
                <label>Heur Début* </label>
                <Form.Control
                  placeholder="Heur Début"
                  name="Date"
                  defaultValue={heurD}
                  className="required"
                  type="time"
                  onChange={(value) => {
                    setHeurD(value.target.value);
                  }}
                ></Form.Control>
              </Col>
              <Col className="pl-1" md="6">
                <label>Heur fin* </label>
                <Form.Control
                  placeholder="Heur fin"
                  name="Date"
                  defaultValue={heurF}
                  className="required"
                  type="time"
                  onChange={(value) => {
                    setHeurF(value.target.value);
                  }}
                ></Form.Control>
              </Col>
            </Row>
            <Row>
              <Col className="pr-1" md="6">
                <Form.Group>
                  <label>Type * </label>
                  <Select
                    placeholder="Type"
                    className="react-select primary"
                    classNamePrefix="react-select"
                    value={type}
                    onChange={(value) => {
                      setType(value);
                    }}
                    options={optionType}
                  />
                </Form.Group>
              </Col>
              <Col className="pl-1" md="6">
                <label>Lieu * </label>
                <Form.Control
                  placeholder="Lieu"
                  name="Lieu"
                  defaultValue={lieu}
                  className="required"
                  type="text"
                  onChange={(value) => {
                    setLieu(value.target.value);
                  }}
                ></Form.Control>
              </Col>
            </Row>
            <Row>
              <Col className="pr-1" md="6">
                <Form.Group>
                  <label>Sujet* </label>
                  <Form.Control
                    placeholder="Sujet"
                    name="Sujet"
                    defaultValue={sujet}
                    className="required"
                    type="text"
                    onChange={(value) => {
                      setSujet(value.target.value);
                    }}
                  ></Form.Control>
                </Form.Group>
                <div className="error"></div>
              </Col>
              <Col className="pl-1" md="6">
                <Form.Group>
                  <label>Fiche de présence </label>
                  <Form.Control
                    className="required"
                    type="file"
                    onChange={(value) => {
                      setFiche(value.target.files[0]);
                    }}
                  ></Form.Control>
                </Form.Group>
                <div className="error"></div>
              </Col>
            </Row>
            <br></br>
            <br></br>
            <Button
              className="btn-fill pull-right"
              type="button"
              variant="info"
              onClick={submitForm}
            >
              Enregistrer
            </Button>
          </CardBody>
        </Card>
      </Container>
    </>
  );
}

export default ListeFormation;
