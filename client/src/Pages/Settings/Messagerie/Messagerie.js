import { Container, Row, Col, Nav, Tab, Button, Form } from "react-bootstrap";
import React, { useEffect, useCallback,useState } from "react";
import { useDispatch } from "react-redux";

import { getDocument } from "../../../Redux/documentReduce";
import { getUserDocByIdDoc } from "../../../Redux/userDocumentReduce";
import { getMessage, addMessage } from "../../../Redux/messagerieReduce";
import ReactPaginate from 'react-paginate';
import { verification } from "../../../Redux/usersReduce";

// core components
function Messagerie({users}) {
  document.title = "Messagerie";
  const dispatch = useDispatch();  
  var idUser = users.id;
  var idService = users.id_service;
  var role = users.roles.nom;
  var idRole = users.roles.id;
  var idDocs = localStorage.getItem("idDoc");
  var titreDoc = localStorage.getItem("titreDoc");
  const [blockMsg, setBlockMsg] = React.useState([]);
  const [item, setItems] = React.useState([]);
  const [doc, setDoc] = React.useState([]);
  const [message, setMessage] = React.useState({
    text: null,
    type: null,
    idUser: idUser,
    idDocument: null,
  });
  const content = useCallback(
    async (idDoc, titre1,test) => {
      message.idDocument = idDoc;
      //verifiction type user
      if (idRole === 3 || idRole === 2) {
        message.type = role;
      } else {
        var response = await dispatch(getUserDocByIdDoc({ idDoc, idUser }));
        var userDoc = response.payload;
        var type = "";
        if (userDoc.length !== 0) {

          type = userDoc[0].type === 1 ? "Rédacteur" : "Vérificateur";
          message.type = type;
        }
      }
      setMessage(message);
      var arrayMsg = [];
      var msgShow = await dispatch(getMessage({ idDoc }));
      var entities = msgShow.payload;
      if (entities.length > 0) {
        entities.forEach((ms) => {
          var date = new Date(ms.createdAt)
            .toISOString()
            .slice(0, 16)
            .replace("T", " à ");
          arrayMsg.push(
            <div key={"msgbody" + ms.id}>
              <span className="discutions">
                <i className="nc-icon nc-stre-right"></i> {ms.users.nom_prenom}(
                {ms.type}) : {ms.text}
                <span className="discutions-date"> {date}</span>
              </span>
              <hr></hr>
            </div>
          );
        });
      } else {
        arrayMsg.push(
          <div key={"msgbody"}>
            <span className="discutions">Aucun message</span>
            <hr></hr>
          </div>
        );
      }
      if(test) document.getElementById("doc-tabs-tab-document-"+idDoc).click()
      setBlockMsg(arrayMsg);
    },
    [dispatch, idUser, message, role, idRole]
  );
  const submitForm = useCallback(async (titre) => {
    if (message.text !== "") {
      dispatch(addMessage(message)).then(val=>{
        content(message.idDocument,titre,false)
      })
    }
  }, [dispatch, message,content]);
  function enterKeyPressed(event) {
    if (event.charCode === 13) {
      submitForm();
      return true;
    } else {
      return false;
    }
  }

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
    const promise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        var response = await dispatch(
          getDocument({ idUser, idService, idRole })
        );
        resolve(response.payload);
      }, 0);
    });

    promise.then((value) => {
      var documentUser = [];
      var array= []
      if (idRole === 2 || idRole === 3) {
        setDoc(value);
        value.forEach((e) => {
          array.push({id:e.id,titre:e.titre})
        });
      }
      else {
        value.forEach((e) => {
          documentUser.push(e.documents);
          array.push({id:e.id_document,titre:e.documents.titre})
        });
        setDoc(documentUser);
      }
      setItems(array);
      if (idDocs !== null) {
        content(idDocs, titreDoc,true);
      } else if (value.length > 0) {
        if (idRole === 2 || idRole === 3) content(value[0].id, value[0].titre,true);
        else content(value[0].id_document, value[0].documents.titre,true);
      }
    });
  }, [dispatch, idService, content, idRole, idUser, idDocs, titreDoc,verifToken]);

  function NavTabDoc(props) {
    var nav = [];
    if (doc.length > 0) {
      doc.forEach((val) => {
          nav.push(
            <Tab.Pane key={"tab-" + val.id} eventKey={"document-" + val.id}>
              <div className="panel panel-default" key={val.titre}>
                <div className="panel-heading">{val.titre}</div>
                <div className="panel-body" key={"msgtop" + val.id}>
                {blockMsg}
                </div>
                <Form.Group className="input-msg">
                  <Form.Control
                    autoFocus
                    onKeyPress={enterKeyPressed}
                    placeholder="Message"
                    id={"message" + val.id}
                    type="text"
                    onChange={(e) => {
                      message.text = e.target.value;
                      setMessage(message);
                    }}
                  ></Form.Control>
                  <Button
                    className=""
                    type="button"
                    variant="info"
                    onClick={(val)=>{submitForm(val.titre);}}
                  >
                    <i className="nc-icon nc-send"></i>
                  </Button>
                  <div className="clear"></div>
                </Form.Group>
              </div>
            </Tab.Pane>
          );
      });
    }
    return nav;
  }
  function Items({ currentItems }) {
    return (
      <>
        {currentItems &&
          currentItems.map((item) => (
            <Nav.Item
              key={"document-" + item.id}
              onClick={(event) => {
                content(item.id, item.titre,false);
              }}
            >
              <Nav.Link
                key={"documentt-" + item.id}
                eventKey={"document-" + item.id}
              >
                {item.titre}
              </Nav.Link>
            </Nav.Item>
          ))}
      </>
    );
  }
  //PaginatedItems
  function PaginatedItems({ itemsPerPage,length }) {
    // We start with an empty list of items.
    const [currentItems, setCurrentItems] = useState(null);
    const [pageCount, setPageCount] = useState(0);
    // Here we use item offsets; we could also use page offsets
    // following the API or data you're working with.
    const [itemOffset, setItemOffset] = useState(0);
  
    useEffect(() => {
      // Fetch items from another resources.
      const endOffset = itemOffset + itemsPerPage;
      setCurrentItems(item.slice(itemOffset, endOffset));
      setPageCount(Math.ceil(item.length / itemsPerPage));
    }, [itemOffset, itemsPerPage]);
  
    // Invoke when user click to request another page.
    const handlePageClick = (event) => {
      const newOffset = (event.selected * itemsPerPage) % item.length;
      setItemOffset(newOffset);
    };return (
      <>
       <Items currentItems={currentItems} /> 
        {length>8?
        <ReactPaginate
          breakLabel="..."
          nextLabel=" >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          pageCount={pageCount}
          previousLabel="< "
          renderOnZeroPageCount={null}
          breakClassName="page-item"
          breakLinkClassName="page-link"
          containerClassName="pagination"
          activeClassName="active"
        />:""}
      </>
    );
  }
  return (
    <>
      <Container fluid className="messagerie">

        <h1 className="title text-center">Messagerie</h1>
        <br></br>
        <Row>
          <Col md="12">
            <Row>
              {doc.length > 0 ? (
                <Tab.Container
                  id="doc-tabs"
                  defaultActiveKey={"document-" + doc[0].id}
                >
                  <Col md="3">
                    <Nav role="tablist" variant="tabs">
                      {/* <NavTabDoc type="item" />  */}    
                       <PaginatedItems itemsPerPage={8} length={doc.length} />
                    </Nav>
                  </Col>

                  <Col md="9">
                    <Tab.Content>
                      <NavTabDoc type="Pane" />
                    </Tab.Content>
                  </Col>
                </Tab.Container>
              ) : (
                ""
              )}
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Messagerie;
