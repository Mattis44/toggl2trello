/**
 * Ce module permet de gérer les utilisateurs
 */

const constants = require('./constants.json')
const fs = require('fs');

class User {
    constructor(name, API_KEY_TOGGL, TRELLO_LIST_ID, TOGGL_UID) {
        this.name = name;
        this.apiKeyToggl = API_KEY_TOGGL;
        this.trelloListId = TRELLO_LIST_ID;
        this.togglUid = TOGGL_UID;
        this.busy = false;
        this.currentTimeEntry = null;
    }

    updateBusyState(isBusy, timeEntry) {
        this.busy = isBusy;
        this.currentTimeEntry = timeEntry;
    }
}

// Load users from the constants file
const users = constants.users.map(user => new User(user.name, user.API_KEY_TOGGL, user.TRELLO_LIST_ID, user.TOGGL_UID));

// Function to add new user
function addUser(name, API_KEY_TOGGL, TRELLO_LIST_ID, TOGGL_UID) {
    // Create new user
    const user = new User(name, API_KEY_TOGGL, TRELLO_LIST_ID, TOGGL_UID);
    // Add new user to the list of users
    users.push(user);
    //update constants
    constants.users.push({ name: name, API_KEY_TOGGL: API_KEY_TOGGL, TRELLO_LIST_ID: TRELLO_LIST_ID, TOGGL_UID: TOGGL_UID });
    fs.writeFileSync('./constants.json', JSON.stringify(constants, null, 2));
}

// Function to remove a user
function removeUser(name) {
    // Find the index of the user
    const index = users.findIndex(user => user.name === name);
    // Remove the user from the list
    users.splice(index, 1);
    //update constants
    constants.users.splice(index, 1);
    fs.writeFileSync('./constants.json', JSON.stringify(constants, null, 2));
}

function getUserByName(name) {
    return users.find(user => user.name === name);
}

exports.users = users;
exports.addUser = addUser;
exports.removeUser = removeUser;
exports.getUserByName = getUserByName;
