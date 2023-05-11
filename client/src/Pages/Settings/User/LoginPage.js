import { React, useState, useEffect, useRef } from "react";
import { loginFetch } from "../../../Redux/usersReduce";
import { useDispatch,useSelector } from "react-redux";

import NotificationAlert from "react-notification-alert";

// react-bootstrap components
import { Button, Card, Form, Container, Col } from "react-bootstrap";

function LoginPage() {
  localStorage.clear();
  const { entities } = useSelector((state) => state.settings);

  if(entities.length > 0){
    document.title = entities[0].name;

  }
  const dispatch = useDispatch();
  const [cardClasses, setCardClasses] = useState("card-hidden");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const notificationAlertRef = useRef({});
  const notify = (place, msg, type) => {
    var options = {};
    options = {
      place: place,
      message: (
        <div>
          <div>
            {msg}
          </div>
        </div>
      ),
      type: type,
      icon: "nc-icon nc-bell-55",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  };
  useEffect(() => {
    setTimeout(function () {
      setCardClasses("");
    }, 1000);
  });
  const submitForm = (event) => {
    const promise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        var root = await dispatch(
          loginFetch({ login: login, password: password })
        );
        var entities = root.payload;
        resolve(entities);
      }, 0);
    });

    promise.then((value) => {
      if(value.message !== true ){        
        notify("tr", value.message, "danger");
      } else {
        localStorage.setItem('x-access-token', value.token);
        window.location.replace("/profile");
      }
    });
  };
  function loginChange(event) {
    setLogin(event.target.value);
  }
  function passwordChange(event) {
    setPassword(event.target.value);
  }
  function enterKeyPressed(event) {
    if (event.charCode === 13) {
      submitForm();
      return true;
    } else {
      return false;
    }
  }
  return (
    <>
      <div className="full-page section-image" data-color="black">
        <div className="content d-flex align-items-center p-0">
          <Container>
            <div className="rna-container">
              <NotificationAlert ref={notificationAlertRef} />
            </div>
            <Col className="mx-auto" lg="4" md="8">
              <Form action="" className="form" method="" onSubmit={submitForm}>
                <Card className={"card-login " + cardClasses}>
                  { entities.length > 0?
                    <img src={require("../../../assets/img/"+entities[0].logo).default} alt="medicacom"/>:""
                  }
                  <Card.Header>
                    <h3 className="header text-center">Connexion</h3>
                  </Card.Header>
                  <Card.Body>
                    <Card.Body>
                      <Form.Group>
                        <label>Login</label>
                        <Form.Control
                          onKeyPress={enterKeyPressed}
                          placeholder="Login"
                          type="text"
                          onChange={loginChange}
                        ></Form.Control>
                      </Form.Group>
                      <Form.Group>
                        <label>Mot de passe</label>
                        <Form.Control
                          placeholder="Password"
                          onKeyPress={enterKeyPressed}
                          onChange={passwordChange}
                          type="password"
                        ></Form.Control>
                      </Form.Group>
                    </Card.Body>
                  </Card.Body>
                  <Card.Footer className="ml-auto mr-auto">
                    <Button
                      className="btn-wd"
                      type="button"
                      variant="info"
                      onClick={submitForm}
                    >
                      Connexion
                    </Button>
                  </Card.Footer>
                </Card>
              </Form>
            </Col>
          </Container>
        </div>
        <div
          className="full-page-background"
          style={{
            backgroundImage:
              "url(" +
              require("../../../assets/img/banner.jpg").default +
              ")",
          }}
        ></div>
      </div>
    </>
  );
}

export default LoginPage;
