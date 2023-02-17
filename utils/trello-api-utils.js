const fetch = require('node-fetch');
const toggl_utils = require('./toggl-api-utils');
const fs = require('fs');
const log4js = require('log4js');
log4js.configure({
    appenders: { trello: { type: 'file', filename: './logs.log' } },
    categories: { default: { appenders: ['trello'], level: 'debug' } }
});
const logger = log4js.getLogger('trello');
let data;
async function updateData() {
    const data = await fs.promises.readFile('./client/data.json');
    const json_datas = JSON.parse(data);
    const datas = {
        TRELLO_API_KEY: json_datas.Trello[0].TRELLO_API_KEY,
        TRELLO_API_TOKEN: json_datas.Trello[0].TRELLO_API_TOKEN,
        TRELLO_BOARD_ID: json_datas.Trello[0].TRELLO_BOARD_ID,
        TRELLO_BUSY_LABEL_ID: json_datas.Trello[0].TRELLO_BUSY_LABEL_ID,
        TRELLO_HISTORY_LIST_ID: json_datas.Trello[0].TRELLO_HISTORY_LIST_ID,
    }
    return datas;
}





async function addBusyLabel(cardId) {
    const datas = await updateData();
    fetch('https://api.trello.com/1/cards/' + cardId + '/idLabels?value=' + datas.TRELLO_BUSY_LABEL_ID + '&key=' + datas.TRELLO_API_KEY + '&token=' + datas.TRELLO_API_TOKEN, {
        method: 'POST'
    })
        .then(response => {
            getCardById(cardId).then(result => {
                getListById(result.idList).then(result => {
                    logger.debug(`Ajout de l'étiquette sur la carte de la liste : ${result.name}`)
                });
            });
            return response.text();
        })
        .catch(err => logger.debug(`Erreur lors de l'ajout de l'étiquette sur la carte ${cardId}`));
    return true;
}

async function removeBusyLabel(cardId) {
    const datas = await updateData();
    fetch('https://api.trello.com/1/cards/' + cardId + '/idLabels/' + datas.TRELLO_BUSY_LABEL_ID + '?&key=' + datas.TRELLO_API_KEY + '&token=' + datas.TRELLO_API_TOKEN, {
        method: 'DELETE'
    })
        .then(response => {
            getCardById(cardId).then(result => {
                getListById(result.idList).then(result => {
                    logger.debug(`Suppression de l'étiquette sur la carte de la liste : ${result.name}`)
                });
            });
            return response.text();
        })
        .catch(err => logger.debug(`Erreur lors de la suppression de l'étiquette sur la carte ${cardId}`));
    return true;
}

async function MakeBusyList(user, ListId, entryId) {
    const datas = await updateData();
    getListById(ListId).then(async result => {

        let url = "https://api.trello.com/1/lists/"
        url += ListId + '?key=' + datas.TRELLO_API_KEY + '&token=' + datas.TRELLO_API_TOKEN + '&name= 🛑 ';
        url += await toggl_utils.getUidByTimeEntryId(user, entryId);
        url += " 🚨"



        fetch(url, {
            method: 'PUT'
        })
            .then(response => {
                getListById(ListId).then(result => {
                    logger.debug(`Mise en mode occupée de la liste : ${result.name}`)
                });
                return response.text();
            })
            .catch(err => logger.debug(`Erreur lors de la mise en mode occupée de la liste ${ListId}.`));
    });


}

async function RemoveBusyList(user, ListId, entryId) {
    const datas = await updateData();
    getListById(ListId).then(async result => {

        let url = "https://api.trello.com/1/lists/"
        url += ListId + '?key=' + datas.TRELLO_API_KEY + '&token=' + datas.TRELLO_API_TOKEN + '&name=';
        url += await toggl_utils.getUidByTimeEntryId(user, entryId);


        fetch(url, {
            method: 'PUT'
        })
            .then(response => {
                getListById(ListId).then(result => {
                    logger.debug(`Suppression du mode occupée sur la liste : ${result.name}`)
                });
                return response.text();
            })
            .catch(err => logger.debug(`Erreur lors de la suppression du mode occupée sur la liste ${ListId}.`));
    });


}


async function getListById(idList) {
    const datas = await updateData();
    try {
        const list = await fetch('https://api.trello.com/1/list/' + idList + '?key=' + datas.TRELLO_API_KEY + '&token=' + datas.TRELLO_API_TOKEN, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        const json = await list.json();
        return json;
    } catch (error) {
        logger.debug(`Erreur lors de la récupération de la liste ${idList}.`);
    }
}


async function createCard(client, description, idList) {
    const datas = await updateData();
    let url = "https://api.trello.com/1/cards?name=["
    url += client + "] " + description + "&idList=" + idList + "&key=" + datas.TRELLO_API_KEY + '&token=' + datas.TRELLO_API_TOKEN + "&pos=top"

    const card = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }
    })
    getListById(idList).then(result => {
        logger.debug(`Création de la carte sur la liste : ${result.name}`)
    });
    const json = await card.json();
    return json
}

async function getCardById(idCard) {
    const datas = await updateData();
    try {
        const response = await fetch(`https://api.trello.com/1/card/${idCard}?key=${datas.TRELLO_API_KEY}&token=${datas.TRELLO_API_TOKEN}`);
        if (!response.ok) {
            throw new Error(`Erreur fonction getCardById : ${response.status} ${response.statusText}`);
        }
        return response.json();
    } catch (error) {
        logger.debug("Erreur lors de la récupération de la carte : " + idCard);
    }
}

async function updateCardById(cardId, client, description) {
    try {
        const datas = await updateData();
        let url = "https://api.trello.com/1/cards/" + cardId + "?name=["
        url += client + "] " + description + "&key=" + datas.TRELLO_API_KEY + '&token=' + datas.TRELLO_API_TOKEN

        const card = await fetch(url, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json'
            }
        })
        const json = await card.json();
        return json
    } catch (error) {
        logger.debug("Erreur lors de la mise à jour de la carte : " + cardId);
    }
}

async function moveCardToList(cardId, listId) {
    const datas = await updateData();
    let url = "https://api.trello.com/1/cards/" + cardId + "?idList=" + listId + "&key=" + datas.TRELLO_API_KEY + '&token=' + datas.TRELLO_API_TOKEN

    fetch(url, {
        method: 'PUT'
    })
        .then(response => {
            getListById(listId).then(result => {
                logger.debug(`Déplacement de la carte vers la liste : ${result.name}`)
            });
            return response.text();
        })
        .catch(err => logger.debug(`Erreur lors du déplacement de la carte (${cardId} vers la liste (${listId}))`));
}

async function getListsOnBoard(boardId) {
    try {
        const datas = await updateData();
        let url = "https://api.trello.com/1/boards/" + boardId + "/lists?key=" + datas.TRELLO_API_KEY + '&token=' + datas.TRELLO_API_TOKEN

        const lists = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
        const json = await lists.json();
        return json
    } catch (error) {
        logger.debug("Erreur lors de la récupération des listes du board : " + boardId);
    }
}

async function moveAllCardsFromListToAnother(listId, listId2) {
    const datas = await updateData();
    let url = "https://api.trello.com/1/lists/" + listId + "/moveAllCards?idBoard=" + datas.TRELLO_BOARD_ID + "&idList=" + listId2 + "&pos=top" + "&key=" + datas.TRELLO_API_KEY + '&token=' + datas.TRELLO_API_TOKEN

    const lists = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }
    })
    const json = await lists.json();
    getListById(listId).then(result => {
        logger.debug(`Déplacement de toutes les cartes de la liste : ${result.name}`)
    })
        .catch(err => logger.debug(`Erreur lors du déplacement de toutes les cartes de la liste (${listId} vers la liste (${listId2}))`));
    return json
}

async function getCardsOnList(listId) {
    try {
        const datas = await updateData();
        let url = "https://api.trello.com/1/lists/" + listId + "/cards?key=" + datas.TRELLO_API_KEY + '&token=' + datas.TRELLO_API_TOKEN

        const lists = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
        const json = await lists.json();
        return json
    } catch (error) {
        logger.debug("Erreur lors de la récupération des cartes de la liste : " + listId);
    }
}

async function updateCardPosition(cardId, updates) {
    const datas = await updateData();
    let url = `https://api.trello.com/1/cards/${cardId}?key=${datas.TRELLO_API_KEY}&token=${datas.TRELLO_API_TOKEN}`;
    let options = {
        method: 'PUT',
        body: JSON.stringify(updates),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    try {
        const response = await fetch(url, options);
        const json = await response.json();
        getCardById(cardId).then(result => {
            getListById(result.idList).then(result2 => {
                logger.debug(`Mise à jour de la position de la carte : ${result.name} dans la liste : ${result2.name}`)
            });
        });
        return json;
    } catch (error) {
        logger.debug(`Erreur lors de la mise à jour de la position de la carte : ${cardId}`);
    }
}

async function deleteAllCardsFromList(listId) {
    const datas = await updateData();
    let url = "https://api.trello.com/1/lists/" + listId + "/archiveAllCards?key=" + datas.TRELLO_API_KEY + '&token=' + datas.TRELLO_API_TOKEN

    const lists = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }
    })
    const json = await lists.json();
    getListById(listId).then(result => {
        logger.debug(`Suppression de toutes les cartes de la liste : ${result.name}`)
    })
        .catch(err => logger.debug(`Erreur lors de la suppression de toutes les cartes de la liste (${listId})`));
    return json
}

async function createListOnBoard(boardId, name) {
    try {
        const datas = await updateData();
        let url = "https://api.trello.com/1/lists?key=" + datas.TRELLO_API_KEY + '&token=' + datas.TRELLO_API_TOKEN + "&name=" + name + "&pos=bottom" + "&idBoard=" + boardId

        const lists = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            }
        })
        const json = await lists.json();
        logger.debug(`Création de la liste : ${json.name}`)
        return json
    } catch (error) {
        logger.debug("Erreur lors de la création de la liste : " + name);
    }
}

async function deleteListOnBoard(listId) {
    try {
        const datas = await updateData();
        let url = "https://api.trello.com/1/lists/" + listId + "/closed?value=true&key=" + datas.TRELLO_API_KEY + '&token=' + datas.TRELLO_API_TOKEN

        const lists = await fetch(url, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json'
            }
        })
        const json = await lists.json();
        logger.debug(`Suppression de la liste : ${json.name}`)
        return json
    } catch (error) {
        logger.debug("Erreur lors de la suppression de la liste : " + listId);
    }
}

async function addCardOnList(ListId, name) {
    try {
        const datas = await updateData();
        let url = "https://api.trello.com/1/cards?key=" + datas.TRELLO_API_KEY + '&token=' + datas.TRELLO_API_TOKEN + "&name=" + name + "&pos=top&idList=" + ListId

        const lists = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            }
        })
        const json = await lists.json();
        return json
    } catch (error) {
        logger.debug("Erreur lors de la création de la carte : " + name);
    }
}





module.exports = {
    addBusyLabel,
    removeBusyLabel,
    MakeBusyList,
    RemoveBusyList,
    getListById,
    getCardById,
    createCard,
    updateCardById,
    moveCardToList,
    getListsOnBoard,
    updateData,
    moveAllCardsFromListToAnother,
    getCardsOnList,
    updateCardPosition,
    deleteAllCardsFromList,
    createListOnBoard,
    deleteListOnBoard,
    addCardOnList,
}