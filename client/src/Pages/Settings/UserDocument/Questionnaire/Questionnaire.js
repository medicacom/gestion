import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Form, Row, Col } from "react-bootstrap";
// react-bootstrap components
import ReactTable from "../../../../components/ReactTable/ReactTable.js";
import SweetAlert from "react-bootstrap-sweetalert";
import NotificationAlert from "react-notification-alert";
import Select from "react-select";

function Questionnaire({
  setQuestionnaire,
  array,
  type,
  typeUser,
  setReponse,
  reponse,
  details,
  typeQuestion
}) {
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
  const location = useParams();
  const [entities, setEntities] = useState([]);
  const [questionSelect, setQuestionSelect] = React.useState([]);
  const [option] = useState([
    {
      value: "",
      label: "Type",
      isDisabled: true,
    },
    {
      value: 0,
      label: "Avant vidéo",
    },
    {
      value: 1,
      label: "Aprés vidéo",
    },
  ]);

  const [alert, setAlert] = React.useState(null);
  function AjoutReponse(id) {
    var list = [...entities];
    if (list.length !== 0) {
      list[id].reponse.push({
        reponse: null,
        valide: null,
      });
      setEntities(list);
      setQuestionnaire(list);
    }
  }
  function AjoutQuestion() {
    var list = [...entities];
    var list1 = [...questionSelect];
    list[list.length] = {
      id: null,
      question: null,
      type:0,
      id_document: location.id,
      reponse: [],
    };
    list1[list1.length]= null;
    setQuestionSelect(list1);
    setEntities(list);
    setQuestionnaire(list);
  }
  useEffect(() => {
    setEntities(array);
    setQuestionSelect(typeQuestion)
  }, [array,typeQuestion]);
  const hideAlert = () => {
    setAlert(null);
  };
  const confirmMessage = (id, key) => {
    setAlert(
      <SweetAlert
        style={{ display: "block", marginTop: "-100px" }}
        title="Étes vous sure de supprimer cette reponse?"
        onConfirm={() => deleteReponse(id, key)}
        onCancel={() => hideAlert()}
        confirmBtnBsStyle="info"
        cancelBtnBsStyle="danger"
        confirmBtnText="Oui"
        cancelBtnText="Non"
        showCancel
      ></SweetAlert>
    );
  };

  function deleteReponse(id, key) {
    var filteredQ = entities.filter(function (value, index, arr) {
      return index === id;
    });
    var filteredR = filteredQ[0].reponse.filter(function (value, index, arr) {
      return index !== parseInt(key);
    });
    var newList = entities;
    newList[id].reponse = filteredR;
    setEntities(newList);
    notify("tr", "Supprimer avec succes", "success");
    hideAlert();
  }
  const confirmRemove = (key) => {
    setAlert(
      <SweetAlert
        style={{ display: "block", marginTop: "-100px" }}
        title="Étes vous sure de supprimer cette question?"
        onConfirm={() => deleteQuestion(key)}
        onCancel={() => hideAlert()}
        confirmBtnBsStyle="info"
        cancelBtnBsStyle="danger"
        confirmBtnText="Oui"
        cancelBtnText="Non"
        showCancel
      ></SweetAlert>
    );
  };

  function deleteQuestion(key) {
    if (entities.length > 1) {
      entities.splice(key, 1);
      setEntities(entities);
      notify("tr", "Supprimer avec succes", "success");
    } else {
      notify("tr", "il faut contient au moins une question", "warning");
    }
    hideAlert();
  }

  return (
    <>
      <div>
        {alert}
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        {parseInt(type) === 1 && parseInt(details.etat) <= 3 ? (
          <Button
            className="btn-fill pull-left btn-question"
            type="button"
            variant="danger"
            name="redac"
            onClick={() => AjoutQuestion()}
          >
            <i className="fa fa-plus mr-2"></i>Ajouter question
          </Button>
        ) : (
          ""
        )}
        <br></br>
        {entities.map((val, key) => {
          return (
            <div key={"table" + key} className="table-question">
              <h3>
                Question N°{key + 1}
                {parseInt(type) === 1 && parseInt(details.etat) <= 3 ? (
                  <div className="pull-right">
                    <Button
                      className="btn-fill pull-right"
                      type="button"
                      variant="info"
                      name="redac"
                      onClick={() => AjoutReponse(key)}
                    >
                      <i className="fa fa-plus mr-2"></i>Ajouter Reponse
                    </Button>
                  </div>
                ) : (
                  ""
                )}
              </h3>
              <Form.Group>
                {/* 2- input disabled ***** 1- input enabled */}
                <br></br>
                <Row>
                  <Col md="4">
                    <Form.Control
                      readOnly={parseInt(type) === 1 ? false : true}
                      defaultValue={val.question}
                      placeholder="Question"
                      type="text"
                      onChange={(val1) => {
                        var list = entities;
                        var question = list[key];
                        question.question = val1.target.value;
                        setEntities(list);
                      }}
                    ></Form.Control>
                  </Col>
                  <Col md="4">
                    {parseInt(type) === 1?
                      <Select
                        placeholder="etape"
                        className="react-select primary"
                        classNamePrefix="react-select"
                        value={questionSelect[key]}
                        onChange={(val1) => {
                          var list = [...questionSelect];
                          list[key] = val1;
                          setQuestionSelect(list);
                          
                          
                          var list1 = entities;
                          var question = list1[key];
                          question.type = val1.value;
                          setEntities(list1);
                        }}
                        options={option}
                      />
                    :
                    <Form.Control
                      readOnly={true}
                      defaultValue={val.type === 0?"Avant vidéo":"Aprés vidéo"}
                    ></Form.Control>}
                  </Col>
                  <Col md="4">
                    {parseInt(type) === 1 && parseInt(details.etat) <= 3 ? (
                      <Button
                        className="btn-fill pull-right"
                        type="button"
                        variant="danger"
                        name="redac"
                        onClick={() => confirmRemove(key)}
                      >
                        <i className="fa fa-trash mr-2"></i>Supprimer question
                      </Button>
                    ) : ""}
                  </Col>
                </Row>
              </Form.Group>
              <ReactTable
                data={val.reponse}
                columns={[
                  {
                    Header: "Reponse",
                    accessor: "reponse",
                    filterable: false,
                    Cell: ({ cell }) => (
                      <div>
                        {/* 2- input disabled ***** 1- input enabled */}
                        <Form.Group>
                          <Form.Control
                            readOnly={parseInt(type) === 1 ? false : true}
                            defaultValue={cell.row.values.reponse}
                            placeholder="reponse"
                            type="text"
                            onChange={(val1) => {
                              var list = entities;
                              var question = list[key];
                              var rep = val.reponse[cell.row.id];
                              rep.reponse = val1.target.value;
                              question.reponse[cell.row.id] = rep;
                              list[key] = question;
                              setEntities(list);
                            }}
                          ></Form.Control>
                        </Form.Group>
                      </div>
                    ),
                  },
                  {
                    Header: "valide",
                    accessor: "valide",
                    Cell: ({ cell }) => (
                      <div>
                        {parseInt(type) === 1 || parseInt(type) === 3 ? (
                          <div>
                            <Form.Check className="form-check-radio pull-left">
                              {/* 1- checkbox disabled **** 2- checkbox enabled */}
                              <Form.Check.Label>
                                <Form.Check.Input
                                  /* disabled={(parseInt(type) === 1 || parseInt(type) === 3)?false:true} */
                                  defaultChecked={
                                    parseInt(cell.row.values.valide) === 1 &&
                                    parseInt(typeUser) === 1
                                      ? true
                                      : false
                                  }
                                  value="1"
                                  id={
                                    "valide_" + cell.row.id + "_" + key + "_1"
                                  }
                                  name={"valide_" + cell.row.id + "_" + key}
                                  type="radio"
                                  onClick={(val1) => {
                                    var list = [];
                                    if (parseInt(typeUser) === 1) {
                                      list = entities;
                                      var question = list[key];
                                      var rep = val.reponse[cell.row.id];
                                      rep.valide = val1.target.value;
                                      question.reponse[cell.row.id] = rep;
                                      list[key] = question;
                                      setEntities(list);
                                    } else {
                                      list = reponse;
                                      list.forEach((e11) => {
                                        if (e11.id === cell.row.original.id)
                                          e11.valide = parseInt(
                                            val1.target.value
                                          );
                                      });
                                      setReponse(list);
                                    }
                                  }}
                                ></Form.Check.Input>
                                <span className="form-check-sign"></span>
                                Faux
                              </Form.Check.Label>
                            </Form.Check>
                            <Form.Check className="form-check-radio pull-left">
                              <Form.Check.Label>
                                <Form.Check.Input
                                  /* disabled={(parseInt(type) === 1 || parseInt(type) === 3)?false:true} */
                                  defaultChecked={
                                    parseInt(cell.row.values.valide) === 2 &&
                                    parseInt(typeUser) === 1
                                      ? true
                                      : false
                                  }
                                  value="2"
                                  id={
                                    "valide_" + cell.row.id + "_" + key + "_2"
                                  }
                                  name={"valide_" + cell.row.id + "_" + key}
                                  type="radio"
                                  onClick={(val1) => {
                                    var list = [];
                                    if (parseInt(typeUser) === 1) {
                                      list = entities;
                                      var question = list[key];
                                      var rep = val.reponse[cell.row.id];
                                      rep.valide = val1.target.value;
                                      question.reponse[cell.row.id] = rep;
                                      list[key] = question;
                                      setEntities(list);
                                    } else {
                                      list = reponse;
                                      list.forEach((e11) => {
                                        if (e11.id === cell.row.original.id)
                                          e11.valide = parseInt(
                                            val1.target.value
                                          );
                                      });
                                      setReponse(list);
                                    }
                                  }}
                                ></Form.Check.Input>
                                <span className="form-check-sign"></span>
                                Vrai
                              </Form.Check.Label>
                            </Form.Check>
                          </div>
                        ) : parseInt(cell.row.values.valide) === 1 ? (
                          "Faux"
                        ) : (
                          "Vrai"
                        )}
                      </div>
                    ),
                  },
                  {
                    Header: "Action",
                    accessor: "id",
                    Cell: ({ cell }) =>
                      parseInt(type) === 1 && parseInt(details.etat) <= 3 ? (
                        <div className="actions-right block_action">
                          <Button
                            id={"idLigneR_" + cell.row.id}
                            onClick={(ev) => {
                              confirmMessage(key, cell.row.id);
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
              <hr />
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Questionnaire;
