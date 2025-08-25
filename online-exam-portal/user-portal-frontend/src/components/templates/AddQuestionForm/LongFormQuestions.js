import React from "react";
import { TextField, Button, Select, InputLabel, TextareaAutosize } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { setAlert } from "../../../redux/actions/alertAction";
import { getSubjectDetails } from '../../../redux/actions/subjectAction';
import { addQuestionAction } from "../../../redux/actions/questionAction";

const useStyles = () => ({
  formClass: {
    margin: '20px',
    border: '1px solid black',
    borderRadius: '10px',
    padding: '20px',
    textAlign: 'center',
  },
  questionInput: {
    marginTop: '20px',
    width: '100%',
  },
  btn: {
    margin: '20px 10px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    margin: '20px 0',
    minHeight: '100px',
  },
  audioUpload: {
    margin: '20px 0',
  },
});

class AddQuestionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      body: "",
      subject: "",
      marks: 1,
      explanation: "",
      answerType: "text", // "text" or "audio"
      audioFile: null, // For voice answers
    };
  }

  // Handle input changes
  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  // Handle audio file upload
  handleAudioUpload = (event) => {
    this.setState({ audioFile: event.target.files[0] });
  };

  // Submit form
  handleSubmit = (event) => {
    event.preventDefault();
    const { body, subject, marks, explanation, answerType, audioFile } = this.state;

    if (!subject || subject === "None") {
      this.props.setAlert({
        isAlert: true,
        type: 'error',
        title: 'Invalid Input',
        message: 'Please select a subject',
      });
      return;
    }

    const questionData = {
      body,
      subject,
      marks,
      explanation,
      answerType,
      audioAnswer: answerType === "audio" ? audioFile : null,
    };

    this.props.addQuestionAction(questionData);
  };

  render() {
    const { classes } = this.props;
    const { answerType } = this.state;

    if (this.props.subjectDetails.retrieved === false) {
      this.props.getSubjectDetails();
      return <div>Loading...</div>;
    }

    return (
      <form className={classes.formClass} onSubmit={this.handleSubmit}>
        <h2 className={classes.formTitle}>Add Descriptive Question</h2>

        {/* Question Text */}
        <TextField
          variant="outlined"
          className={classes.questionInput}
          label="Question"
          name="body"
          value={this.state.body}
          onChange={this.handleInputChange}
          required
          multiline
          rows={3}
        />

        {/* Subject Selection */}
        <InputLabel htmlFor="subject-label">Subject</InputLabel>
        <Select
          native
          name="subject"
          value={this.state.subject}
          onChange={this.handleInputChange}
          className={classes.inputField}
          required
        >
          <option value="">Select Subject</option>
          {this.props.subjectDetails.list.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.subject}
            </option>
          ))}
        </Select>

        {/* Marks */}
        <TextField
          type="number"
          name="marks"
          label="Marks"
          value={this.state.marks}
          onChange={this.handleInputChange}
          className={classes.inputField}
          InputProps={{ inputProps: { min: 1 } }}
          required
        />

        {/* Answer Type (Text or Audio) */}
        <InputLabel htmlFor="answerType-label">Answer Type</InputLabel>
        <Select
          native
          name="answerType"
          value={answerType}
          onChange={this.handleInputChange}
          className={classes.inputField}
        >
          <option value="text">Text Answer</option>
          <option value="audio">Voice Answer</option>
        </Select>

        {/* Conditional Rendering for Answer Input */}
        {answerType === "text" ? (
          <TextareaAutosize
            name="explanation"
            placeholder="Expected answer (for reference)"
            value={this.state.explanation}
            onChange={this.handleInputChange}
            className={classes.textarea}
          />
        ) : (
          <div className={classes.audioUpload}>
            <input
              type="file"
              accept="audio/*"
              onChange={this.handleAudioUpload}
            />
            <p>Student will record their voice during the exam.</p>
          </div>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.btn}
        >
          Submit Question
        </Button>
      </form>
    );
  }
}

const mapStateToProps = (state) => ({
  subjectDetails: state.subjectDetails,
});

export default withStyles(useStyles)(
  connect(mapStateToProps, {
    getSubjectDetails,
    setAlert,
    addQuestionAction,
  })(AddQuestionForm)
);