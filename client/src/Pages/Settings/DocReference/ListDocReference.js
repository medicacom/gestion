import NotificationAlert from "react-notification-alert";
import SweetAlert from "react-bootstrap-sweetalert";
import ReactTable from "../../../components/ReactTable/ReactTable.js";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import React,{useEffect,useCallback} from "react";
import { allVigueurRole,vigueurDeleted,getFileText, vigueurGetById } from "../../../Redux/vigueurReduce";
import { useDispatch } from "react-redux";
import { verification } from "../../../Redux/usersReduce";



// core components
function ListDocReference({obj}) {
  const dispatch = useDispatch();  
  var idRole = obj.user.id_role;
  const [entities, setEntities] = React.useState([]);
  const notificationAlertRef = React.useRef(null);
  const [alert, setAlert] = React.useState(null);
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
  const confirmMessage = (id,e) => {
    setAlert(
      <SweetAlert
        style={{ display: "block", marginTop: "-100px" }}
        title="Vous éte sure de supprimer ?"
        onConfirm={() => deleteVigueur(id,e)}
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
  const hideAlert = () => {
    setAlert(null);
  };
  function ajouter() {
    window.location.href = "/ajouterDocReference";
  }
  function deleteVigueur(id,e) {
    dispatch(vigueurDeleted({ id }));
    document
      .getElementById(e.target.id)
      .parentElement.parentElement.parentElement.remove();
      hideAlert()
    notify("tr", "Type de document supprimer avec succes", "success");
  }

  /* const getFiles = useCallback(async (file,key) => {
      var f = await dispatch(getFileText(file));
      var res = f.payload;
      return res;
    },
    [dispatch]
  ); */

  const detailsDemande = (id) => {
    const promise = new Promise((resolve) => {
      setTimeout(async () => {
        var action = await dispatch(vigueurGetById(id));
        var demande = action.payload;
        var fileVal ="";
        if(demande.file !==""){  
          var file = await dispatch(getFileText(demande.file));
          fileVal=file.payload
        }
        resolve({demande:demande,file:fileVal});
      }, 0);
    });

    promise.then(async (value) => {
      var pop_up = await value.demande;
      setAlert(
        <SweetAlert
          title={pop_up.titre}
          style={{ display: "block", marginTop: "-100px" }}
          onConfirm={() => hideAlert()}
          onCancel={() => hideAlert()}
          confirmBtnBsStyle="info"
        >
          <Row>
            <Col md="12">
              Titre : {pop_up.titre}
              <br></br>
            </Col>
            <Col md="12">
              Service responsable : {pop_up.roles.nom}
              <br></br>
            </Col>
            <Col md="12">
              {value.file !==""?
                <a download rel="noreferrer" href={value.file} className="fileUrl" target='_blank'>
                  <i className="fas fa-file"></i><br></br>Consulter
                </a>
              :""}
            </Col>
          </Row>
        </SweetAlert>
      );
    });
  };
  const getEntities = useCallback(async () => {
    var response = await dispatch(allVigueurRole(idRole));
      var res = response.payload;
      setEntities(res)
      /* 
      var array=[];
      res.forEach((e,key)=>{
        const promise = new Promise((resolve, reject) => {
          setTimeout(async () => {
              var r = await getFiles(e.file);
              resolve(r);
             
          }, 0);
        });
        promise.then((value) => {
          array.push({
            id:e.id,
            titre:e.titre,
            reference:e.reference,
            arborescence:e.arborescence,
            id_role:e.id_role,
            file:value
          })
          if((key+1) === res.length){       
            setEntities(array);  
          }
        }) 
      })  */
      
    },
    [dispatch,idRole]
  );

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
    getEntities()
  }, [getEntities,verifToken])
  return (
    <>
      {alert}
      <Container fluid>
        <div className="rna-container">
          <NotificationAlert ref={notificationAlertRef} />
        </div>
        <Row>
          <Col md="12">
            {idRole===8?
            <Button
              id="saveBL"
              className="btn-wd btn-outline mr-1 float-left"
              type="button"
              variant="info"
              onClick={ajouter}
            >
              <span className="btn-label">
                <i className="fas fa-plus"></i>
              </span>
              Ajouter un référence en document
            </Button>:""}
          </Col>
          <Col md="12">
            <h4 className="title">Liste des références des documents règlementaires</h4>
            <Card className="card-header">
              <Card.Body>
                <ReactTable
                  data={entities}
                  columns={[
                    {
                      Header: "Titre",
                      accessor: "titre",
                    },
                    {
                      Header: "Référence",
                      accessor: "reference",
                    },
                    {
                      Header: "Arborescence",
                      accessor: "arborescence",
                    },
                    {
                      Header: "Fichier",
                      accessor: "file",
                      Cell: ({ cell }) =>  
                      (         
                        <div className="block_action">
                          
                          <Button
                            id={"idLigne_" + cell.row.values.id}
                            onClick={(e) => {
                              detailsDemande(cell.row.values.id);
                            }}
                            className="btn btn-info"
                          >
                            <i className="fa fa-eye mr-1" id={"idLigne_" + cell.row.values.id}/>Détails
                          </Button>
                          {/* <a
                            rel="noreferrer"                          
                            href={cell.row.values.file}
                            target="_blank"
                          >
                            <i className="fas fa-file"></i>
                            Consulter
                          </a> */}
                        </div>
                      )
                    },
                    {
                      Header: "actions",
                      accessor: "id",
                      Cell: ({ cell }) => (
                        <div className="actions-right block_action">
                          {cell.row.original.id_role  === idRole?
                            <Button
                              onClick={() => {
                                window.location.replace(
                                  "/docReference/update/" + cell.row.values.id
                                );
                              }}
                              variant="warning"
                              size="sm"
                              className="text-warning btn-link edit"
                            >
                              <i className="fa fa-edit" />
                            </Button>
                          :""}
                          {idRole  === 8?
                          <Button
                            id={"idLigne_" + cell.row.values.id}
                            onClick={(e) => {
                              confirmMessage(cell.row.values.id,e);
                            }}
                            variant="danger"
                            size="sm"
                            className="text-danger btn-link delete"
                          >
                            <i className="fa fa-trash" id={"idLigne_" + cell.row.values.id}/>
                          </Button>
                          :""}
                        </div>)
                    },
                  ]} 
                  className="-striped -highlight primary-pagination"
                />
                {entities.length === 0 ? (
                  <div className="text-center">Aucun donnée trouvé</div>
                ) : (
                  ""
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ListDocReference;
