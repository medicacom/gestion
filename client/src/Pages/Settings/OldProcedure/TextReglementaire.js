import { Card, Form, Container, Row, Col } from "react-bootstrap";
import React, { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { CardBody } from "reactstrap";
import { fetchVigueur } from "../../../Redux/vigueurReduce";
import { saveVigueurDoc } from "../../../Redux/userDocumentReduce";
import Select from "react-select";

const TextReglementaire = React.forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const [vigueurSelect, setVigueurSelect] = React.useState([]);
  const [optionVigueur, setOptionVigueur] = React.useState([
    {
      value: "",
      label: "Vigueur",
      isDisabled: true,
    },
  ]);
  const [textError, setTextError] = React.useState(null);
  const isValidated = () => {
    var test = true;
    var idDoc = localStorage.getItem("doc");
    if(vigueurSelect.length ===0){
      test = false;
      setTextError(<small className="text-danger">Text reglementaire est obligatoire.</small>)
    }
    else{
      setTextError(null)
    }
    if(test){
      dispatch(
        saveVigueurDoc({ idDocument: idDoc, vigueur: vigueurSelect })
      );
      return true;        
    } else {
      return false;
    }
  };
  React.useImperativeHandle(ref, () => ({
    isValidated: () => {
      return isValidated();
    },
  }));

  const getVigueur = useCallback(
    async () => {
      var user = await dispatch(fetchVigueur());

      var entities = user.payload;
      var arrayOption = [];
      entities.forEach((e) => {
        arrayOption.push({ value: e.id, label: e.titre });
      });
      setOptionVigueur(arrayOption);
      return arrayOption;
    },
    [dispatch]
  );

  useEffect(() => {
    getVigueur();
  }, [getVigueur]);


  return (
    <Container fluid>
      <Card>
        <CardBody>
          <div className="App">
            <Row>
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
                    }}
                    options={optionVigueur}
                  />
                </Form.Group>
              </Col>
            </Row>
            {textError}
          </div>
        </CardBody>
      </Card>
    </Container>
  );
});

export default TextReglementaire;
