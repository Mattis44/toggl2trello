/**
 * Ce programme est le cronjob qui va récupérer les données de Toggl via l'API et les envoyer sur Trello.
 * Veuillez démarrer `start.js` pour bien démarrer le programme.
 * Vous pouvez modifier la fréquence du cronjob grâce au paramètre `schedule` de la fonction `cron.schedule`.
 */



// Puis commencer la page React pour ajouter des utilisateurs dans le constants.json
const cron = require('node-cron');
const trello_utils = require('./utils/trello-api-utils');
const fs = require('fs');
const constants = require('./constants.json')
const trelloModule = require('./trello');
const togglModule = require('./toggl');
const csv = require('csv-parser');
const log4js = require('log4js');
log4js.configure({
    appenders: { trello: { type: 'file', filename: './logs.log' } },
    categories: { default: { appenders: ['trello'], level: 'debug' } }
});
const logger = log4js.getLogger('trello');

function run() {

    // Création des objets de constantes.
    const users = constants.users;
    const personsState = {};
    const togglApiKeys = {};
    const trelloListIds = {};
    const togglUidKeys = {};
    const cardIdsByCallId = {};


    // If card-id.txt and existing-cards.txt files don't exist, create them.
    if (!fs.existsSync('./card-id.txt')) {
        fs.writeFileSync('./card-id.txt', '');
    }
    if (!fs.existsSync('./existing-cards.txt')) {
        fs.writeFileSync('./existing-cards.txt', '');
    }



    // Ajout des tuiles Matin et Après-midi dans trello pour chaque utilisateur.
    cron.schedule('00 00 * * *', () => {
        fs.readFile('./constants.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            const jsonData = JSON.parse(data);
            jsonData.users.forEach((user) => {
                if (user.TRELLO_LIST_ID !== "") {
                    trello_utils.addCardOnList(user.TRELLO_LIST_ID, "🌅 Matin 🚿").then(() => { logger.debug(`Carte de la matinée ajoutée pour l'utilisateur ${user.name} !`) }).catch((err) => { logger.error("Carte de la matinée non ajoutée ! Erreur : " + err) });
                }
            });
        });
    }, {
        scheduled: true,
        timezone: "Europe/Paris"
    });

    cron.schedule('00 14 * * *', () => {
        fs.readFile('./constants.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            const jsonData = JSON.parse(data);
            jsonData.users.forEach((user) => {
                if (user.TRELLO_LIST_ID !== "") {
                    trello_utils.addCardOnList(user.TRELLO_LIST_ID, "🌞 Après-Midi ⛱").then(() => { logger.debug(`Carte de l'après-midi ajoutée pour l'utilisateur ${user.name} !`) }).catch((err) => { logger.error("Carte de l'après-midi non ajoutée ! Erreur : " + err) });
                }
            });
        });
    }, {
        scheduled: true,
        timezone: "Europe/Paris"
    });

    // Suppression des données des fichiers `card-id.txt` et `existing-cards.txt` à 23h (Heure Française).
    cron.schedule('00 23 * * *', () => {
        console.log("Reseting files and moving card to history and sorting from dates.")
        resetFiles();
        moveCardToHistory();
    }, {
        scheduled: true,
        timezone: "Europe/Paris"
    });

    // Suppression des archives le vendredi à 23h (Heure Française).
    cron.schedule('30 23 * * 7', () => {
        console.log('Deleting all cards from history list. (Friday)')
        fs.readFile('./constants.json', 'utf8', (err, data) => {
            if (err) {
                logger.debug("Erreur lors de la lecture du fichier constants.json : " + err);
                return;
            }
            const jsonData = JSON.parse(data);
            jsonData.users.forEach((user) => {
                if (user.TRELLO_HISTORY_LIST_ID) {
                    trello_utils.deleteAllCardsFromList(user.TRELLO_HISTORY_LIST_ID);
                }
            });
        });

    }, {
        scheduled: true,
        timezone: "Europe/Paris"
    });

    cron.schedule('*/10 * * * * *', () => {

        // If no users in constants.json, exit.
        if (users.length === 0) {
            console.error("Aucun utilisateur dans le fichier constants.json. Veuillez ajouter des utilisateurs sur le site de configuration.");
            return;
        } else {
            users.forEach(user => {
                const { name, API_KEY_TOGGL, TRELLO_LIST_ID, TOGGL_UID } = user;
                personsState[name] = false;
                togglApiKeys[name] = API_KEY_TOGGL;
                trelloListIds[name] = TRELLO_LIST_ID;
                togglUidKeys[name] = TOGGL_UID;
            });
        }


        const endDate = new Date();
        const startDate = new Date(endDate - 1000 * 60 * 60 * 24);


        // Récupération des données Toggl par utilisateur pour les dernières 24 heures.
        users.forEach(async (user) => {
            try {
                togglModule.getTimeEntries(user.API_KEY_TOGGL, startDate, endDate, (err, entries) => {
                    if (err) {
                        logger.debug("Erreur lors de la récupération des Time Entries Toggl : " + err);
                    } else {
                        entries.forEach((entry) => {
                            if (entry.duration > 0) {
                                if (cardIdsByCallId[entry.id]) {
                                    if (fs.existsSync('card-id.txt')) {
                                        // Si l'entrée Toggl a une durée positive, enlever le label "occupé" de la carte Trello.
                                        const cardIdsString = fs.readFileSync('card-id.txt', 'utf-8');
                                        const cardIds = cardIdsString.trim().split('\n');
                                        Object.keys(cardIdsByCallId)
                                            .filter(key => cardIdsByCallId[key].user === user.name)
                                            .forEach(key => {
                                                const card = trelloModule.createCard(cardIdsByCallId[key].id);
                                                card.removeBusyLabel();
                                                card.removeFromBusyList(user, key);
                                                togglModule.getTimeEntryData(user.API_KEY_TOGGL, key, (err, data) => {
                                                    if (err) logger.debug("Erreur lors de la récupération des données de l'entrée Toggl. Erreur :  " + err + " key : " + key);
                                                    else {
                                                        if (data.pid) {
                                                            togglModule.getProjectData(user.API_KEY_TOGGL, data.pid, (err, project) => {
                                                                if (err) logger.debug("Erreur lors de la récupération des données du projet Toggl : " + err);
                                                                togglModule.getClientData(user.API_KEY_TOGGL, project.cid, (err, client) => {
                                                                    if (err) logger.debug("Erreur lors de la récupération des données du client Toggl : " + err);
                                                                    let clientName = client ? client.name : "...";
                                                                    let description = data.description || "Aucune description";
                                                                    let elapsed = elapsedMinutes(data.start);
                                                                    let stopHours = data.stop.split('T')[1].split(':')[0];
                                                                    let stopMinutes = data.stop.split('T')[1].split(':')[1];
                                                                    let date = new Date(data.stop);
                                                                    let weekdays = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
                                                                    let day = weekdays[date.getDay()];
                                                                    trello_utils.updateCardById(cardIdsByCallId[key].id, clientName, `${description} (${elapsed} min) ⏱${parseInt(stopHours) + 1}:${stopMinutes}`)
                                                                        .catch(err => logger.debug("Erreur lors de la mise à jour de la carte Trello : " + err));
                                                                    delete cardIdsByCallId[key];
                                                                });
                                                            });
                                                        } else {
                                                            let clientName = "...";
                                                            let description = data.description || "Aucune description";
                                                            let elapsed = elapsedMinutes(data.start);
                                                            let stopHours = data.stop.split('T')[1].split(':')[0];
                                                            let stopMinutes = data.stop.split('T')[1].split(':')[1];
                                                            let date = new Date(data.stop);
                                                            let weekdays = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
                                                            let day = weekdays[date.getDay()];
                                                            trello_utils.updateCardById(cardIdsByCallId[key].id, clientName, `${description} (${elapsed} min) ⏱${parseInt(stopHours) + 1}:${stopMinutes}`)
                                                                .catch(err => logger.debug("Erreur lors de la mise à jour de la carte Trello : " + err));
                                                            delete cardIdsByCallId[key];
                                                        }
                                                    }
                                                });
                                            });
                                    }
                                }
                            }
                        });
                    }
                });
            } catch (err) {
                logger.debug("Erreur lors de la récupération des données Toggl pour l'utilisateur " + user.name + " pour les dernières 24h.")
            }
        });



        // Récupération des données Toggl par utilisateur sur l'appel en cours.
        users.forEach(async (user) => {
            try {
                togglModule.getCurrentTimeEntry(user.API_KEY_TOGGL, (err, entry) => {
                    if (err) logger.debug("Erreur lors de la récupération de l'entrée Toggl en cours " + user.name + " : " + err);
                    if (entry == null) {
                        return;
                    }
                    else {
                        for (var key in togglUidKeys) {
                            if (togglUidKeys[key] == entry.uid) {
                                togglModule.getTimeEntryData(user.API_KEY_TOGGL, entry.id, (function (key) {
                                    return function (err, data) {
                                        if (err) logger.debug("Erreur lors de la récupération des données de l'entrée Toggl pour l'utilisateur " + user.name + " : " + err);
                                        else {
                                            let clientName = "...";
                                            if (fs.existsSync('card-id.txt')) {
                                                if (fs.existsSync('existing-cards.txt')) {
                                                    const entriesFromFile = fs.readFileSync('card-id.txt', 'utf-8');
                                                    const entries = entriesFromFile.split('\n');
                                                    const existingCardsString = fs.readFileSync('existing-cards.txt', 'utf-8');
                                                    const existingCards = existingCardsString.split('\n');
                                                    const id_call = `${data.id}${data.uid}`
                                                    if (!existingCards.includes(id_call)) {
                                                        if (data.description == null) data.description = "Aucune description";
                                                        trello_utils.createCard(clientName, data.description + " (vient de commencer)", trelloListIds[key])
                                                            .then(async idCard => {
                                                                trello_utils.MakeBusyList(user, trelloListIds[key], data.id);
                                                                const card = trelloModule.createCard(idCard.id);
                                                                card.addBusyLabel();
                                                                cardIdsByCallId[entry.id] = { id: idCard.id, user: user.name };;
                                                                fs.appendFileSync('existing-cards.txt', id_call + '\n');
                                                                fs.appendFileSync('card-id.txt', idCard.id + '\n');
                                                            })
                                                            .catch(err => logger.debug("Erreur lors de la création de la carte Trello pour l'utilisateur " + user.name + " : " + err));
                                                    } else {
                                                        // La carte existe déjà
                                                        const cardId = entries[existingCards.indexOf(id_call)];
                                                        const elapsed_minutes = elapsedMinutes(data.start);
                                                        if (data.description == null) data.description = "Aucune description";
                                                        if (data.pid) {
                                                            togglModule.getProjectData(user.API_KEY_TOGGL, data.pid, (err, project) => {
                                                                if (err) logger.debug("Erreur lors de la récupération des données du projet Toggl pour l'utilisateur " + user.name + " : " + err);
                                                                else {
                                                                    togglModule.getClientData(user.API_KEY_TOGGL, project.cid, (err, client) => {
                                                                        if (err) logger.debug("Erreur lors de la récupération des données du client Toggl pour l'utilisateur " + user.name + " : " + err);
                                                                        else {
                                                                            trello_utils.updateCardById(cardId, client.name, data.description + " (" + elapsed_minutes + " min)")
                                                                                .catch(err => logger.debug("Erreur lors de la mise à jour de la carte Trello : " + err));
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        } else {
                                                            trello_utils.updateCardById(cardId, clientName, data.description + " (" + elapsed_minutes + " min)")
                                                                .catch(err => logger.debug("Erreur lors de la mise à jour de la carte Trello : " + err));
                                                        }

                                                    }
                                                }
                                            }
                                        }
                                    }
                                })(key));
                            }
                        }
                    }
                });
            } catch (err) {
                logger.debug("Erreur lors de la récupération des données Toggl pour l'utilisateur " + user.name + " pour l'appel en cours.")
            }
        });
    });
}

function elapsedMinutes(dataStart) {
    const start_time = new Date(dataStart);
    const current_time = new Date();
    return Math.floor(Math.floor(current_time - start_time) / (1000 * 60));
}

function resetFiles() {
    console.log("Resetting files")
    fs.writeFileSync('card-id.txt', '');
    fs.writeFileSync('existing-cards.txt', '');
    fs.writeFileSync('logs.log', '');
}

function moveCardToHistory() {
    fs.readFile('./constants.json', 'utf-8', (err, jsonString) => {
        if (err) logger.debug("Impossible de lire le fichier constants.json");
        const data = JSON.parse(jsonString);
        data.users.forEach(user => {
            trello_utils.moveAllCardsFromListToAnother(user.TRELLO_LIST_ID, user.TRELLO_HISTORY_LIST_ID);
        });
    });
}






module.exports = {
    run: run
};