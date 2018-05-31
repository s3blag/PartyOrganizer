import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import Avatar from 'material-ui/Avatar';
import Map from './Map';
import LoadingPage from './LoadingPage';
import { Marker } from "react-google-maps";
import ItemList from './ItemList';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import { InputAdornment } from 'material-ui/Input';

//actions
import { editPartyItems, getPartyData, acceptPendingUser, clearData } from '../actions/parties';
//icons
import TimeIcon from 'material-ui-icons/AccessTime';
import LocationIcon from 'material-ui-icons/LocationOn';
import MaxAmountIcon from 'material-ui-icons/PlaylistAddCheck';

const Member = withStyles( theme => ({
  wrapper: {
    display: 'flex',
    height: 80,
    width: 300,
    borderBottom: `2px solid ${theme.palette.primary.main}`, 
    borderRight: `2px solid ${theme.palette.primary.main}`,      
  },
  avatar: {
    zIndex: 1,    
    width: 44,
    height: 44,
    margin: theme.spacing.unit
  },
  '@media (max-width: 600px)': {
    wrapper: {
      width: '100%'
    }
  }    
}))((props) => {
  const { classes, items, isMember } = props;

  const member = (
    <React.Fragment>
      <Avatar alt={props.name} src={props.image} className={classes.avatar} />
      <div>
        <Typography>{props.name} <i>{props.type}</i></Typography>
        <Typography>Brings: {Object.keys(items || {}).map((item)=> `${items[item].name} x${items[item].amount}, `)}</Typography>        
      </div>
    </React.Fragment>
  );

  const pendingUser = (
    <React.Fragment>
      <Avatar alt={props.name} src={props.image} className={classes.avatar} />
      <div>
        <Typography>{props.name} </Typography>
        <Button onClick={() => props.acceptPendingUser({ name: props.name.split(' ')[0], image: props.image, uid: props.uid })}>Accept</Button>
        <Button>Decline</Button>        
      </div>
    </React.Fragment>
  )
  return (
    <div className={classes.wrapper}>
      {isMember ? member : pendingUser}
    </div>
  )
});

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  infoWrapper: {
    width: '60%',
    minWidth: 700
  },
  infoContent: {
    display: 'flex',
    flexDirection: 'row'
  },
  headline: {
    padding: theme.spacing.unit*2
  },
  info: {
    width: '40%',
    height: '100%',
    padding: theme.spacing.unit
  },
  items: {
    width: '60%'    
  },
  avatar: {
    zIndex: 1,    
    width: 44,
    height: 44,
  },
  speechBubble: {
    position: 'relative',
    background: '#00aabb',
    borderRadius: '.4em',
    color: '#fff',
    padding: 5,
    minHeight: 34,
    maxWidth: 'calc(100% - 70px)',
    wordWrap: 'break-word',
    '&:after':{
      content: '""',
      position: 'absolute',
      left: 0,
      top: 22,
      width: 0,
      height: 0,
      border: '10px solid transparent',
      borderRightColor: '#00aabb',
      borderLeft: 0,
      marginTop: '-10px',
      marginLeft: '-10px',
    }
  },
  guestsWrapper: {
    width: 300
  },
  amountInput: {
    width: 100
  },
  membersBar: {
    backgroundColor: theme.palette.primary.main,
    color: '#fff'
  },
  pendingBar: {
    backgroundColor: '#4dd0e1'
  },
  '@media (max-width: 1000px)': {
    root: {
      flexDirection: 'column'
    },
    infoWrapper: {
      width: '100%',
      minWidth: 0
    },
    guestsWrapper: {
      width: '100%'
    }
  },
  '@media (max-width: 700px)': {
    infoContent: {
      flexDirection: 'column'
    },
    info: {
      width: `calc(100% - ${theme.spacing.unit*2}px)`
    },
    items: {
      width: '100%'
    }
  }
});

class PartyPage extends React.Component{
  state = {
    showItemSelect: false,
    amount: 1,
    render: false
  }

  componentDidMount(){
    this.props.getPartyData(this.props.match.params.id);
  }

  componentWillUnmount(){
    this.props.clearData();
  }

  static getDerivedStateFromProps(props, state){
    if (props.party && !state.render) {
      return {
        render: true
      }
    } 
    return null;
  }

  showItemSelect = (id) => {
    this.setState({
      showItemSelect: true,
      selectedItemID: id,
      amount: 1
    })
  }

  getMaxAmount = () => {
    this.setState({
      amount: this.props.party.items[this.state.selectedItemID].amount
    });
  }

  handleChangeInput = (name) => (e) => {
    let val = e.target.value;
    const max = this.props.party.items[this.state.selectedItemID].amount;
    
    val = val.toString().replace(/^[^1-9]|[^0-9]*/g, '');
    if (parseInt(val, 10) > parseInt(max, 10)) {
      const size = val.length;
      if (size > 1) val = val.substr(0, size - 1);
      else val = max;
    } 
    this.setState({
      [name]: val
    })
  }

  editItemsAmount = () => {
    const { amount, selectedItemID } = this.state;
    const totalAmount = this.props.party.items[this.state.selectedItemID].amount;
    const partyID = this.props.match.params.id;
    if(parseInt(totalAmount, 10) >= parseInt(amount, 10)) {
      this.props.editPartyItems(selectedItemID, amount);
      this.setState({ showItemSelect: false })
    }
  }

  render() {
    const { classes, party, members, pending } = this.props;
    if (!this.state.render) return <LoadingPage/>;
    return (
      <div className={classes.root}>
        <div className={classes.infoWrapper}>
          <Paper className={classes.headline}>
            <Typography align="center" variant="display3">{party.name}</Typography>
          </Paper>
          <div className={classes.infoContent}>
            <Paper className={classes.info}>
              <List dense>
                <ListItem disableGutters style={{alignItems: 'flex-start'}}>
                  <ListItemIcon>
                    <Avatar alt="Host" src={party.image} className={classes.avatar} />   
                  </ListItemIcon>
                  {party.description &&
                  <div className={classes.speechBubble}>
                    <Typography color="inherit">{party.description}</Typography>                 
                  </div>
                  }
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon>
                    <TimeIcon />
                  </ListItemIcon>
                  <Typography>{moment.unix(party.unix).format('h:mm a Do MMMM')}</Typography>
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon>
                    <LocationIcon />
                  </ListItemIcon>
                  <Typography>{party.location.name}</Typography>
                </ListItem>
              </List>              
              <Map center={{lat: party.location.lat, lng: party.location.lng}}>
                <Marker position={{lat: party.location.lat, lng: party.location.lng}}/>
              </Map>
            </Paper>
            <Paper className={classes.items}>
              <ItemList fixed={true} order={party.order} items={party.items} onItemSelect={this.showItemSelect}/>
              {this.state.showItemSelect && 
              (
              <div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline'}}>
                <Typography color="primary" variant="body2" style={{marginRight: 10}}>{party.items[this.state.selectedItemID].name}:</Typography>
                <TextField 
                  type="text" 
                  value={this.state.amount} 
                  onChange={this.handleChangeInput('amount')} 
                  className={classes.amountInput}
                  InputProps = {{ endAdornment: 
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Max amount"
                        onClick={this.getMaxAmount}
                      >
                        <MaxAmountIcon/>
                      </IconButton>
                  </InputAdornment>
                  } }
                />
                <Button color="primary" onClick={this.editItemsAmount}>Got it!</Button>
              </div>
              )
              }
            </Paper>
          </div>
        </div>
        <div className={classes.guestsWrapper}>
          <Paper>
            {
              pending && 
              <Typography color="inherit" variant="title" align="center" className={classes.pendingBar}>{Object.keys(pending).length} pending</Typography>
            }                        
            {Object.keys(pending).map((user)=>{
              return <Member 
                      isMember={false}
                      uid={user}
                      acceptPendingUser={this.props.acceptPendingUser}
                      key={user} 
                      name={pending[user].name} 
                      image={pending[user].image}
                    />
            })}
            <Typography color="inherit" variant="title" align="center" className={classes.membersBar}>{Object.keys(members).length} members</Typography>  
            <div style={{display: 'flex', flexWrap: 'wrap'}}>
              {Object.keys(members).map((member)=>{
                return <Member 
                        isMember={true}
                        key={member} 
                        type={members[member].type}
                        name={members[member].name} 
                        image={members[member].image}
                        items={members[member].items}
                      />
              })}
            </div>          
          </Paper>
        </div>        
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  party: state.party.content,
  members: state.party.members,
  pending: state.party.pending || false
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  editPartyItems: (itemID, amount) => dispatch(editPartyItems(ownProps.match.params.id, itemID, amount)),
  getPartyData: (id) => dispatch(getPartyData(id)),
  acceptPendingUser: (uid) => dispatch(acceptPendingUser(ownProps.match.params.id, uid)),
  clearData: () => dispatch(clearData())
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PartyPage));