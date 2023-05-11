import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { Button, Container, Card, Row, Col,Form } from "react-bootstrap";
import React, { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { CardBody } from "reactstrap";
import { allFormation,  formationChangeEtat, getFormateur,getFile,saveFiche } from "../../../Redux/formationReduce";
import SweetAlert from "react-bootstrap-sweetalert";
import NotificationAlert from "react-notification-alert";
import { verification } from "../../../Redux/usersReduce";
require("moment/locale/fr.js");
// core components
function ListeFormation({obj}) {
  const localizer = momentLocalizer(moment);
  const [events, setEvents] = React.useState([]);
  const [alert, setAlert] = React.useState(null);
  const notificationAlertRef = React.useRef(null);
  const dispatch = useDispatch();
  var idRole = obj.user.id_role;
  var idServie = obj.user.id_service;
  var idUser = obj.user.id;
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
  const getCalendar = useCallback(async () => {
    var event = await dispatch(allFormation({ idRole, idServie,idUser }));
    var entities = event.payload;
    var array = [];
    if (entities.length > 0)
      entities.forEach((e) => {
        var date = new Date(e.date);
        var hd = e.heurD.split(":");
        var hf = e.heurF.split(":");
        var service = e.id_service !==null?e.services.nom:"";
        array.push({
          title: e.sujet,
          id: e.id,
          lieu: e.lieu,
          type: e.type,
          etat: e.etat,
          redacteur: e.redacteur,
          formateur: e.formateur,
          fiche: e.fiche,
          references: e.referencedocs.reference,
          services: service,
          date:
            date.getDate() +
            "/" +
            (date.getMonth() + 1) +
            "/" +
            date.getFullYear(),
          heurD: hd[0] + ":" + hd[1],
          heurF: hf[0] + ":" + hf[1],
          start: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            hd[0],
            hd[1],
            0
          ),
          end: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            hf[0],
            hf[1],
            0
          ),
          color: "green",
        });
      });
    setEvents(array);
    return array;
  }, [dispatch, idRole, idServie,idUser]);

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
    localStorage.removeItem("testFile");
    getCalendar();
  }, [getCalendar,verifToken]);
  const hideAlert = () => {
    localStorage.removeItem("testFile");
    setAlert(null);
  };
  const publierFormation = useCallback(async (id) => {
    var f = localStorage.getItem("testFile");
    if(f ==="1"){
      notify("tr", "Formation publiée", "success");
      dispatch(formationChangeEtat({ id }));
      hideAlert();    
      setTimeout(() => {
        window.location.reload()
      }, 1000);
    }
    else {      
      notify("tr", "Merci d'inserer fiche de présence", "danger");
    }
  }, [dispatch]);
  const saveFile = useCallback(async (file,id) => {
    if(file){
      const fileArray = new FormData();
      fileArray.append("file", file);
      fileArray.append("name", file.name);  
      fileArray.append("idFormation", id);   
      dispatch(saveFiche({ fileArray }));
    }
  }, [dispatch]);
  const addNewEventAlert = useCallback(async (pop_up) => {
    localStorage.setItem("testFile",0)
    var id = pop_up.id;
    var fiche = pop_up.fiche;
    var fileUrl = "";
    var formateur = await dispatch(getFormateur( id ));
    var entities = await formateur.payload; 
    if(fiche !==null){
      var f = await dispatch(getFile(fiche));
      fileUrl = await f.payload; 
    }
    setAlert(
      <SweetAlert
        style={{ display: "block", marginTop: "-100px" }}
        title={"Détail formation le " + pop_up.date}
        onConfirm={(e) => hideAlert()}
        confirmBtnText="Fermer"
        confirmBtnBsStyle="danger"
      >
        <Row>
          <Col md="12">
            Sujet: {pop_up.title}
            <br></br>
          </Col>
          <Col md="12">
            Réference document : {pop_up.references}
            <br></br>
          </Col>
          {pop_up.services !==""?
            <Col md="12">
              Service : {pop_up.services}
              <br></br>
            </Col>:""}
          
          <Col md="12">
            {entities.formateur}
            <br></br>
          </Col>
          <Col md="12">
            Heur début : {pop_up.heurD}
            <br></br>
          </Col>
          <Col md="12">
            Heur fin : {pop_up.heurF}
            <br></br>
          </Col>
          <Col md="12">
            Type : {pop_up.type === 1 ? "Présentiel" : "Webinaire"}
            <br></br>
          </Col>
          <Col md="12">
            Lieu : {pop_up.lieu}
            <br></br>
          </Col>
          <Col md="12">
            {((idRole === 4 || idRole === 7 ) || pop_up.etat ===1) ?fileUrl !== ''? 
              <a rel="noreferrer" href={fileUrl} target='_blank' download  className="fileUrl"><i className="fas fa-file"></i> <br></br>Fiche de présence</a>:""
            :""}
            {((idRole === 4 || idRole === 7) && pop_up.etat ===0)?    
              <Form.Group>  
                <br></br>
                <Form.Control
                  placeholder="Fichier"
                  type="file"
                  onChange={(value) => {
                    saveFile(value.target.files[0],id)
                    localStorage.setItem("testFile",1)
                  }}>

                </Form.Control>
              </Form.Group>:""}
          </Col>
          <Col md="12">
            <br></br>
            {pop_up.etat === 0 && idRole === 4 ? 
              <Button
                className="btn-fill"
                type="button"
                variant="info"
                onClick={() => publierFormation(pop_up.id)}
              >
                Publiée
              </Button> : ""}
          </Col>
        </Row>
        <br></br>
      </SweetAlert>
    );
  }, [dispatch,publierFormation,idRole,saveFile]);
  const MyCalendar = (props) => (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={(event) => addNewEventAlert(event)}
      />
    </div>
  );
  return (
    <>
      {alert}
      <Container>
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <Card className="calendar-header">
          <CardBody>
            {idRole === 4 || idRole === 7 ? (
              <Button
                className="btn-fill pull-right"
                type="button"
                variant="info"
                onClick={() => window.location.replace("/ajouterFormation")}
              >
                Ajouter formation
              </Button>
            ) : (
              ""
            )}
            <br></br>
            <br></br>
            <MyCalendar />
          </CardBody>
        </Card>
      </Container>
    </>
  );
}

export default ListeFormation;
