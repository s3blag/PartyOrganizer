import uuid from 'uuid';
import database from '../firebase';

export const addParty = (id, party) => ({
  type: 'ADD_PARTY',
  id,
  party
});

export const newParty = (partyInfo, order, items) => {
  return (dispatch, getState) => {
    const uid = getState().auth.uid;      
    const key = database.ref('parties').push().key;

    const party = {
      content: {
        ...partyInfo,
        order,
        items
      },
      members: {
        [uid]: {
          type: 'host'
        }
      }
    }
    const metaParty = {
      name: partyInfo.name,
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

// SET PARTIES
export const setParties = (parties) => ({
  type: 'SET_META_PARTIES',
  parties
});

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
    return database.ref(`parties/${id}`).once('value').then((party) => {
      dispatch(setParty(party.val()));
    })
  }
}

const updateItem = (updatedItem) => ({
  type: 'UPDATE_ITEM',
  ...updatedItem
});

export const editPartyItems = (partyID, itemID, totalAmount, chosenAmount) => {
  
  return (dispatch, getState) => {
    const state = getState();
    const get = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : 0, o)    
    
    const uid = state.auth.uid;
    const itemName = state.party.content.items[itemID].name;
    const userTotalAmount = get(['party', 'members', uid, 'items', itemID, 'amount'], state);  
    const amountLeft = totalAmount - chosenAmount;
    const userAmount = parseInt(userTotalAmount, 10) + parseInt(chosenAmount, 10);

    // Write the new data simultaneously
    var updates = {};
    updates[`/${partyID}/content/items/${itemID}/amount`] = amountLeft;
    updates[`/${partyID}/members/${uid}/items/${itemID}`] = { name: itemName, amount:userAmount };

    return database.ref('parties').update(updates).then(()=> dispatch(updateItem({ uid, itemID, itemName, amountLeft, userAmount })));
  }
}