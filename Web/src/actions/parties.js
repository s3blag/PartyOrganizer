import database from '../firebase';

export const addParty = (id, party) => ({
  type: 'ADD_PARTY',
  id,
  party
});

export const newParty = (partyInfo) => {
  return (dispatch, getState) => {
    const state = getState().auth;
    const uid = state.uid;      
    const host = state.name;
    const image = state.photo;
    const key = database.ref('parties').push().key;

    const party = {
      content: {
        ...partyInfo,
        image
      },
      members: {
        [uid]: {
          type: 'host',
          name: host,
          image: image
        }
      }
    }
    const metaParty = {
      name: partyInfo.name,
      host,
      image,
      location: partyInfo.location.name,
      unix: partyInfo.unix
    }

    let updates = {}
    updates[`/parties/${key}`] = party;
    updates[`/users/${uid}/partiesMeta/${key}`] = metaParty;

    // updates both parties and user meta data
    return database.ref().update(updates).then(()=>{
      dispatch(addParty(key, metaParty));
    })

    // pushes to parties only
    // return database.ref(`parties`).push(party).then((ref) => {
    //   dispatch(addParty(ref.key, party));
    // });
  }
}

export const editParty = (id, party) => {
  return (dispatch, getState) => {
    const state = getState();
    const host = state.auth.name;
    const image = state.auth.photo;

    const metaParty = {
      name: party.name,
      location: party.location.name,
      unix: party.unix,
      host,
      image
    }
    let updates = {};
    updates[`/parties/${id}/content`] = { ...party, image };
    Object.keys(state.party.members).forEach((member) => updates[`/users/${member}/partiesMeta/${id}`] = metaParty);

    return database.ref().update(updates).then(()=>{
      dispatch(addParty(id, metaParty));
    });
  }
}

export const removeParty = (id) => {
  return (dispatch, getState) => {
    const state = getState();
    let updates = {};
    updates[`/parties/${id}`] = {};
    Object.keys(state.party.members).forEach((member) => updates[`/users/${member}/partiesMeta/${id}`] = {});

    return database.ref().update(updates).then(()=>{
      dispatch(clearData());
      dispatch(removePartyMeta(id));
    });
  }
}

// SET PARTIES
export const setParties = (parties) => ({
  type: 'SET_META_PARTIES',
  parties
});

export const removePartyMeta = (id) => ({
  type: 'REMOVE_META_PARTY',
  id
})

export const clearData = () => ({
  type: 'CLEAR_DATA'
})

export const startSetParties = () => {
  
  return (dispatch, getState) => {
    const uid = getState().auth.uid;
    return database.ref(`users/${uid}/partiesMeta`).once('value').then((snapshot) => {
      let parties = {};
      snapshot.forEach((childSnapshot) => {
        parties = {
          ...parties,
          [childSnapshot.key]: {
            ...childSnapshot.val()
          }
        }
      });
      dispatch(setParties(parties));
    });
  };
};

const setParty = (party) => ({
  type: 'SET_PARTY',
  party
});

export const getPartyData = (id) => {
  return (dispatch, getState) => {
    return database.ref(`parties/${id}`).on('value', (party)=>{
      dispatch(setParty(party.val()));
    });
  }
}

export const editPartyItems = (partyID, itemID, chosenAmount, subtract = true) => {
  return (dispatch, getState) => {
    const state = getState();
    const uid = state.auth.uid;
    const itemName = state.party.content.items[itemID].name;
    const get = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : 0, o)    
    
    return database.ref(`parties/${partyID}/content/items/${itemID}`).once('value').then((snapshot)=>{
      const totalAmount = snapshot.val().amount;
      const userTotalAmount = get(['party', 'members', uid, 'items', itemID, 'amount'], state);  
      const amountLeft = subtract ? parseInt(totalAmount, 10) - parseInt(chosenAmount, 10) : parseInt(totalAmount, 10) + parseInt(chosenAmount, 10);
      const userAmount = subtract ? parseInt(userTotalAmount, 10) + parseInt(chosenAmount, 10) : 0;
  
      // Write the new data simultaneously
      var updates = {};
      updates[`/${partyID}/content/items/${itemID}/amount`] = amountLeft;
      updates[`/${partyID}/members/${uid}/items/${itemID}`] = subtract ? { name: itemName, amount:userAmount } : {};
  
      return database.ref('parties').update(updates);
    })
  }
}

export const newMessage = (partyID, text) => {
  return (dispatch, getState) => {
    const message = {
      text,
      uid: getState().auth.uid
    }

    return database.ref(`parties/${partyID}/messages`).push(message);
  }
}

export const requestAccess = (partyID) => {
  return (dispatch, getState) => {
    const state = getState().auth;

    const uid = state.uid;    
    const name = `${state.name} ${state.lastName}`;
    const image = state.photo;

    return database.ref(`parties/${partyID}/pending/${uid}`).set({ name, image });
  }
}

const acceptUser = (user) => ({
  type: 'ACCEPT_USER',
  ...user
});

export const acceptPendingUser = (partyID, user) => {
  return (dispatch) => {
    database.ref(`parties/${partyID}/content`).once('value').then((snapshot)=>{
      const metaData = {
        name: snapshot.val().name,
        image: snapshot.val().image,
        location: snapshot.val().location.name,
        unix: snapshot.val().unix
      }
      let updates = {}
      updates[`/parties/${partyID}/members/${user.uid}`] = { type: 'guest', image: user.image, name: user.name};
      updates[`/parties/${partyID}/pending/${user.uid}`] = {};      
      updates[`/users/${user.uid}/partiesMeta/${partyID}`] = metaData;

      return database.ref().update(updates).then(()=> dispatch(acceptUser(user)));      
    });
  }
}

export const declinePendingUser = (partyID, uid) => {
  return (dispatch) => {
    return database.ref(`parties/${partyID}/pending/${uid}`).remove();      
  }
}