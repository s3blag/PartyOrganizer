import React from 'react';
import { connect } from 'react-redux';
import {Link} from 'react-router-dom';
import PartyTile from './PartyTile';

import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';

const styles = theme => ({
  paper: {
    width: 500,
    minHeight: 400,
    borderRadius: '0 0 15px 15px',
    height: '80vh',
    overflowY: 'auto',
    overflowX: 'hidden'
  }
});

class PartyList extends React.Component {
  render() {
    const { classes, parties } = this.props;

    return (
      <Paper className={classes.paper}>
        {Object.keys(parties).sort( (a,b)=> parties[a].unix > parties[b].unix ).map((party)=>
          <Link key={party} to={`/party/${party}/`} style={{textDecoration: 'none'}}><PartyTile {...parties[party]}/></Link>            
        )}
      </Paper>
    )
  }
}

const mapStateToProps = state => ({
  parties: state.meta
});

export default connect(mapStateToProps)(withStyles(styles)(PartyList));