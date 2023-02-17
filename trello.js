/**
 * Ce module permet de récupérer des données de Trello
 */
const trello_utils = require('./utils/trello-api-utils');
const fs = require('fs');

class Trello {
    constructor(cardId) {
        this.cardId = cardId;
    }

    addBusyLabel() {
        trello_utils.addBusyLabel(this.cardId);
    }
    removeBusyLabel() {
        trello_utils.removeBusyLabel(this.cardId);
    }
    getCard() {
        return trello_utils.getCardById(this.cardId);
    }
    addToBusyList(callId) {
        trello_utils.addToBusyList(this.cardId, callId);
    }
    removeFromBusyList(user, callId) {
        trello_utils.getCardById(this.cardId).then(
            (card) => {
                trello_utils.RemoveBusyList(user, card.idList, callId)
            })
    }


}

// Function to create new card object
function createCard(cardId) {
    return new Trello(cardId);
}

exports.createCard = createCard;

