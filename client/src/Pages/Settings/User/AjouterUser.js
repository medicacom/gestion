import React, { useEffect,useCallback } from "react";
import NotificationAlert from "react-notification-alert";
import Select from "react-select";
import validator from "validator";
// react-bootstrap components
import { Button, Card, Form, Container, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { userAdded, userGetById,userSignature,getTypeUser,getFile } from "../../../Redux/usersReduce";
import { fetchType } from "../../../Redux/typeReduce";
import { fetchRole } from "../../../Redux/roleReduce";
import { fetchService } from "../../../Redux/serviceReduce";
import { useDispatch } from "react-redux";
import Dropzone from "react-dropzone";
import { verification } from "../../../Redux/usersReduce";
function AjouterUser() {

  const dispatch = useDispatch();
  const location = useParams();
  //input
  const [nom, setNom] = React.useState("");
  const [tel, setTel] = React.useState("");
  const [service, setService] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState(0);
  const [id, setId] = React.useState(0);
  const [signature, setSignature] = React.useState("");
  const [signatureUrl, setSignatureUrl] = React.useState("");
  //required
  const [nomRequired] = React.useState(true);
  const [emailRequired] = React.useState(true);
  const [loginRequired] = React.useState(true);
  const [passwordRequired] = React.useState(true);
  const [roleRequired] = React.useState(true);
  const [serviceRequired] = React.useState(true);
  const etat = 1;
  const notificationAlertRef = React.useRef(null);
  const [optionService, setOptionService] = React.useState([
    {
      value: "",
      label: "Service",
      isDisabled: true,
    },
  ]);
  const [options, setOptions] = React.useState([
    {
      value: "",
      label: "Role",
      isDisabled: true,
    },
  ]);
  const [roleSelect, setRoleSelect] = React.useState({
    value: 0,
    label: "Role",
  });
  const [serviceSelect, setServiceSelect] = React.useState({
    value: 0,
    label: "Service",
  });
  
  const [optionsType, setOptionsType] = React.useState([
    {
      value: "",
      label: "Type",
      isDisabled: true,
    },
  ]);
  const [typeSelect, setTypeSelect] = React.useState(null);
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
  async function submitForm(event) {
    var required = document.getElementsByClassName("required");
    var testPassword = true;
    for (var i = 0; i < required.length+1; i++) {  
      if(required[i] !== undefined){
        document.getElementsByClassName("error")[i].innerHTML=""; 
        required[i].style.borderColor = "#ccc"; 
        //condition required      
        if (validator.isEmpty(required[i].value) &&   required[i].name !=="Password" ) {
          required[i].style.borderColor = "red";
          document.getElementsByClassName("error")[i].innerHTML=required[i].name+" est obligatoire";
          notify("tr", required[i].name + " doit etre non vide", "danger");     
        } 
        //condition email
        else if(required[i].name ==="Email" && !validator.isEmail(required[i].value)){
          notify("tr", "E-mail invalide", "danger");
          document.getElementsByClassName("error")[i].innerHTML="E-mail invalide";
        }
        //condition password
        else if( (required[i].name ==="Password" && isNaN(location.id) === true) ||
        (required[i].name ==="Password" && !validator.isEmpty(required[i].value) && isNaN(location.id) === false) ){
          if (!validator.isLength(required[i].value,{min:6, max: 20})) {
            testPassword = false;
            notify("tr", "Password doit etre minimum 6 charactére", "danger");
            document.getElementsByClassName("error")[i].innerHTML="Password doit etre minimum 6 charactére";
          }
        }
      }
    } 
    var roleClass = document.querySelector("#roleClass .react-select__control");
    roleClass.style.borderColor = "#ccc";  
    var serviceClass = document.querySelector("#serviceClass .react-select__control");
    serviceClass.style.borderColor = "#ccc";       
    if(role === 0){
      roleClass.style.borderColor = "red"; 
      notify("tr", "Choisire un role", "danger");
    }
    if(service === 0){
      serviceClass.style.borderColor = "red"; 
      notify("tr", "Choisire un service", "danger");
    }
    var sign='';
    if(signature!==""){
      const signatureArray = new FormData();
      if(typeof signature!=="string"){
        signatureArray.append("signature", signature);
        signatureArray.append("signaturename", signature.name);
      }
      dispatch(userSignature({signatureArray})).then(e=>{
        sign= (typeof signature!=="string")? e.payload.filename:signature;
        if (!validator.isEmpty(nom) && !validator.isEmpty(login) && testPassword === true  &&
          (role >0) && (service >0)) {
          
            dispatch(userAdded({ nom, email, tel, login, password, id, etat, role,service,sign,typeSelect })).then(data=>{
              var ch = "";
              (isNaN(location.id) === true)?ch="Insertion avec succès":ch="Modifier avec succès"
              switch(data.payload){
                case 200 : notify("tr", ch, "success");break;
                case 400 : notify("tr", "Vérifier vos données", "danger");break;
                case 403 : notify("tr", "Login déjà existe", "danger");break;
                default:break;
              }
            });   
        }
      })
    } else {
      notify("tr", "Signature est obligatoire", "danger");
    }
  }
  const getType = useCallback(async (p) =>{  
    var entitiesUser =[];
    var typeUser= null;
    if (isNaN(location.id) === false) {
     typeUser = await dispatch(getTypeUser(location.id));  
     entitiesUser = typeUser.payload;}
    var type = await dispatch(fetchType());  
    var entities = type.payload;
    var arrayOption = [];
    var select = [];
    entities.forEach((e) => {
      arrayOption.push({ value: e.id, label: e.type });
      if(entitiesUser.length>0)
        entitiesUser.forEach(x => {
          if(x.id_type === e.id)
            select.push({ value: e.id, label: e.type })
        })
    });
    setTypeSelect(select);
    setOptionsType(arrayOption);
  }, [dispatch,location.id])

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
    async function getRole(p) {
      var role = await dispatch(fetchRole());
      var entities = role.payload;
      var arrayOption = [];
      arrayOption.push({ value: 0, label: "Role" });
      entities.forEach((e) => {
        arrayOption.push({ value: e.id, label: e.nom });
        if (e.id === p) {
          setRoleSelect({ value: e.id, label: e.nom });
        }
      });
      setOptions(arrayOption);
    }
    async function getService(p) {
      var service = await dispatch(fetchService());
      var entities= service.payload;
      var arrayOption = [];
      arrayOption.push({ value: 0, label: "Service" });
      entities.forEach((e) => {
        arrayOption.push({ value: e.id, label: e.nom });
        if (e.id === p) {
          setServiceSelect({ value: e.id, label: e.nom });
        }
      });
      setOptionService(arrayOption);
    }
    const promise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        if (isNaN(location.id) === false) {
          var user = await dispatch(userGetById(location.id));
          var entities = user.payload;
          setNom(entities.nom_prenom);
          setEmail(entities.email);
          setLogin(entities.login);
          setTel(entities.tel);
          setRole(entities.id_role);
          setService(entities.id_service);
          setId(location.id);
          var sign = await dispatch(getFile(entities.signature));
          setSignatureUrl(sign.payload)
          setSignature(entities.signature)
          resolve(entities);
        } else {
          resolve(0);
        }
      }, 0);
    });

    promise.then((value) => {
      var roles=0;
      var services=0;
      if(value !== 0) {
        roles=value.id_role;
        services=value.id_service; 
        if(value.id_role===5)getType(value.id_type); 
      }
     
      getRole(roles); 
      getService(services);
    });
   
  }, [location.id,dispatch,verifToken,getType]);

  function listeUser() {
    window.location.replace("/utilisateurListe");
  }  

  const uploadSignature= (acceptedFiles) => {
    setSignature(acceptedFiles[0]);
    setSignatureUrl(URL.createObjectURL(acceptedFiles[0]));
  }
  return (
    <>
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
                  onClick={listeUser}
                >
                  <span className="btn-label">
                    <i className="fas fa-list"></i>
                  </span>
                  Retour à la liste
                </Button>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <Form action="" className="form" method="">
                  <Card>
                    <Card.Header>
                      <Card.Header>
                        <Card.Title as="h4">
                          {typeof location.id == "undefined"
                            ? "Ajouter utilisateur"
                            : "Modifier utilisateur"}
                        </Card.Title>
                      </Card.Header>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>Nom et Prenom* </label>
                            <Form.Control
                              defaultValue={nom}
                              placeholder="Nom"
                              name="Nom"
                              className="required"
                              type="text"
                              onChange={(value) => {
                                setNom(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                          <div className="error"></div>
                          {nomRequired ? null : (
                            <label className="error">
                              Nom est obligatoire.
                            </label>
                          )}
                        </Col>
                        <Col className="pl-1" md="6">
                          <Form.Group>
                            <label>Password* </label>
                            <Form.Control
                              defaultValue={password}
                              placeholder="Password"
                              className="required"
                              name="Password"
                              type="password"
                              onChange={(value) => {
                                setPassword(value.target.value);
                              }}
                            ></Form.Control>
                            <div className="error"></div>
                            {passwordRequired ? null : (
                              <label className="error">
                                Password est obligatoire.
                              </label>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>Login* </label>
                            <Form.Control
                              defaultValue={login}
                              placeholder="Login"
                              className="required"
                              name="Login"
                              type="text"
                              onChange={(value) => {
                                setLogin(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                          <div className="error"></div>
                          {loginRequired ? null : (
                            <label className="error">
                              Login est obligatoire.
                            </label>
                          )}
                        </Col>
                        <Col className="pl-1" md="6">
                          <Form.Group>
                            <label>Téléphone </label>
                            <Form.Control
                              defaultValue={tel}
                              placeholder="Téléphone"
                              type="number"
                              onChange={(value) => {
                                setTel(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col className="pr-1" md="6">
                          <Form.Group>
                            <label>E-mail </label>
                            <Form.Control
                              defaultValue={email}
                              placeholder="E-mail"
                              type="text"
                              onChange={(value) => {
                                setEmail(value.target.value);
                              }}
                            ></Form.Control>
                          </Form.Group>
                        </Col>
                        <Col className="pl-1" md="6">
                          <Form.Group id="roleClass">
                            <label>Role* </label>
                            <Select
                              placeholder="Role"
                              className="react-select primary"
                              classNamePrefix="react-select"
                              value={roleSelect}
                              onChange={(value) => {
                                setRoleSelect(value);
                                setRole(value.value);
                                if(value.value === 5)
                                getType(0)
                              }}
                              options={options}
                            />
                          </Form.Group>
                          {roleRequired ? null : (
                            <div className="error">
                              Role est obligatoire.
                            </div>
                          )}
                        </Col>
                        {role===5?
                        <Col className="pr-1" md="6">
                          <Form.Group id="roleClass">
                            <label>Type Document </label>
                            <Select
                              placeholder="Type document"
                              isMulti
                              className="react-select primary"
                              classNamePrefix="react-select"
                              value={typeSelect}
                              onChange={(value) => {
                                setTypeSelect(value);
                              }}
                              options={optionsType}
                            />
                          </Form.Group>
                        </Col>:""}
                      </Row>
                      <Row>
                        <Col className="pr-1" md="6">
                          <div className="App">
                            <Dropzone onDrop={uploadSignature} accept="image/*">
                              {({ getRootProps, getInputProps }) => (
                                <div
                                  {...getRootProps({
                                    className: "dropzone",
                                  })}
                                >
                                  <input {...getInputProps()} />
                                  <p>
                                    {signatureUrl !== "" ? 
                                      <img src={signatureUrl} alt="signature" className="imgUpload" />:
                                      "Il y a aucun signature selectionner"} 
                                  </p>
                                  <p>Choisissez un signature</p>
                                </div>
                              )}
                            </Dropzone>
                          </div>
                        </Col>
                        <Col className="pl-1" md="6">
                          <Form.Group id="serviceClass">
                            <label>Service* </label>
                            <Select
                              placeholder="Service"
                              className="react-select primary"
                              classNamePrefix="react-select"
                              value={serviceSelect}
                              onChange={(value) => {
                                setServiceSelect(value);
                                setService(value.value);
                              }}
                              options={optionService}
                            />
                          </Form.Group>
                          {serviceRequired ? null : (
                            <div className="error">
                              Service est obligatoire.
                            </div>
                          )}
                        </Col>
                      </Row>
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

export default AjouterUser;
