/**
 * Ce module permet de récupérer des données de Toggl
 */

const TogglClient = require('toggl-api');

const Toggl = {
    // Obtenir des entrées de temps
    getTimeEntries: (user, startDate, endDate, callback) => {
        let toggl = new TogglClient({ apiToken: user });
        toggl.getTimeEntries(startDate, endDate, (err, entries) => {
            if (err) {
                callback(err);
            } else {
                callback(null, entries);
            }
        });
    },
    // Obtenir l'entrée de temps actuelle
    getCurrentTimeEntry: (user, callback) => {
        let toggl = new TogglClient({ apiToken: user });
        toggl.getCurrentTimeEntry(callback);
    },
    // Obtenir les données d'une entrée de temps spécifique
    getTimeEntryData: (user, id, callback) => {
        let toggl = new TogglClient({ apiToken: user });
        toggl.getTimeEntryData(id, (err, data) => {
            if (err) {
                callback(err);
            } else {
                callback(null, data);
            }
        });
    },
    // Obtenir les données sur un projet spécifique
    getProjectData: (user, id, callback) => {
        let toggl = new TogglClient({ apiToken: user });
        toggl.getProjectData(id, (err, projectData) => {
            if (err) {
                callback(err);
            } else {
                callback(null, projectData);
            }
        });
    },
    // Obtenir les données sur un client spécifique
    getClientData: (user, id, callback) => {
        let toggl = new TogglClient({ apiToken: user });
        toggl.getClientData(id, (err, clientData) => {
            if (err) {
                callback(err);
            } else {
                callback(null, clientData);
            }
        });
    },
    
};

module.exports = Toggl;