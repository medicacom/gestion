import React from "react";
// react component used to create charts
import SweetAlert from "react-bootstrap-sweetalert";
// react component that creates a form divided into multiple steps
import ReactWizard from "react-bootstrap-wizard";
// react-bootstrap components
import {
  Container,
  Row,
  Col,
} from "react-bootstrap";

import Document from "./Document.js";
import Questionaire from "./Questionaire.js";
import Video from "./Video";
import Formation from "./Formation.js";
import TextReglementaire from "./TextReglementaire";

const steps = [
  { stepName: "Document", component: Document },
  { stepName: "Questionnaire", component: Questionaire },
  { stepName: "Text reglementaire", component: TextReglementaire },
  { stepName: "Vidéo", component: Video },
  { stepName: "Formation", component: Formation },
];

//cette interface pour créer old document avec different steps
function OldProcedure() {
  const [alertState, setAlertState] = React.useState(false);
  return (
    <>
      <Container fluid>
        <Row>
          <Col className="ml-auto mr-auto" md="11">
            <ReactWizard
              
              steps={steps}
              navSteps
              title="Old procedure"
              /* description="Split a complicated flow in multiple steps" */
              headerTextCenter
              validate
              color="blue"
              previousButtonText="Back"
              nextButtonText="Next"
              finishButtonClasses="btn-info btn-wd"
              nextButtonClasses="btn-info btn-wd"
              previousButtonClasses="btn-wd hidden"
              finishButtonClick={() => {
                setAlertState(
                  <SweetAlert
                    success
                    style={{ display: "block", marginTop: "-100px" }}
                    title="Procedure terminer"
                    onConfirm={() => {
                      window.location.replace("listDocumentVigueur")
                      setAlertState(null)
                    }}
                    onCancel={() => setAlertState(null)}
                    confirmBtnBsStyle="info"
                  >
                  </SweetAlert>
                );
              }}
            />
          </Col>
        </Row>
      </Container>
      {alertState}
    </>
  );
}

export default OldProcedure;
