import React from "react";
import { withStyles } from "@material-ui/styles";
import { connect } from "react-redux";
import { TableBody, TableCell, TableRow, Table, TableHead, TableContainer, Paper } from "@material-ui/core";
import { getTestDetailsFromId } from "../../../redux/actions/teacherTestAction";


const useStyles = (theme)=> ({
  container: {
    margin: '20px',
    boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
    borderRadius: '10px',
    marginLeft : '-50%',
    textAlign : 'center',
  },
  tableBorder: {
    background: '#f4f4f9',
    padding: '20px',
    borderRadius: '10px',
  },
  tableHeader: {
    backgroundColor: '#3f51b5',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  tableCell: {
    fontSize: '0.9rem',
    padding: '12px 20px',
    color: '#333',
  },
  clickableCell: {
    cursor: 'pointer',
    color: '#1a73e8',
    '&:hover': {
      color: '#3f51b5',
      textDecoration: 'underline',
    },
  },
  tableRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: '#f2f2f2',
    },
    '&:hover': {
      backgroundColor: '#e7e7e7',
    },
  },
  tableContainer: {
    borderRadius: '10px',
    overflow: 'auto', 
  },
  tableBorder:{
    background:'#e7e7e7',
    padding:'15px'
  },
  tableHeader:{
    background:'#3f51b5',
    color:'white'
  }
})

class TestTable extends React.Component {
  constructor(props){
    super(props);
    this.state = {}
  }

  onTestClick(event,id) {
    this.props.getTestDetailsFromId({testid:id});
  }

  render() {
    return(<div className={this.props.classes.container}>
      <TableContainer component={Paper} className={this.props.classes.tableContainer}>
        <Table sx={{ minWidth: 650 }} aria-label="stylish table">
          <TableHead >
            <TableRow>
              <TableCell className={this.props.classes.tableHeader}>No.</TableCell>
              <TableCell align="left" className={this.props.classes.tableHeader}>Test</TableCell>
              <TableCell  align="center" className={this.props.classes.tableHeader}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.testlist.map((test,index)=>(
              <TableRow key={index}  className={this.props.classes.tableRow}>
                <TableCell className={this.props.classes.tableCell} >{index+1}</TableCell>
                <TableCell className={`${this.props.classes.tableCell} ${this.props.classes.clickableCell}`} onClick={(event)=>(this.onTestClick(event,test._id))}>{test.title}</TableCell>
                <TableCell align="center" className={this.props.classes.tableCell}>{test.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
      </TableContainer>
    </div>)
  }
}

const mapStatetoProps = state => ({
  testlist : state.testDetails.list
})

export default withStyles(useStyles)(connect(mapStatetoProps,{
  getTestDetailsFromId
})(TestTable));
