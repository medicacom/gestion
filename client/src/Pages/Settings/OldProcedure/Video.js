import { Card, Container } from "react-bootstrap";
import Dropzone from "react-dropzone";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { CardBody } from "reactstrap";
import { saveVideoDoc } from "../../../Redux/videoReduce";
import { generatePdfSign } from "../../../Redux/documentReduce";

const Step3 = React.forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const [videoError, setVideoError] = React.useState(null);
  const [videoUrl, setVideoUrl] = React.useState("");
  const [video, setVideo] = React.useState("");
  const isValidated = () => {
    var test = true;
    if(video ===""){
      setVideoError(<small className="text-danger">Vidéo est obligatoire.</small>)
    }
    else{
      setVideoError(null)
    }
    if(test){
      var idDoc = localStorage.getItem("doc");
      var idApp = localStorage.getItem("idApp");
      const videoArray = new FormData();
      videoArray.append("video", video);
      videoArray.append("name", video.name);
      videoArray.append("idDoc", idDoc);
      dispatch(saveVideoDoc( videoArray ));
      dispatch(generatePdfSign( { idDoc,idApp }));
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

  useEffect(() => {}, []);

  const uploadVideo = (acceptedFiles) => {
    setVideo(acceptedFiles[0]);
    setVideoUrl(URL.createObjectURL(acceptedFiles[0]));
  };

  return (
    <Container fluid>
      <Card>
        <CardBody>
          <div className="App">
            <h3>Vidéo *</h3>
            <Dropzone onDrop={uploadVideo} accept="video/*">
              {({ getRootProps, getInputProps }) => (
                <div
                  {...getRootProps({
                    className: "dropzone",
                  })}
                >
                  <input {...getInputProps()} />
                  <p>
                    {videoUrl !== "" ? (
                      <video
                        className="VideoInput_video"
                        width="100%"
                        height={"500px"}
                        controls
                        src={videoUrl}
                      />
                    ) : (
                      "Aucun vidéo selectionner"
                    )}
                  </p>
                  <p>Choisissez un vidéo</p>
                </div>
              )}
            </Dropzone>
            {videoError}
          </div>
        </CardBody>
      </Card>
    </Container>
  );
});

export default Step3;
