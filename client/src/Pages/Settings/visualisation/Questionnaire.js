import React, {  } from "react";
import {
  Form} from "react-bootstrap";
// react-bootstrap components

function Questionnaire({ question,setReponse,reponse }) {
  function Reponse(){
    var array = [<h2 key={"h2"}>Questionnaire</h2>];
    question.forEach((val,key1)=>{
      var a = [];
      var rep = val.reponse;
      for (const key in rep) {
        a.push(
          <Form.Check className="form-check-radio" key={"check"+key}>
              <Form.Check.Label>
                  <Form.Check.Input
                  id={"valide_"+key1}
                  name={"valide_"+key1}
                  type="radio"
                  onClick={(val1)=>{
                    var list = reponse;
                    list[key1] =rep[key].id ;
                    setReponse(list)
                  }}
                  ></Form.Check.Input>
                  <span className="form-check-sign"></span>
                  {rep[key].reponse}
              </Form.Check.Label>
          </Form.Check>)
      }
      array.push(<h3 key={"h1"+key1}> {key1+1}) {val.question}</h3>)
      array.push(a);
      array.push(<hr key={"hr"+key1}></hr>)
    })
    return array;
  }
  return (
    <>
      <div className="questionUser">
        <Reponse></Reponse>
      </div>
    </>
  );
}

export default Questionnaire;
