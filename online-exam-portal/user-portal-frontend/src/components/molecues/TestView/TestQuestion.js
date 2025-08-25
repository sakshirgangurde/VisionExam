import { withStyles } from "@material-ui/styles";
import { connect } from "react-redux";
import React   from "react";
import { FormControl, FormControlLabel, FormLabel,  RadioGroup, Radio } from "@material-ui/core";
import { selectedOptionAction } from "../../../redux/actions/takeTestAction";
import Webcam from "react-webcam"; 
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
  canvas: {
    position: "absolute",
    top: "-300px",
    right: "15px",
    width: "40%",
    height: "auto",
    transform: "scaleX(-1)",
    zIndex: 9,
  },
  fingerCount: {
    margin: "15px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#3f51b5"
  },
  landmarks: {
    position: "absolute",
    pointerEvents: "none",
  }
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
      raisedFingers: 0,
      landmarks: null
    }
    this.webcamRef = React.createRef();
    this.canvasRef = React.createRef();
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
      const canvas = this.canvasRef.current;
      const predictions = await this.handposeModel.estimateHands(video);


  // Set canvas dimensions to match video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

       // Clear canvas
       const ctx = canvas.getContext('2d');
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       
      if (predictions.length > 0) {
        const landmarks = predictions[0].landmarks;
        this.setState({ landmarks });
        
        // Draw landmarks
        this.drawLandmarks(landmarks, ctx);
        
        // Process gesture
        const raisedFingers = this.countRaisedFingers(landmarks);
        this.setState({ raisedFingers });
        this.processHandGesture(landmarks, raisedFingers);
      } else {
        this.setState({ landmarks: null, raisedFingers: 0 });
        this.lastFingerCount = 0;
      }
      setTimeout(() => {
        requestAnimationFrame(this.detectHandGesture);
      }, 100); // Adjust the delay as needed
    }
  };


  drawLandmarks = (landmarks, ctx) => {
    ctx.fillStyle = 'red';
    
    // Draw all landmarks as dots
    for (let i = 0; i < landmarks.length; i++) {
      const [x, y] = landmarks[i];
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Draw connections between landmarks (optional)
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    
    // Palm connections
    this.drawConnection(ctx, landmarks, [0, 1, 2, 3, 4]);
    this.drawConnection(ctx, landmarks, [0, 5, 6, 7, 8]);
    this.drawConnection(ctx, landmarks, [0, 9, 10, 11, 12]);
    this.drawConnection(ctx, landmarks, [0, 13, 14, 15, 16]);
    this.drawConnection(ctx, landmarks, [0, 17, 18, 19, 20]);
    
    // Thumb connections
    this.drawConnection(ctx, landmarks, [1, 2, 3, 4]);
    
    // Index finger connections
    this.drawConnection(ctx, landmarks, [5, 6, 7, 8]);
    
    // Middle finger connections
    this.drawConnection(ctx, landmarks, [9, 10, 11, 12]);
    
    // Ring finger connections
    this.drawConnection(ctx, landmarks, [13, 14, 15, 16]);
    // Pinky finger connections
    this.drawConnection(ctx, landmarks, [17, 18, 19, 20]);
  };

  drawConnection = (ctx, landmarks, indices) => {
    ctx.beginPath();
    for (let i = 0; i < indices.length; i++) {
      const [x, y] = landmarks[indices[i]];
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  };

  // countRaisedFingers = (landmarks) => {
  //   const fingerTips = [4, 8, 12, 16, 20]; // Landmark indices for finger tips
  //   const fingerBases = [2, 6, 10, 14, 18]; // Landmark indices for finger bases
  //   let raisedFingers = 0;

  //   for (let i = 0; i < fingerTips.length; i++) {
  //     if (landmarks[fingerTips[i]][1] < landmarks[fingerBases[i]][1]) {
  //       raisedFingers++;
  //     }
  //   }

  //   return raisedFingers;
  // };


// Replace your countRaisedFingers method with this more accurate version:
countRaisedFingers = (landmarks) => {
  // Finger tip and base joint indices
  const fingerJoints = [
    { tip: 8, pip: 6, mcp: 5 },   // Index finger
    { tip: 12, pip: 10, mcp: 9 }, // Middle finger
    { tip: 16, pip: 14, mcp: 13 }, // Ring finger
    { tip: 20, pip: 18, mcp: 17 }, // Pinky finger
    { tip: 4, pip: 2, mcp: 1 }     // Thumb (special handling)
  ];

  let raisedFingers = 0;

  fingerJoints.forEach((finger, index) => {
    const tip = landmarks[finger.tip];
    const pip = landmarks[finger.pip];
    const mcp = landmarks[finger.mcp];

    if (index < 4) { // For fingers (not thumb)
      // Finger is raised if tip is above PIP joint
      if (tip[1] < pip[1]) {
        raisedFingers++;
      }
    } else { // Special handling for thumb
      // Thumb is raised if it's extended outward from palm
      const thumbDirection = Math.atan2(tip[1] - pip[1], tip[0] - pip[0]);
      if (Math.abs(thumbDirection) > Math.PI/4) {
        raisedFingers++;
      }
    }
  });

  return raisedFingers;
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

//   processHandGesture = (landmarks) => {
//     const now = Date.now();
//     const cooldownPeriod = 1000; // 2 seconds cooldown

//     // Check if the cooldown period has passed
//     if (this.lastGestureTime && now - this.lastGestureTime < cooldownPeriod) {
//       return; // Skip processing if still in cooldown
//     }

//     const fingerTips = [4, 8, 12, 16, 20]; // Landmark indices for finger tips
//     const fingerBases = [2, 6, 10, 14, 18]; // Landmark indices for finger bases
//     let raisedFingers = 0;

//     for (let i = 0; i < fingerTips.length; i++) {
//       if (landmarks[fingerTips[i]][1] < landmarks[fingerBases[i]][1]) {
//         raisedFingers++;
//       }
//     }

//     this.setState({ handGesture: raisedFingers });
//  // Map gestures to actions
//  switch (raisedFingers) {
//   case 1:
//     this.selectOption(0); // Select first option
//     break;
//   case 2:
//     this.selectOption(1); // Select second option
//     break;
//   case 3:
//     this.selectOption(2); // Select third option
//     break;
//   case 4:
//     this.selectOption(3); // Select fourth option
//     break;
//   default:
//     break;
// }

//     // Update the last gesture time
//     this.lastGestureTime = now;
// };

processHandGesture = (landmarks, raisedFingers) => {
  const now = Date.now();
  const cooldownPeriod = 2000; // 1 second cooldown

  // Skip if still in cooldown or same finger count
  if ((this.lastGestureTime && now - this.lastGestureTime < cooldownPeriod) || 
      raisedFingers === this.lastFingerCount) {
    return;
  }

  // Only process 1-4 fingers (ignore 0 or 5 fingers)
  if (raisedFingers >= 1 && raisedFingers <= 5) {
    // Directly map finger count to option index (0-3)
    const optionIndex = raisedFingers - 2;
    this.selectOption(optionIndex);
    
    // Update state and timing
    this.setState({ handGesture: raisedFingers });
    this.lastGestureTime = now;
    this.lastFingerCount = raisedFingers;
  }
};


endTest = () => {
  console.log("Ending test");
  this.props.endTestAction(); // Call the Redux action to end the test
};


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

        <div className={this.props.classes.webcamContainer}>
            <Webcam
              audio={false}
              ref={this.webcamRef}
              screenshotFormat="image/jpeg"
              className={this.props.classes.webcam} 

  onUserMediaError={(error) => console.error("Webcam error:", error)}
            />
             <canvas
              ref={this.canvasRef}
              className={this.props.classes.canvas}
              width={640}
              height={480}
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