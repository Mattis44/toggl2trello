// Toggl config
const TogglClient = require('toggl-api');
require('dotenv').config();
const fs = require('fs');
const constants = require('../constants.json')
const users = constants.users;








function getNameByUid(uid) {
    // Recupérer le nom de la personne grâce à l'array et l'envoyer dans trello api utils pour update le nom de la carte avec le nom de la personne de base.
    const togglUidKeys = {};
    users.forEach(user => {
        const { name, TOGGL_UID } = user;
        togglUidKeys[name] = TOGGL_UID;
    });



    for (var key in togglUidKeys) {
        if (togglUidKeys[key] == uid) {
            return key;
        }
    }
}

async function getUidByTimeEntryId(user, entryId) {

    // Get the uid of the person by the entry id
    let toggl = new TogglClient({ apiToken: user.API_KEY_TOGGL });
    return new Promise((resolve, reject) => {
        toggl.getTimeEntryData(entryId, (err, data) => {
            if (err) {
                console.log("Erreur getUidByTimeEntryId : " + err);
            } else {
                resolve(getNameByUid(data.uid));
            }
        });
    });
}





module.exports = { getNameByUid, getUidByTimeEntryId };