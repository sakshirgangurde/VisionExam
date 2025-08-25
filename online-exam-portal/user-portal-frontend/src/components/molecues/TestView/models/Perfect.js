import { withStyles } from "@material-ui/styles";
import { connect } from "react-redux";
import React from "react";
import { FormControl, FormControlLabel, FormLabel, RadioGroup, Radio } from "@material-ui/core";
import { selectedOptionAction } from "../../../redux/actions/takeTestAction";
import Webcam from "react-webcam"; 
import * as faceapi from "face-api.js"; 
import { endTestAction } from "../../../redux/actions/takeTestAction";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true; 


const useStyles = (theme) => ({
  quebody : {
    margin : "15px"
  },
  options : {
    margin : "15px"
  },
  webcamContainer: {
    position: "relative", 
    margin: "15px",
    width: "100%", 
    height: "auto",
  },
  webcam: {
    position: "absolute", 
    top: "-300px", 
    right: "15px", 
    width: "20%", 
    height: "auto",
  },
  Readbtns : {
    backgroundColor: '#f44336', 
    color: 'black',
    padding: '15px 32px', 
    fontSize: '18px', 
    borderRadius: '8px', 
    width: 'auto',
    // display: 'block',
    marginBottom: '12px',
    marginRight: '12px',
    textAlign: 'center',
    outline: 'none',
  },
})

class TestQuestion extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props.question)
    this.state = {
      selectedOption : this.props.taketest.answersheet.answers[parseInt(this.props.question)] || null,
      faceNotDetectedCount: 0,
    }
    this.webcamRef = React.createRef();
  }
  async componentDidMount() {
    
    faceapi.nets.tinyFaceDetector.loadFromUri("./models").then(() => {
      console.log('Models loaded successfully');
    }).catch(error => {
      console.error('Error loading models', error);
    });
    

    
    this.faceDetectionInterval = setInterval(this.checkFacePresence, 1000);
    recognition.start();
    recognition.onresult = (event) => {
      const voiceCommand = event.results[0][0].transcript.trim().toLowerCase();
      this.handleVoiceCommand(voiceCommand);
    };
  }

  componentWillUnmount() {
    // Clear interval when component unmounts
    clearInterval(this.faceDetectionInterval);
    recognition.stop();
  }
  
  endtest() {
    this.props.endTestAction();
  }



  checkFacePresence = async () => {
    const video = this.webcamRef.current.video;
    
    if (video && faceapi.nets.tinyFaceDetector.isLoaded) {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
      if (detections.length === 0) {
        this.setState(prevState => {
          if (prevState.faceNotDetectedCount + 1 === 3) {
            // Speak the alert message when the face is not detected 3 times

            console.log("Detecting face, count:", prevState.faceNotDetectedCount);
            const alertMessage = "Face not detected 3 times. Ending the test.";
            const utterance = new SpeechSynthesisUtterance(alertMessage);
            window.speechSynthesis.speak(utterance);
  
            // End the test and clear the interval
            this.props.endTestAction();
            clearInterval(this.faceDetectionInterval);
  
            return { faceNotDetectedCount: prevState.faceNotDetectedCount + 1 };
          } else {
            // Speak the warning message when the face is not detected
            const warningMessage = `Face not detected. Warning ${prevState.faceNotDetectedCount + 1}`;
            const utterance = new SpeechSynthesisUtterance(warningMessage);
            window.speechSynthesis.speak(utterance);
  
            return { faceNotDetectedCount: prevState.faceNotDetectedCount + 1 };
          }
        });
      } else {
        
        this.setState({ faceNotDetectedCount: 0 });
      }
    }
  };
  

  handleVoiceCommand = (command) => {
    if (command === "read" || command === "padho") {
      this.readQuestionAndOptions();
      return;
    }


    // Extract the question number from the command
  const goToMatch = command.match(/go to question (\d+)/);
  if (goToMatch) {
    const questionNumber = parseInt(goToMatch[1], 10);
    if (!isNaN(questionNumber) && questionNumber > 0 && questionNumber <= this.props.taketest.questionid.length) {
      console.log("Navigating to Question:", questionNumber);
      
      // Navigate to the selected question
      this.props.callback(questionNumber - 1, this.props.taketest);
      
      // Announce the selected question
      const announceMessage = `Navigating to question ${questionNumber}`;
      const utterance = new SpeechSynthesisUtterance(announceMessage);
      window.speechSynthesis.speak(utterance);
    }
    return;
  }
      const optionMapping = {
        "option a": this.props.taketest.questionid[this.props.question].options[0],
        "option b": this.props.taketest.questionid[this.props.question].options[1],
        "option c": this.props.taketest.questionid[this.props.question].options[2],
        "option d": this.props.taketest.questionid[this.props.question].options[3],
      };

      if (optionMapping[command]) {
        console.log("Selecting option via voice:", optionMapping[command]);
        this.props.selectedOptionAction({ index: this.props.question, ans: optionMapping[command] });
        this.setState({ selectedOption: optionMapping[command] });
        this.announceOption(command); 
      }
  };

  readQuestionAndOptions = () => {
    
    var que = this.props.taketest.questionid[this.props.question];

    const textToRead = `Question: ${que.body}. Options: 
                        A: ${que.options[0]}, 
                        B: ${que.options[1]}, 
                        C: ${que.options[2]}, 
                        D: ${que.options[3]}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    window.speechSynthesis.speak(utterance);
  };


  announceOption = (command) => {
    const optionMapping = {
      "option a": "Option A selected",
      "option b": "Option B selected",
      "option c": "Option C selected",
      "option d": "Option D selected",
    };

    const message = optionMapping[command];
  if (message) {
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  }else {
    console.log("Invalid command for option announcement."); 
  }
};


  optionSelectHandler(event) {
    this.props.selectedOptionAction({
      index : this.props.question,
      ans : event.target.value
    });

    this.setState({ selectedOption: event.target.value });
  }

  render() {
    if(this.props.question!==undefined) {
      var que = this.props.taketest.questionid[this.props.question];
      console.log("Current Question:", que);
      var selectValue = this.props.taketest.answersheet.answers[parseInt(this.props.question)] || null
      return(<div className={this.props.classes.main}>
        <div className={this.props.classes.quebody}>{que.body}</div>
        <FormControl component="fieldset" className={this.props.classes.options}>
          <FormLabel component="legend" >Select Answer</FormLabel>
          <RadioGroup aria-label="answer" name="answer" value={this.state.selectedOption}  onChange={(event)=>(this.optionSelectHandler(event))}>
            {/* <FormControlLabel value={que.options[0]} control={<Radio />} label={que.options[0]} />
            <FormControlLabel value={que.options[1]} control={<Radio />} label={que.options[1]} />
            <FormControlLabel value={que.options[2]} control={<Radio />} label={que.options[2]} />
            <FormControlLabel value={que.options[3]} control={<Radio />} label={que.options[3]} /> */}
            {que.options.map((option, index) => (
            <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
          ))}
          </RadioGroup>
        </FormControl>

        {/* value={selectValue}  */}

        <div className={this.props.classes.webcamContainer}>
            <Webcam
              audio={false}
              ref={this.webcamRef}
              screenshotFormat="image/jpeg"
              className={this.props.classes.webcam} 
            />
          </div>


          <button className={this.props.classes.Readbtns} onClick={this.readQuestionAndOptions}>Read</button>

      </div>)
    } else {
      return <div>qustion is undefined</div>
    }
  }
}

const mapStatetoProps = state => ({
  taketest : state.takeTestDetails
})

export default withStyles(useStyles)(connect(mapStatetoProps,{
  selectedOptionAction
})(TestQuestion));
