/**
 * Ce programme permet de lancer le cronjob qui va récupérer les données de Toggl et les envoyer sur Trello.
 * Veuillez démarrer `start.js` pour bien démarrer le programme.
 * /!\ Ne rien modifier ici.
 */

require('dotenv').config();
const trello_utils = require('./utils/trello-api-utils');
const fs = require('fs');
let constants = require('./constants.json')
const dataJSON = require('./client/data.json');
const TogglClient = require('toggl-api');
const cronjob = require('./cronjob');
const React = require('react');
const ReactDOM = require('react-dom');
const express = require('express');
const { util } = require('webpack');
const { exec } = require('child_process');
const cors = require('cors');
const bodyParser = require('body-parser');
const log4js = require('log4js');
log4js.configure({
    appenders: { trello: { type: 'file', filename: './logs.log' } },
    categories: { default: { appenders: ['trello'], level: 'debug' } }
});
const logger = log4js.getLogger('trello');
const shortid = require('shortid');



//API TOGGL2TRELLO


const app = express();
const port = 3001;

app.use(cors(), bodyParser.json());
app.get('/users', (req, res) => {
    res.json(constants)
})


app.post('/users', (req, res) => {
    let newUser = {
        id: shortid.generate(),
        name: req.body.name,
        API_KEY_TOGGL: req.body.API_KEY_TOGGL,
        TRELLO_LIST_ID: "",
        TOGGL_UID: "",
        TRELLO_HISTORY_LIST_ID: "",
    }
    let toggl = new TogglClient({ apiToken: newUser.API_KEY_TOGGL });
    toggl.getUserData(toggl, (err, userData) => {
        if (err) {
            if (err.code === 403) {
                res.status(403).json({ error: "Invalid Toggl API key." });
            } else {
                res.status(500).json({ error: "Unknown error." });
            }
        } else {
            newUser.TOGGL_UID = userData.id.toString();
            trello_utils.updateData().then(datas => {
                trello_utils.getListsOnBoard(datas.TRELLO_BOARD_ID).then(lists => {
                    lists.forEach(list => {
                        if (list.name === newUser.name) {
                            newUser.TRELLO_LIST_ID = list.id.toString();
                        }
                        else if (list.name === `📆Archives de ${newUser.name}`) {
                            trello_utils.deleteListOnBoard(list.id.toString()).then(() => {
                                logger.debug(`Suppression de l'ancienne liste d'archives de ${newUser.name} avec succès.`)
                            });
                        }
                    })
                    if (!newUser.TRELLO_LIST_ID) return res.status(404).json({ error: "Liste Trello non trouvée, veuillez la créer." });
                    // Create a new list for the history of the user
                    trello_utils.createListOnBoard(datas.TRELLO_BOARD_ID, `📆Archives de ${newUser.name}`).then(list => {
                        newUser.TRELLO_HISTORY_LIST_ID = list.id.toString();
                        constants.users.push(newUser);
                        fs.writeFile('./constants.json', JSON.stringify(constants, null, 2), (err) => {
                            if (err) throw err;
                            logger.debug(`Ajout de l'utilisateur ${newUser.name} avec succès`)
                            res.json(constants);
                        });
                    });

                });
            })
        }
    });
});






app.delete('/users/:id', (req, res) => {
    // Récupérer l'id de l'utilisateur à supprimer
    const userId = req.params.id;

    // Trouver l'index de l'utilisateur dans le tableau d'utilisateurs
    const userIndex = constants.users.findIndex(user => user.id === userId);

    const name = constants.users[userIndex].name;
    const historyListId = constants.users[userIndex].TRELLO_HISTORY_LIST_ID;

    // Supprimer l'utilisateur du tableau
    constants.users.splice(userIndex, 1);

    // Écrire les modifications dans le fichier JSON
    fs.writeFileSync('./constants.json', JSON.stringify(constants, null, 2));

    trello_utils.deleteListOnBoard(historyListId).then(() => {
        logger.debug(`Suppression de l'utilisateur ${name} avec succès.`);
    })


    // Renvoyer les utilisateurs mis à jour
    res.json(constants);
});

app.get('/api-key', (req, res) => {
    fs.readFile('./client/data.json', 'utf8', (err, jsonString) => {
        if (err) throw err;
        let data = JSON.parse(jsonString);
        res.json(data);
    });
});


app.post('/api-key', async (req, res) => {
    let datas = {
        TRELLO_API_KEY: req.body.API_KEY_TRELLO,
        TRELLO_API_TOKEN: req.body.API_TOKEN_TRELLO,
        TRELLO_BOARD_ID: "",
        TRELLO_BUSY_LABEL_ID: "",
    }
    for (let key in datas) {
        if (dataJSON.Trello[0][key] === '') {
            dataJSON.Trello[0][key] = datas[key];
        }
    }
    fs.writeFile('./client/data.json', JSON.stringify(dataJSON, null, 2), (err) => {
        if (err) throw err;
        res.json(dataJSON);
    });
})

app.delete('/api-key', (req, res) => {
    let datas = {
        TRELLO_API_KEY: "",
        TRELLO_API_TOKEN: "",
        TRELLO_BOARD_ID: "",
        TRELLO_BUSY_LABEL_ID: "",
    }
    for (let key in datas) {
        dataJSON.Trello[0][key] = datas[key];
    }
    fs.writeFile('./client/data.json', JSON.stringify(dataJSON, null, 2), (err) => {
        if (err) throw err;
        res.json(dataJSON);
    });
});

app.post('/api-board', (req, res) => {
    fs.readFile('./client/data.json', 'utf8', (err, jsonString) => {
        if (err) throw err;
        let data = JSON.parse(jsonString);
        data.Trello[0].TRELLO_BOARD_ID = req.body.TRELLO_BOARD_ID;
        fs.writeFile('./client/data.json', JSON.stringify(data, null, 2), (err) => {
            if (err) throw err;
            res.json(data);
        });
    });
});


app.post('/api-label', (req, res) => {
    fs.readFile('./client/data.json', 'utf8', (err, jsonString) => {
        if (err) throw err;
        let data = JSON.parse(jsonString);
        data.Trello[0].TRELLO_BUSY_LABEL_ID = req.body.TRELLO_BUSY_LABEL_ID;
        fs.writeFile('./client/data.json', JSON.stringify(data, null, 2), (err) => {
            if (err) throw err;
            res.json(data);
        });
    });
});

app.delete('/api-reset/:id', async (req, res) => {

    // Réinitialiser les données de logs
    fs.writeFileSync('./logs.log', '');
    fs.writeFileSync('./card-id.txt', '');
    fs.writeFileSync('./existing-cards.txt', '');

    // Réinitialiser les données de constants.json
    constants = { users: [] };
    fs.writeFileSync('./constants.json', JSON.stringify(constants, null, 2));

    // Réinitialiser les données de data.json
    data = {
        Trello: [{
            TRELLO_API_KEY: "",
            TRELLO_API_TOKEN: "",
            TRELLO_BOARD_ID: "",
            TRELLO_BUSY_LABEL_ID: "",
        }]
    }
    fs.writeFileSync('./client/data.json', JSON.stringify(data, null, 2));

    // Renvoyer une réponse de succès
    res.sendStatus(200);
});


app.get('/logs', (req, res) => {
    fs.readFile('./logs.log', 'utf8', (err, data) => {
        if (err) throw err;
        res.send(data);
    });
});


app.listen(port, () => {
    console.log(`L'api écoute sur le port ${port} (serveur) !`);
})

app.delete('/logs', (req, res) => {
    fs.writeFileSync('./logs.log', '');
    res.sendStatus(200);
});

exec("npm start --prefix client", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});









// Faire une boucle qui detecte si le fichier data.json est rempli : 

// Si oui, on lance le cronjob et on sort de la boucle

// Si non, on attend que le fichier soit rempli

let autoRefresh = setInterval(() => {
    fs.readFile('./client/data.json', 'utf8', (err, jsonString) => {
        if (err) throw err;
        let data = JSON.parse(jsonString);
        if (data.Trello[0].TRELLO_API_KEY !== '' && data.Trello[0].TRELLO_API_TOKEN !== '' && data.Trello[0].TRELLO_BOARD_ID !== '' && data.Trello[0].TRELLO_BUSY_LABEL_ID !== '') {
            fs.writeFileSync('./logs.log', '');
            logger.debug(`Le bot est démarré ! Vous pouvez à présent ajouter des utilisateurs.`)
            cronjob.run();
            clearInterval(autoRefresh);
        }
    });
}, 1000);

