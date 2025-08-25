import { withStyles } from "@material-ui/styles";
import React from "react";
import { connect } from "react-redux";
import { getSubjectDetails } from '../../../redux/actions/subjectAction';
import { setAlert } from "../../../redux/actions/alertAction";

const useStyles = ()=>({
  
  optionInput : {
    display:'inline-block',
    margin :'20px 20px 0px'
  },
  inputfield : {
    display : 'block',
    margin : '10px 20px 0px'
  },
  btn : {
    margin : '20px 40px',
    display:'inline-block'
  },
  textarea : {
    fontSize: '1.1em',
    padding:'5px',
    margin:'20px 20px 0px 0px',
    minWidth:'60%'
  },
  fieldkey : {
    display : 'inline-block',
    fontSize: '1.1em',
    padding:'5px',
    margin:'20px 20px 0px 0px',
    minWidth:'40%'
  },
  formClass: {
    margin: '20px',
    display: 'inline-block',
    textAlign: 'left',
    border: '1px solid #d1d9ff',
    borderRadius: '10px',
    padding: '30px',
    backgroundColor: '#f4f6ff',
    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
  },
  formTitle: {
    fontSize: '1.8em',
    fontWeight: 'bold',
    color: '#3f51b5',
    marginBottom: '20px',
    textAlign: 'center',
  },
  field: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
    alignItems: 'center',
  },
  fieldkey: {
    display: 'inline-block',
    fontSize: '1.1em',
    fontWeight: '500',
    color: '#333',
    width: '40%',
    textAlign: 'right',
    paddingRight: '15px',
  },
  fieldvalue: {
    display: 'inline-block',
    fontSize: '1.1em',
    color: '#1a73e8',
    fontWeight: '400',
    width: '60%',
    backgroundColor: '#e7f0ff',
    padding: '8px 12px',
    borderRadius: '5px',
  },
  questionInput: {
    marginTop: '20px',
    display: 'block',
  },
  optionInput: {
    display: 'inline-block',
    margin: '20px 20px 0px',
  },
  inputfield: {
    display: 'block',
    margin: '10px 20px 0px',
  },
  btn: {
    margin: '20px 40px',
    display: 'inline-block',
    padding: '10px 20px',
    fontSize: '1em',
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#3f51b5',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: '#2c3e94',
    },
  },
  textarea: {
    fontSize: '1.1em',
    padding: '10px',
    margin: '20px 20px 0px 0px',
    minWidth: '60%',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
})

const getSecondToStr = (sec) => {
  var h = parseInt(sec/3600);
  var m = parseInt((sec%3600)/60);
  var str = "";
  if(h<10) {
    str += "0"+h+":";
  } else {
    str += h+":";
  }
  if(m<10) {
    str+= "0"+m;
  } else {
    str += m;
  }
  return str;
}

class ViewTest extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      title :this.props.testDetails.test.title,
      subjects : this.props.testDetails.test.subjects,
      maxmarks : this.props.testDetails.test.maxmarks,
      queTypes : this.props.testDetails.test.queTypes,
      startTime: this.props.testDetails.test.startTime.slice(0,-8),
      endTime : this.props.testDetails.test.endTime.slice(0,-8),
      duration : getSecondToStr(this.props.testDetails.test.duration),
      regStartTime : this.props.testDetails.test.regStartTime.slice(0,-8),
      regEndTime : this.props.testDetails.test.regEndTime.slice(0,-8),
      resultTime :  this.props.testDetails.test.resultTime.slice(0,-8)
    }
  }

  findInArray(arr, val) {
    for(let i=0;i<arr.length;i++){
      if(arr[i]===val) {
        return  true;
      }
    }
    return false;
  }
  
  findInArraySubname(arr, sub) {
    for(let i=0;i<arr.length;i++){
      if(arr[i]===sub.id) {
        return  sub.subject + ", ";
      }
    }
    return "";
  }

  getQuesTypesString(arr) {
    var str = "";
    for(let i=0;i<arr.length;i++){
      str = str + arr[i] + " Marks, ";
    }
    return str;
  }

  render() {
    if(this.props.subjectDetails.retrived === false) {
      this.props.getSubjectDetails();
      return (<div></div>);
    }
    return(
      <div className={this.props.classes.formClass}>
        <div className={this.props.classes.formTitle} color="primary">View Test</div>
        <div className={this.props.classes.field}>
          <div className={this.props.classes.fieldkey}>Title</div>
          <div className={this.props.classes.fieldvalue}>{this.state.title}</div>
        </div>
        <div className={this.props.classes.field}>
          <div className={this.props.classes.fieldkey}>Subjects</div>
          <div className={this.props.classes.fieldvalue}>
          {this.props.subjectDetails.list.map((sub)=>(
            this.findInArraySubname(this.state.subjects,sub)
          ))}
          </div>  
        </div>
        <div className={this.props.classes.field}>
          <div className={this.props.classes.fieldkey}>Question Types</div>
          <div className={this.props.classes.fieldvalue}>
            {this.getQuesTypesString(this.state.queTypes)}
          </div>
        </div>
        <div className={this.props.classes.field}>
          <div className={this.props.classes.fieldkey}>Max Marks</div>
          <div className={this.props.classes.fieldvalue}>{this.state.maxmarks}</div>
        </div>
        <div className={this.props.classes.field}>
          <div className={this.props.classes.fieldkey}>Registration Start Time</div>
          <div className={this.props.classes.fieldvalue}>{this.state.regStartTime}</div>
        </div>
        <div className={this.props.classes.field}>
          <div className={this.props.classes.fieldkey}>Registration End Time</div>
          <div className={this.props.classes.fieldvalue}>{this.state.regEndTime}</div>
        </div>
        <div className={this.props.classes.field}>
          <div className={this.props.classes.fieldkey}>Test Start Time</div>
          <div className={this.props.classes.fieldvalue}>{this.state.startTime}</div>
        </div>
        <div className={this.props.classes.field}>
          <div className={this.props.classes.fieldkey}>Test End Time</div>
          <div className={this.props.classes.fieldvalue}>{this.state.endTime}</div>
        </div>
        <div className={this.props.classes.field}>
          <div className={this.props.classes.fieldkey}>Test Duration</div>
          <div className={this.props.classes.fieldvalue}>{this.state.duration} hours</div>
        </div>
        <div className={this.props.classes.field}>
          <div className={this.props.classes.fieldkey}>Result Time</div>
          <div className={this.props.classes.fieldvalue}>{this.state.resultTime}</div>
        </div>
      </div>
    )
  }
}

const mapStatetoProps = state => ({
  subjectDetails : state.subjectDetails,
  testDetails : state.testDetails
})

export default withStyles(useStyles)(connect(mapStatetoProps,{
  getSubjectDetails,
  setAlert
})(ViewTest));