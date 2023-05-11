import React, { useCallback, useEffect } from "react";
/* import { Row, Col, FormGroup, FormControl, FormLabel } from "react-bootstrap"; */
import { Form, Row, Col } from "react-bootstrap";
import Select from "react-select";
import { fetchType } from "../../../Redux/typeReduce";
import { useDispatch } from "react-redux";
import { getActiveUser } from "../../../Redux/usersReduce";
import { fetchService } from "../../../Redux/serviceReduce";
import { addDocumentOld } from "../../../Redux/documentReduce";
import { addReferenceOld,referenceFile } from "../../../Redux/referenceReduce";

const Document = React.forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const [titre, setTitre] = React.useState("");
  const [save, setSave] = React.useState(false);
  const [reference, setReference] = React.useState("");
  const [fileFinale, setFileFinale] = React.useState("");
  const [note, setNote] = React.useState("");
  const [userVSelect] = React.useState([]);
  const [userRSelect] = React.useState([]);
  /* const [userVSelect, setUserVSelect] = React.useState([]);
  const [userRSelect, setUserRSelect] = React.useState([]); */
  const [titreError, setTitreError] = React.useState(null);
  const [typeError, setTypeError] = React.useState(null);
  /* const [redError, setRedError] = React.useState(null);
  const [verifError, setVerifError] = React.useState(null); */
  const [serviceError, setServiceError] = React.useState(null);
  const [fileError, setFileError] = React.useState(null);

  const [typeSelect, setTypeSelect] = React.useState(null);

  const [serviceSelect, setServiceSelect] = React.useState(null);

  const [responsable, setResponsable] = React.useState(null);

  const [optionType, setOptionTypeDoc] = React.useState([
    {
      value: "",
      label: "Type de document",
      isDisabled: true,
    },
  ]);

  const [optionUser, setOptionUser] = React.useState([
    {
      value: "",
      label: "Utilisateur",
      isDisabled: true,
    },
  ]);
  
  const [optionService, setOptionService] = React.useState([
    {
      value: "",
      label: "Service",
      isDisabled: true,
    },
  ]);
  
  const [optionRQ, setOptionRQ] = React.useState([
    {
      value: "",
      label: "Responsable qualité",
      isDisabled: true,
    },
  ]);

  const isValidated = () => {
    var testTitre = true;
    var testType = true;
    var testRed = true;
    var testVerif = true;
    var testService = true;
    var testFile = true;

    if (titre === "") {
      testTitre = false;
      setTitreError(<small className="text-danger">Titre est obligatoire.</small>);
    } else {
      setTitreError(null)
    }    

    if (typeSelect === null) {
      testType = false;
      setTypeError(<small className="text-danger">Type est obligatoire.</small>)
    } else {
      setTypeError(null)
    } 
    
    /* if (userRSelect.length === 0) {
      testRed = false;
      setRedError(<small className="text-danger">Redacteur est obligatoire.</small>)
    } else {
      setRedError(null)
    }

    if (userVSelect.length === 0) {
      testVerif = false;
      setVerifError(<small className="text-danger">Vérificateur est obligatoire.</small>)
    } else {
      setVerifError(null)
    } */

    if (serviceSelect === null) {
      testService = false;
      setServiceError(<small className="text-danger">Service est obligatoire.</small>)
    } else {
      setServiceError(null)
    }

    if (!fileFinale) {
      testFile = false;
      setFileError(<small className="text-danger">File est obligatoire.</small>)
    } else {
      setFileError(null)
    }

    if(testTitre && testType && testRed && testVerif && testService && testFile && !save){
      var idService =serviceSelect.value;
      dispatch(addDocumentOld({titre,userRSelect,userVSelect,typeSelect,note,idService})
      ).then(val=>{
        var type=val.payload.id_type;
        var idDocument=val.payload.id;
        var idUser=responsable.value;
        var fileVal = "";
        const fileArray = new FormData();
        fileArray.append("file", fileFinale);
        fileArray.append("name", fileFinale.name);
        fileVal = fileFinale.name;
        dispatch(referenceFile({ fileArray }));
        dispatch(addReferenceOld({reference,fileVal,idDocument,idUser,type})).then(val1=>{
          localStorage.setItem("idRef",val1.payload.id);
        });
        setSave(true)
        localStorage.setItem("doc",val.payload.id);
      })
      return true;
    } else if(save) {
      return true;
    }
    else {
      return false;
    }
  };
  React.useImperativeHandle(ref, () => ({
    isValidated: () => {
      return isValidated();
    },
  }));

  //getType
  const getType = useCallback(async () => {
    var type = await dispatch(fetchType());
    var entities = type.payload;
    var arrayOption = [];
    entities.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.type });
    });
    setOptionTypeDoc(arrayOption);
  }, [dispatch]);

  //getUser
  const getUser = useCallback(
    async () => {
      var user = await dispatch(getActiveUser());
      var entities = user.payload;
      var arrayOption = [];
      entities.forEach((e) => {
        arrayOption.push({ value: e.id, label: e.nom_prenom, idService:e.id_service,idRole:e.id_role });
      });
      setOptionUser(arrayOption);
    },
    [dispatch]
  );

  //getUser
  const getService = useCallback(
    async () => {
      var user = await dispatch(fetchService());
      var entities = user.payload;
      var arrayOption = [];
      entities.forEach((e) => {
        arrayOption.push({ value: e.id, label: e.nom });
      });
      setOptionService(arrayOption);
    },
    [dispatch]
  );

  useEffect(() => {
    getUser();
    getType();
    getService();
    localStorage.removeItem("idRef")
    localStorage.removeItem("doc")
    localStorage.removeItem("ref")
    localStorage.removeItem("idApp")
    localStorage.removeItem("service")
  }, [getType,getUser,getService]);

  function getResposnable(service,users){
    var filtered = users.filter(function(value, index, arr){
      if((value.idRole === 5 && value.idService===service)){
        localStorage.setItem("idApp",value.value)
      }
      return (value.idRole===3 && value.idService===service);
    });
    setOptionRQ(filtered)
    setResponsable(null)
  }
  return (
    <div className="wizard-step" ref={ref}>
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
          {titreError}
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
              }}
              options={optionType}
            />
          </Form.Group>
          {typeError}
        </Col>
        <Col className="pl-1" md="6">
          <Form.Group id="verificateurClass">
            <label>Service* </label>
            <Select
              className="react-select primary"
              classNamePrefix="react-select"
              placeholder="Service"
              value={serviceSelect}
              onChange={(value) => {
                localStorage.setItem("service",value.value+"@@"+value.label)
                setServiceSelect(value);
                getResposnable(value.value,optionUser);
              }}
              options={optionService}
            />
          </Form.Group>
          {serviceError}
        </Col>
      </Row>
      {/* <Row>
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
          {redError}
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
          {verifError}
        </Col>
      </Row> */}
      <Row>
        <Col className="pr-1" md="6">
          <Form.Group id="redacteurClass">
            <label>Responsable qualité* </label>
            <Select
              className="react-select primary"
              classNamePrefix="react-select"
              value={responsable}
              placeholder="Rédacteur"
              onChange={(value) => {
                setResponsable(value);
              }}
              options={optionRQ}
            />
          </Form.Group>
          {/* {redError} */}
        </Col>
      </Row>
      <Row>
        <Col className="pr-1" md="6">
          <Form.Group>
            <label>Référence* </label>
            <Form.Control
              placeholder="Référence"
              name="Référence"
              defaultValue={reference}
              onChange={(value) => {
                localStorage.setItem("ref",value.target.value);
                setReference(value.target.value);
              }}
            ></Form.Control>
          </Form.Group>
        </Col>
        <Col className="pr-1" md="6">
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
            {fileError}
          </Form.Group>
        </Col>
        
      </Row>
    </div>
  );
});

export default Document;
