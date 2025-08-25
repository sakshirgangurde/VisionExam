
// import { withStyles } from "@material-ui/styles";
// import React from "react";
// import CheckCircleIcon from '@material-ui/icons/CheckCircle';
// import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';



// const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
// const recognition = new SpeechRecognition();
// recognition.continuous = true; 

// const useStyles = (theme) => ({
//   main : {
//     padding : "20px",
//     border : "1px solid",
//     borderRadius : "20px",
//     backgroundColor: "#f5f5f5",
//     boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
//     display: "flex",
//     flexWrap: "wrap",
//     gap: "10px",
//     justifyContent: "center",
//   },
//   li : {
//     padding : "5px",
//     height: "30px",
//     display : "inline-block",
//     border : "1px solid",
//     width : "60px",
//     textAlign : "left",
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: "10px",
//     backgroundColor: "#fff",
//     boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
//     transition: "all 0.3s ease",
//     cursor: "pointer",
//     width: "60px",
//     textAlign: "center",
//     "&:hover": {
//       backgroundColor: "#e3f2fd",
//       boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
//     },
//   },
//   icon: {
//     marginRight: "5px",
//   },
//   number: {
//     fontWeight: "bold",
//     color: "#333",
//   },
// })

// class QuestionList extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       answers:this.props.answers
//     }
//   }

//   componentDidMount() {
//     // Initialize Speech Recognition
//     if ("webkitSpeechRecognition" in window) {
//       this.recognition = new window.webkitSpeechRecognition();
//       this.recognition.continuous = true;
//       this.recognition.interimResults = false;
//       this.recognition.lang = "en-US";

//       this.recognition.onresult = (event) => {
//         const lastResult = event.results[event.results.length - 1][0].transcript.trim();
//         console.log("Recognized:", lastResult);
//         this.handleVoiceCommand(lastResult);
//       };

//       this.recognition.start();
//     } else {
//       console.warn("Speech recognition is not supported in this browser.");
//     }
//   }


//   // handleVoiceCommand = (command) => {
//   //   const match = command.match(/go to question (\d+)/i);
//   //   if (match) {
//   //     const questionNumber = parseInt(match[1], 10);
//   //     if (!isNaN(questionNumber) && questionNumber > 0 && questionNumber <= this.state.answers.length) {
//   //       console.log(`Navigating to Question ${questionNumber}`);
//   //       this.props.callback(questionNumber - 1, this.props.obj);

//   //       // Announce navigation
//   //       const utterance = new SpeechSynthesisUtterance(`Navigating to question ${questionNumber}`);
//   //       window.speechSynthesis.speak(utterance);
//   //     } else {
//   //       console.warn("Invalid question number");
//   //     }
//   //   }
//   // };

//   handleVoiceCommand = (command) => {
//     if (!command || typeof command !== "string") {
//       console.warn("Invalid voice command:", command);
//       return;
//     }
  
//     console.log("Received Command:", command); // Debugging log
  
//     const match = command.match(/go to question (\d+)/i);
//     if (match) {
//       const questionNumber = parseInt(match[1], 10);
  
//       if (!isNaN(questionNumber) && questionNumber > 0 && questionNumber <= this.state.answers.length) {
//         console.log(`Navigating to Question ${questionNumber}`);
//         this.props.callback(questionNumber - 1, this.props.obj);
  
//         // Announce navigation
//         const utterance = new SpeechSynthesisUtterance(`Navigating to question ${questionNumber}`);
//         window.speechSynthesis.speak(utterance);
//       } else {
//         console.warn("Invalid question number:", questionNumber);
//       }
//     } else {
//       console.warn("No matching command detected:", command);
//     }
//   };
  

//   render() {
//     if(this.state.answers !== undefined){
//       if(this.state.answers.length > 0 ) {
//       return (<div className={this.props.classes.main}>
//         {this.state.answers.map((q,index) => (
//           <div key={index} onClick={()=>(this.props.callback(index,this.props.obj))} className={this.props.classes.li}>
//           &nbsp; {q!==null ? <CheckCircleIcon color="primary" className={this.props.classes.icon}  fontSize="small"/>:<RadioButtonUncheckedIcon className={this.props.classes.icon}  color="action" fontSize="small"/>}
//           &nbsp; {index+1} 
//           </div>
//         ))}
//       </div>)
//       }
//     } else {
//       return (<div>No questions in test</div>);
//     }
//   }
// }

// export default withStyles(useStyles)(QuestionList);

import { withStyles } from "@material-ui/styles";
import React from "react";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';

const useStyles = (theme) => ({
  main: {
    padding: "20px",
    border: "1px solid",
    borderRadius: "20px",
    backgroundColor: "#f5f5f5",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "center",
  },
  li: {
    padding: "5px",
    height: "30px",
    display: "inline-block",
    border: "1px solid",
    width: "60px",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#e3f2fd",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
    },
  },
  icon: {
    marginRight: "5px",
  },
  number: {
    fontWeight: "bold",
    color: "#333",
  },
});

class QuestionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      answers: this.props.answers,
    };
  }

  componentDidMount() {
    if ("webkitSpeechRecognition" in window) {
      this.recognition = new window.webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";

      this.recognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1][0].transcript.trim();
        console.log("Recognized:", lastResult);
        this.handleVoiceCommand(lastResult);
      };

      this.recognition.start();
    } else {
      console.warn("Speech recognition is not supported in this browser.");
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.answers !== this.props.answers) {
      this.setState({ answers: this.props.answers });
    }
  }

  handleVoiceCommand = (command) => {
    if (!command || typeof command !== "string") {
      console.warn("Invalid voice command:", command);
      return;
    }

    console.log("Received Command:", command); // Debugging log

    const match = command.match(/question (\d+)/i);
    if (match) {
      const questionNumber = parseInt(match[1], 10);

      if (!isNaN(questionNumber) && questionNumber > 0 && questionNumber <= this.state.answers.length) {
        console.log(`Navigating to Question ${questionNumber}`);
        this.props.callback(questionNumber - 1, this.props.obj);

        // Announce navigation
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(`Navigating to question ${questionNumber}`);
          window.speechSynthesis.speak(utterance);
        } else {
          console.warn("Speech synthesis is not supported in this browser.");
        }
      } else {
        console.warn("Invalid question number:", questionNumber);
      }
    } else {
      console.warn("No matching command detected:", command);
    }
  };

  render() {
    const { classes } = this.props;
    const { answers } = this.state;

    if (!answers || answers.length === 0) {
      return <div>No questions in test</div>;
    }

    return (
      <div className={classes.main}>
        {answers.map((q, index) => (
          <div
            key={index}
            onClick={() => this.props.callback(index, this.props.obj)}
            className={classes.li}
            aria-label={`Question ${index + 1}`}
          >
            {q !== null ? (
              <CheckCircleIcon color="primary" className={classes.icon} fontSize="small" />
            ) : (
              <RadioButtonUncheckedIcon className={classes.icon} color="action" fontSize="small" />
            )}
            {index + 1}
          </div>
        ))}
      </div>
    );
  }
}

export default withStyles(useStyles)(QuestionList);