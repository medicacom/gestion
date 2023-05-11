import { Card, Form, Container, Row, Col } from "react-bootstrap";
import React, { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { CardBody } from "reactstrap";
import {
  addFormationOld,
  saveFiche,
  addInvite,
} from "../../../Redux/formationReduce";
import { getActiveUser, getResponsable } from "../../../Redux/usersReduce";
import Select from "react-select";
import NotificationAlert from "react-notification-alert";
import { generatePdfSign } from "../../../Redux/documentReduce";

const Formation = React.forwardRef((props, ref) => {
  var serv = localStorage.getItem("service");
  var serSplit = serv ?serv.split("@@"):null;
  var serObj = serv ?{ value: parseInt(serSplit[0]), label: serSplit[1] }:null;
  const dispatch = useDispatch();
  var idRole = 7;
  const notificationAlertRef = React.useRef(null);
  const [sujet, setSujet] = React.useState("");
  const [date, setDate] = React.useState(null);
  const [heurD, setHeurD] = React.useState(null);
  const [heurF, setHeurF] = React.useState(null);
  const [service, setService] = React.useState(serObj);
  const [invite, setInvite] = React.useState([]);
  const [fiche, setFiche] = React.useState("");
  const [optionService] = React.useState([serObj]);
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
  const [etat] = React.useState({ value: 1, label: "Publiée" });
  const [formateur, setFormateur] = React.useState([]);
  const [optionFormateur, setOptionFormateur] = React.useState([
    {
      value: "",
      label: "Formateur",
      isDisabled: true,
    },
  ]);
  const isValidated = () => {
    var idRef = localStorage.getItem("idRef");
    var idDoc = localStorage.getItem("doc");
    var nomRef = localStorage.getItem("ref");
    var idApp = localStorage.getItem("idApp");
    var reference = { value: parseInt(idRef), label: nomRef,idDoc: parseInt(idDoc)}
    var serv = localStorage.getItem("service");
    var serSplit = serv ?serv.split("@@"):null;
    var service = { value: serSplit[0], label: serSplit[1]}
    var fileVal = null;
    if (fiche) {
      const fileArray = new FormData();
      fileArray.append("file", fiche);
      fileArray.append("name", fiche.name);
      fileVal = fiche.name;
      dispatch(saveFiche({ fileArray }));
    }

    dispatch(addFormationOld({date,heurD,heurF,etat,service,reference,sujet,type,lieu,formateur,fileVal,typeFormation}) ).then((e) => {
      
      dispatch(generatePdfSign( { idDoc,idApp }));
      if(invite.length>0)
        dispatch(addInvite({invite:invite,id:e.payload.id}))
    })
    return true;
  };
  React.useImperativeHandle(ref, () => ({
    isValidated: () => {
      return isValidated();
    },
  }));
  
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

  const getFormateur = useCallback(async () => {
    var forma = await dispatch(getActiveUser());
    var entities = forma.payload;
    var arrayOption = [];
    entities.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.nom_prenom });
    });
    setOptionFormateur(arrayOption);
    return true;
  }, [dispatch]);

  useEffect(() => {
    /* if(serSplit)
      setService({ value: serSplit[0], label: serSplit[1] }) */
    getInvite(7);
    getFormateur();
  }, [getInvite, getFormateur]);
  
  return (
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
                    }}
                    options={optionService}
                  />
                </Form.Group>
              </Col>
            ) : typeFormation.value === 1 && idRole !== 7 ? (
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
        </CardBody>
      </Card>
    </Container>
  );
});

export default Formation;
