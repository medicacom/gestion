import React, { useEffect, useState,useCallback } from "react";
import { useParams } from "react-router-dom";
import Timeline, {  TimelineHeaders,  SidebarHeader,  DateHeader} from "react-calendar-timeline";
import 'react-calendar-timeline/lib/Timeline.css';
import moment from 'moment';
import { useDispatch } from "react-redux";
import { getWorkflowById,documentGetById,getLifeCycleDoc } from "../../../Redux/documentReduce";
import {Chrono} from "react-chrono"
import {  Card, Container } from "react-bootstrap";
import { verification } from "../../../Redux/usersReduce";

//cette interface défini etat avancement du document
function Workflow() {
  
  const [line, setLine] = useState([]);
  const dispatch = useDispatch();
  const location = useParams();
  const idDoc=location.id;
  const groups = [{id: 1, title: 'Rédacteur'},{id: 2, title: 'Vérificateur'}]
  const [entities, setEntities] = useState([]);

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
          var response = await dispatch(getWorkflowById(idDoc));
          resolve(response.payload);
      }, 0);
    });

    promise.then((value) => {
      var items=[]
      value.forEach((e,k)=>{
        items.push({id: k, group: e.type, title: e.nom_prenom+" (Avencement"+e.etape+"%)", start_time: moment(e.date), end_time: moment(e.date).add(4, 'hour')})
      })
      setEntities(items);
    });
    const promiseCyle = new Promise((resolve, reject) => {
      setTimeout(async () => {
          var response = await dispatch(documentGetById(idDoc));
          var array=[];
          for (let i = -1; i <= parseInt(response.payload.etat); i++) {
            var service = response.payload.services.nom;
            var type = response.payload.types.type;
            var date = response.payload.createdAt;
            var life = await dispatch(getLifeCycleDoc({i,service,date,type,idDoc}));
            array.push(life.payload);        
          }
          setLine(array);
          resolve(0);
      }, 0);
    });

    promiseCyle.then((value) => {
    });
  }, [dispatch,idDoc,verifToken]) 
  return (
    <>
      {line.length>0 ?<div className="chronoStyle" >
        <Chrono items={line} mode="VERTICAL_ALTERNATING"   slideShow slideItemDuration="1000" />
      </div>:""}
      
      <Container>
        <Card className="card-header">
          <Card.Body>
              {entities.length>0 ? 

                  <Timeline groups={groups}
                      items={entities}
                      defaultTimeStart={entities[0].start_time}
                      defaultTimeEnd={entities[(entities.length-1)].end_time}
                      stackItems
                      itemHeightRatio={0.75}
                      showCursorLine
                      >
                      <TimelineHeaders className="sticky">
                        <SidebarHeader>
                          {({ getRootProps }) => {
                            return <div className="styeleHeader" {...getRootProps()}>Personnel</div>;
                          }}
                        </SidebarHeader>
                        <DateHeader unit="primaryHeader" />
                        <DateHeader />
                      </TimelineHeaders>
                    </Timeline>
                  
                :""}
                

                </Card.Body>
            </Card>
          </Container>
    </>
  );
}

export default Workflow;
