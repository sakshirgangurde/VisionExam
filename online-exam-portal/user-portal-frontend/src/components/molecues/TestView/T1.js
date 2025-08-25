import { withStyles } from "@material-ui/styles";
import { connect } from "react-redux";
import React   from "react";
import { FormControl, FormControlLabel, FormLabel,  RadioGroup, Radio } from "@material-ui/core";
import { selectedOptionAction } from "../../../redux/actions/takeTestAction";
import Webcam from "react-webcam"; 
// import axios from "axios";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";

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
    width: "40%", 
    height: "auto",
    transform: "scaleX(-1)",
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
      language: 'en',
      handGesture: null,
    }
    this.webcamRef = React.createRef();
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handposeModel = null;
  }

  async componentDidMount() {
    recognition.start();

    window.addEventListener("keydown", this.handleKeyDown);
    recognition.onresult = (event) => {
      const voiceCommand = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      this.handleVoiceCommand(voiceCommand);
    };


    // Load HandPose model
    this.handposeModel = await handpose.load();
    this.detectHandGesture();
  }

  componentWillUnmount() {
    recognition.stop();

    window.removeEventListener("keydown", this.handleKeyDown);
  }

  detectHandGesture = async () => {
    if (this.webcamRef.current && this.handposeModel) {
      const video = this.webcamRef.current.video;
      const predictions = await this.handposeModel.estimateHands(video);

      if (predictions.length > 0) {
        const landmarks = predictions[0].landmarks;
        this.processHandGesture(landmarks);
      }

      // requestAnimationFrame(this.detectHandGesture);

      // Debounce the next call
      setTimeout(() => {
        requestAnimationFrame(this.detectHandGesture);
      }, 100); // Adjust the delay as needed
    }
  };

  optionSelectHandler = (event) => {
    console.log("optionSelectHandler called with event:", event);
    const selectedOption = event.target.value;
    console.log("Selected option:", selectedOption);
  
    this.props.selectedOptionAction({ index: this.props.question, ans: selectedOption });
    this.setState({ selectedOption });
  
    const utterance = new SpeechSynthesisUtterance(`Option ${selectedOption} selected`);
    window.speechSynthesis.speak(utterance);
  };

  selectOption = (optionIndex) => {
    const que = this.props.taketest.questionid[this.props.question];
  
    if (que && que.options[optionIndex]) {
      const selectedOption = que.options[optionIndex];

      // Check if the selected option is already the current state
      if (this.state.selectedOption === selectedOption) {
        return; // Skip if the option is already selected
      }
      console.log("Selecting option via hand gesture:", selectedOption);
  
      this.props.selectedOptionAction({ index: this.props.question, ans: selectedOption });
      this.setState({ selectedOption });
  
      const utterance = new SpeechSynthesisUtterance(`Option ${String.fromCharCode(65 + optionIndex)} selected`);
      window.speechSynthesis.speak(utterance);
    }
  };

  processHandGesture = (landmarks) => {
    const now = Date.now();
    const cooldownPeriod = 2000; // 2 seconds cooldown

    // Check if the cooldown period has passed
    if (this.lastGestureTime && now - this.lastGestureTime < cooldownPeriod) {
      return; // Skip processing if still in cooldown
    }


  // Thumb landmarks
  const thumbTip = landmarks[4]; // Tip of the thumb
  const thumbBase = landmarks[2]; // Base of the thumb

  // Calculate thumb direction
  const thumbDirection = {
    x: thumbTip[0] - thumbBase[0], // Horizontal direction
    y: thumbTip[1] - thumbBase[1], // Vertical direction
  };

  // Thumbs Up: Thumb is above the base (negative Y direction)
  if (thumbDirection.y < -50) {
    console.log("Thumbs Up: Ending test");
    this.endTest();
  }
  // Thumbs Right: Thumb is to the right of the base (positive X direction)
  else if (thumbDirection.x > 50) {
    console.log("Thumbs Right: Moving to next question");
    this.nextQuestion();
  }
  // Thumbs Left: Thumb is to the left of the base (negative X direction)
  else if (thumbDirection.x < -50) {
    console.log("Thumbs Left: Moving to previous question");
    this.previousQuestion();
  }
    // Example: Detect number of fingers raised
    const fingerTips = [4, 8, 12, 16, 20]; // Landmark indices for finger tips
    const fingerBases = [2, 6, 10, 14, 18]; // Landmark indices for finger bases
    let raisedFingers = 0;

    for (let i = 0; i < fingerTips.length; i++) {
      if (landmarks[fingerTips[i]][1] < landmarks[fingerBases[i]][1]) {
        raisedFingers++;
      }
    }

    this.setState({ handGesture: raisedFingers });
 // Map gestures to actions
 switch (raisedFingers) {
  case 1:
    this.selectOption(0); // Select first option
    break;
  case 2:
    this.selectOption(1); // Select second option
    break;
  case 3:
    this.selectOption(2); // Select third option
    break;
  case 4:
    this.selectOption(3); // Select fourth option
    break;
  default:
    break;
}

    // Update the last gesture time
    this.lastGestureTime = now;
};

endTest = () => {
  console.log("Ending test");
  this.props.endTestAction(); // Call the Redux action to end the test
};

  
  // endtest() {
  //   this.props.endTestAction();
  // }

  handleKeyDown(event) {
    const key = event.key;

    const optionMapping = {
      "1": "A",
      "2": "B",
      "3": "C",
      "4": "D",
    };

    if (optionMapping[key]) {
      const optionIndex = key - 1; // Convert key to 0-based index
      const que = this.props.taketest.questionid[this.props.question];

      if (que && que.options[optionIndex]) {
        const selectedOption = que.options[optionIndex];
        console.log("Selecting option via keyboard:", selectedOption);

        this.props.selectedOptionAction({ index: this.props.question, ans: selectedOption });
        this.setState({ selectedOption });

        const utterance = new SpeechSynthesisUtterance(`Option ${optionMapping[key]} selected`);
        window.speechSynthesis.speak(utterance);
      }
    }
  }

  handleVoiceCommand = (command) => {
    if (command === "read" || command === "padho") {
      this.readQuestionAndOptions();
      return;
    }

    if (command === "marathi") {
      this.changeLanguage("mr");
      return;
    } else if (command === "hindi") {
      this.changeLanguage("hi");
      return;
    } else if (command === "english") {
      this.changeLanguage("en");
      return;
    } 
  };

readQuestionAndOptions = () => {
    
  const que = this.props.taketest.questionid[this.props.question];

  const textToRead = `Question: ${que.body}. Options: 
                      A: ${que.options[0]}, 
                      B: ${que.options[1]}, 
                      C: ${que.options[2]}, 
                      D: ${que.options[3]}`;

  const utterance = new SpeechSynthesisUtterance(textToRead);
  window.speechSynthesis.speak(utterance);
};

  render() {
    
    // const { t, i18n } =  this.props;;
    console.log("Props in TestQuestion:", this.props);

    console.log("Current Question Index:", this.props.question);
    console.log("Question Data Array:", this.props.taketest.questionid);


    if (!this.props.taketest || !this.props.taketest.questionid) {
      console.error("questionid is undefined in taketest:", this.props.taketest);
      return <div>{("Questions not loaded yet")}</div>;
    }

    if(this.props.question!==undefined) {
      const que = this.props.taketest.questionid[this.props.question];
      console.log("Current Question:", que);
      var selectValue = this.props.taketest.answersheet.answers[parseInt(this.props.question)] || null
      return(<div className={this.props.classes.main}>
        <div className={this.props.classes.quebody}>{que.body}</div>
        <FormControl component="fieldset" className={this.props.classes.options}>
          <FormLabel component="legend" >{('Select Answer')}</FormLabel>
          <RadioGroup aria-label="answer" name="answer" value={this.state.selectedOption}  onChange={(event)=>(this.optionSelectHandler(event))}> 
            <FormControlLabel value={que.options[0]} control={<Radio />} label={que.options[0]} />
            <FormControlLabel value={que.options[1]} control={<Radio />} label={que.options[1]} />
            <FormControlLabel value={que.options[2]} control={<Radio />} label={que.options[2]} />
            <FormControlLabel value={que.options[3]} control={<Radio />} label={que.options[3]} />
          </RadioGroup>

        </FormControl>

        {/* value={selectValue}  */}

        <div className={this.props.classes.webcamContainer}>
            <Webcam
              audio={false}
              ref={this.webcamRef}
              screenshotFormat="image/jpeg"
              className={this.props.classes.webcam} 

  onUserMediaError={(error) => console.error("Webcam error:", error)}
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

export default (withStyles(useStyles)(connect(mapStatetoProps,{
  selectedOptionAction
})(TestQuestion)));