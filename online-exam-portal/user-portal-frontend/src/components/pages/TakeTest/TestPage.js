import { Button, withStyles } from "@material-ui/core";
import React from "react";
import { connect } from "react-redux";
import { Navigate } from "react-router-dom";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import Timer from "../../molecues/TestView/Timer";
import QuestionList from "../../molecues/TestView/QuestionList";
import TestQuestion from "../../molecues/TestView/TestQuestion";
import AlertBox from '../../atoms/Alertbox/AlertBox';
import { endTestAction } from "../../../redux/actions/takeTestAction";


const useStyles = (theme) => ({
  addHeight : theme.mixins.toolbar,
  title : {
    flexGrow : 1
  },
  flexdiv : {
    display:"flex"
  },
  quelistdiv : {
    width : "18%",
    margin : "50px 10px"
  },
  questiondiv : {
    width : "75%",
    marginLeft : "50px",
    marginTop : "50px"
  },
  endtestbtn : {
    marginLeft : "20px"
  },
  btns : {
    margin : "10px",
    borderRadius: '8px', 
    width: 'auto',
    padding: '15px 32px',

    marginBottom: '12px',
  },
  textArea: {
    marginTop: "20px",
    width: "70%",
    height: "120px",
    padding: "15px",
    fontSize: "16px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9f9f9",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    resize: "none",
    color: "#333",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    "&:focus": {
      border: "1px solid #3f51b5",
      boxShadow: "0 4px 12px rgba(63, 81, 181, 0.2)"
    },
    "&::placeholder": {
      color: "#888",
      fontWeight: "bold",
    },
  },
  label: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#3f51b5",
    marginTop : "10px",

  },
  Stopbtns : {
    backgroundColor: '#FF5722', 
    color: 'black', 
    padding: '15px 32px', 
    fontSize: '18px', 
    borderRadius: '8px', 
    width: 'auto',
    // display: 'block',
    marginBottom: '12px',
    textAlign: 'center',
    outline: 'none',
  },
  Startbtns : {
    backgroundColor: '#9C27B0', 
    color: 'black', 
    padding: '15px 32px', 
    fontSize: '18px',
    borderRadius: '8px',
    width: 'auto',

    marginRight: '12px',
    // display: 'block',
    marginBottom: '12px',
    textAlign: 'center',
    outline: 'none', 
  },
})

class TestPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      curIndex:0,
      isListening: false,
      currentLanguage: "en", // changed
      answers: this.props.taketest.answersheet.answers, 
    };
    this.recognition = null;
    console.log("Constructor - Initial props:", props);
  }

  componentDidMount() {

    console.log("ComponentDidMount - Props:", this.props);
    console.log("ComponentDidMount - TakeTest Data:", this.props.taketest);
    console.log("Full taketest structure:", {
      taketest: this.props.taketest,
      answersheet: this.props.taketest?.answersheet,
      structure: {
        keys: Object.keys(this.props.taketest || {}),
        answersheetKeys: Object.keys(this.props.taketest?.answersheet || {})
      }
    });

    if ('webkitSpeechRecognition' in window) {
      this.recognition = new window.webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.onresult = this.handleVoiceCommand;
    }
  }

  componentDidUpdate(prevProps) {
    // Log when props change
    if (prevProps.taketest !== this.props.taketest) {
      console.log("Props updated - New taketest data:", this.props.taketest);
      console.log("Questions array:", this.props.taketest?.answersheet?.questions);
    }
  }

  handleVoiceCommand = (event) => {
    
    if (event.results && event.results.length > 0) {
      const transcript = event.results[event.results.length - 1][0]?.transcript?.trim().toLowerCase();
      
      if (transcript) {
        console.log("Voice Command:", transcript);


      this.setState({ currentCommand: transcript });

      // Navigate to specific question (e.g., "go to 4")
      const goToMatch = transcript.match(/go to (\d+)/);
      if (goToMatch) {
        const questionNumber = parseInt(goToMatch[1], 10) - 1; // Convert to 0-based index
        this.goToQuestion(questionNumber);
        this.speakFeedback(`Moved to question ${questionNumber + 1}`);
        return;
      }

  
      // Navigate between questions
        if (transcript === "prev" ||transcript === "previous") {
          this.goToPrev();
          this.speakFeedback("Moved to the previous question");
        } else if (transcript === "next") {
          this.goToNext();
          this.speakFeedback("Moved to the next question");
        } 
        // else if (transcript === "read") {
        //   this.readQuestion();
        // } 
        else if (transcript.startsWith("option")) {
          const option = transcript.split(" ")[1];
          this.selectOption(option);
          this.speakFeedback(`Selected option ${option}`);
        }else if(transcript === "stop"){
          window.speechSynthesis.cancel();
        }else if (transcript === "submit" || transcript === "end") {
          this.endtest(); // Submit the test
          this.speakFeedback("Test submitted successfully.");
        }
      } else {
        console.warn("No valid transcript received");
      }
    } else {
      console.warn("No results from speech recognition");
    }
  };


  goToQuestion = (index) => {
    if (index >= 0 && index < this.props.taketest.answersheet.answers.length) {
      window.speechSynthesis.cancel();
      this.setState({ curIndex: index });
    } else {
      this.speakFeedback("Invalid question number");
    }
  };
  

  startListening = () => {
    if (this.recognition) {
      this.setState({ isListening: true });
      this.recognition.start();
    }
  };

  stopListening = () => {
    if (this.recognition) {
      this.setState({ isListening: false });
      this.recognition.stop();
    }
  };

  readQuestion = () => {
    const { curIndex } = this.state;
    const { taketest } = this.props;
    
    console.log("Current data structure:", {
      taketest,
      answersheet: taketest?.answersheet,
      structure: {
        keys: Object.keys(taketest || {}),
        answersheetKeys: Object.keys(taketest?.answersheet || {})
      }
    });

    if (!taketest?.answersheet) {
      console.warn("Missing answersheet data");
      return;
    }

    let questionText;
    let options;

    // Try different possible locations for the question data
    if (taketest.test?.questions?.[curIndex]) {
      // If questions are in test object
      questionText = taketest.test.questions[curIndex].text;
      options = taketest.test.questions[curIndex].options;
    } else if (taketest.questions?.[curIndex]) {
      // If questions are directly in taketest
      questionText = taketest.questions[curIndex].text;
      options = taketest.questions[curIndex].options;
    } else {
      console.warn("Could not find question data at index:", curIndex);
      return;
    }

    if (!questionText) {
      console.warn("No question text found for current index:", curIndex);
      return;
    }

    // Format options if they exist
    let optionsText = "";
    if (options && Array.isArray(options)) {
      optionsText = ". Options: " + options
        .map((option, index) => `${String.fromCharCode(97 + index)}) ${option}`)
        .join(", ");
    }
    
    const textToSpeak = `Question ${curIndex + 1}: ${questionText}${optionsText}`;
    
    // Speak the question
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(textToSpeak);
    msg.lang = 'en-IN';
    // msg.lang = 'en-US';
    msg.volume = 1;
    msg.rate = 0.9;

    console.log("Speaking:", textToSpeak);
    window.speechSynthesis.speak(msg);
  };

  render() {
    console.log("Render - Current props:", this.props);
    console.log("Render - Current state:", this.state);
    
    
  }
  selectOption = (option) => {
    const optionChar = option.toLowerCase(); // Convert to lowercase
    const optionIndex = optionChar.charCodeAt(0) - 97; // 'a' is 97 in ASCII
    if (optionIndex >= 0 && optionIndex < 4) { // Ensure valid option range
      const currentAnswerSheet = [...this.state.answers];
      currentAnswerSheet[this.state.curIndex] = optionIndex;
      this.setState({ answers: currentAnswerSheet });
    } else {
      this.speakFeedback("Invalid option");
    }
  };

  setCurIndex(x, obj) {
    console.log("set index");
    console.log(obj);
    obj.setState({
      ...obj.state,
      curIndex:x
    })
  }

  goToPrev() {
    if(this.state.curIndex > 0) {

      window.speechSynthesis.cancel();
      this.setState({
        ...this.state,
        curIndex: this.state.curIndex-1
      })
    }
  }

  goToNext() {
    if(this.state.curIndex + 1 < this.props.taketest.answersheet.answers.length){

      window.speechSynthesis.cancel();
      this.setState({
        ...this.state,
        curIndex : this.state.curIndex+1
      })
    }
  }


  endtest() {
    this.props.endTestAction();
  }

  speakFeedback = (text) => {
    window.speechSynthesis.cancel();
    const feedback = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(feedback);
    this.setState({ voiceCommandOutput: text });
  };

  render() {

    // if (this.props.taketest.isRetrived === false) {
    //   return <Navigate to='/' />;
    // }
    // Define `que` by accessing the current question from `taketest`
    // const que = this.props.taketest.questions?.[this.state.curIndex] || this.props.taketest.test?.questions?.[this.state.curIndex];
  
    // if (!que) {
    //   return <div>No question found for the current index.</div>;
    // }


    if(this.props.taketest.isRetrived === false) {
      return(<Navigate to='/'/>);
    }
    var timerTime = this.props.taketest.test.duration*1000 - (Date.now()-Date.parse(this.props.taketest.answersheet.startTime));
    return(<div>
      <div>
        <AppBar
          elevation={0}
          className={this.props.classes.appbar}
        >
          <Toolbar>
                <Typography variant='h5' className={this.props.classes.title}>
                  {this.props.taketest.test.title}
                </Typography>
                <Typography variant='h6'> 
                  Time Remaining &nbsp;
                </Typography>
                <Typography variant='h6'> 
                  <Timer time={timerTime}></Timer>
                </Typography>
                <Typography variant='h6'>
                  <Button variant="contained" color="secondary" className={this.props.classes.endtestbtn} onClick={()=>(this.endtest())}>End Test</Button>
                </Typography>
          </Toolbar>
        </AppBar>
        <div className={this.props.classes.addHeight}></div>
      </div>
      <div className={this.props.classes.flexdiv}>
        <div className={this.props.classes.quelistdiv}>
        <QuestionList answers={this.props.taketest.answersheet.answers} callback={this.setCurIndex} obj={this}/>
        </div>
        <div className={this.props.classes.questiondiv}>
          <AlertBox></AlertBox>
        {/* <TestQuestion question={this.state.curIndex} answer={this.props.taketest.answersheet.answers[this.state.curIndex]}/> */}
        <TestQuestion question={this.state.curIndex} answer={this.state.answers[this.state.curIndex]} />

        <br/>
        <Button variant="contained" onClick={()=>(this.goToPrev())} className={this.props.classes.btns}>Prev</Button>
        <Button variant="contained" onClick={()=>(this.goToNext())} className={this.props.classes.btns}>Next</Button>
        {/* <Button variant="contained" onClick={this.readQuestion} className={this.props.classes.Readbtns}>Read</Button> */}
        <Button variant="contained" onClick={this.startListening} className={this.props.classes.Startbtns}>Start Voice</Button>
        <Button variant="contained" onClick={this.stopListening} className={this.props.classes.Stopbtns}>Stop Voice</Button>
      
        <Typography className={this.props.classes.label}>Speech Result</Typography>
        <textarea
        
              className={this.props.classes.textArea}
              value={this.state.voiceCommandOutput}
              readOnly
              placeholder="Speech Result"
            />
          
        </div>
        <div>
          
        </div>
      </div>
    </div>)
  }
}


const mapStatetoProps = state => ({
  user : state.user,
  taketest : state.takeTestDetails
})
export default withStyles(useStyles)(connect(mapStatetoProps,{
  endTestAction
})(TestPage)) ;