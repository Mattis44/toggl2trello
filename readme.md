## 🇫🇷
## 🤖 Bot Toggl2Trello

  
Ce projet est un bot qui interroges l'API Toggl et Trello dont l'objectif est d'insérer des données dans une Board Trello spécifique correspondant à la personne ayant démarré un timer Toggl.

## 🎯 Fonctionnalités

- Page web de configuration du bot.
- Connexions API guidées.
- Ajout/Suppression d'utilisateur.
- Export de la configuration en JSON.
- Système de LOGS.
- CI/CD
- API.

## ✅ Exigences

> NodeJS >= 18.12.1 ou une version antérieure supportée par ce package.

> NPM (inclu dans Node)/Yarn

## 🧭 Configuration au lancement

Ce bot tourne sur le port 3000 et 3001, vous pouvez le conteneuriser et utiliser le port qu'il vous convient. Cependant, prenez en considération de mapper le deuxième port à nombre n+1 du premier port spécifié.
> Exemple : `docker run -p 8000:3000 -p 8001:3001 <MonImage>`

Le projet contenant le serveur et le React, peut prendre un certain temps à se lancer.

Si vous ne conteneurisez pas le bot, veuillez faire :
`npm i` && `cd ./client` && `npm i`
| Revenir à la racine `node start`.
  

## ✈ Premier lancement

> Pour commencer, vous devrez générer votre clé et token API pour **Trello**. Pour se faire, [cliquez-ici](https://trello.com/app-key).

>Vous devrez renseignez ces information dans le formulaire d'informations API à la page du __Setup Menu__.
Ensuite vous devrez sélectionner le tableau où le bot agira, cela créera automatiquement une étiquette "Occupée" dans votre tableau.  
  

## 👨‍👨‍👧‍👦 Configuration des utilisateurs

La configuration se passe sur la page **Config Menu**, elle est disponible une fois la clé, le jeton et le tableau Trello configuré. 

Cette page a pour objectif d'ajouter/supprimer des utilisateurs à la détection du bot, s'il n'y a aucun utilisateur vous aurez "Aucun utilisateur", sinon, vous aurez un tableau avec les informations de celui-ci.

>Vous pouvez ajouter un utilisateur à tout moment via cette page, Dans le formulaire, spécifiez son **Nom** (Similaire à Trello) et sa clé API Toggl. L'utilisateur sera ajouté à la base de donnée et sera donc pris en considération par le bot.

>Vous avez la possibilité de **RESET** le bot, cela aura pour conséquence de supprimer toutes les données enregistrées (clé, jetons, tableau, utilisateurs).

> Pour plus de confort, vous pouvez voir le nom du tableau où le bot est opérationnel en haut à droite de la page.

## 📋 Archivage des cartes Trello

Le bot archive tous les soirs (23h) les cartes présentes dans les listes enregistrés dans le config menu. Il supprime tout ce qui est présent dans le board le dimanche soir (23h30). Tout ceci est configurable dans `./cronjob.js`, veuillez vous fier à la documentation de cron.

## 📄 Documentation

Pour retrouver la documentation officielle du projet, [cliquez-ici](https://app.gitbook.com/o/w9v81NHlh8pndSfZwV40/s/rt8i2yBXEVUEj1lMJBro/toggl-2-trello/presentation).

## 🇺🇸
## 🤖 Toggl2Trello Bot

This project is a bot that queries the Toggl and Trello APIs, with the goal of inserting data into a specific Trello Board that corresponds to the person who started the Toggl timer.

## 🎯 Features

- Bot configuration web page.
- Guided API connections.
- Adding/Removing users.
- Configuration export as JSON.
- Logging system.
- API.

## ✅ Requirements

> NodeJS >= 18.12.1 or a supported version for this package.
> NPM(included in Node)/Yarn
## 🧭 Startup Configuration

The bot runs on ports 3000 and 3001, you can containerize it and use the port that suits you best. However, consider mapping the second port to the number n+1 of the first specified port.
Example: `docker run -p 8000:3000 -p 8001:3001 <MyImage>`

The project containing the server and React may take some time to launch.

If you do not containerize the bot, please do:
`npm i` && `cd ./client` && `npm i`
| Return to the root `node start`.

## ✈ First Launch

> To start, you will need to generate your API key and token for **Trello**. To do so, [click here](https://trello.com/app-key).

> You will need to fill in these information in the API information form on the __Setup Menu__ page.
Then you will need to select the board where the bot will act, this will automatically create a "Busy" label in your board.

## 👨‍👨‍👧‍👦 User Configuration

The configuration takes place on the **Config Menu** page, it is available once the key, token, and Trello board are configured.

This page is used to add/remove users to the bot's detection, if there are no users you will have "No Users", otherwise, you will have a table with the information of the user.

> You can add a user at any time through this page, In the form, specify their **Name** (Similar to Trello) and their Toggl API key. The user will be added to the database and will therefore be taken into consideration by the bot.

> You have the option to **RESET** the bot, this will result in deleting all stored data (keys, tokens, board, users).

> For more convenience, you can see the name of the board where the bot is operational at the top right of the page.

## 📋 Archiving Trello cards

The bot archives all cards in the lists recorded in the config menu every night (11 PM `GMT+1`). It removes everything in the board on Sunday nights (11:30 PM `GMT+1`). All of this is configurable in `./cronjob.js`, please refer to the cron documentation.

## 📄 Documentation

To find the official documentation of the project, [click here](https://app.gitbook.com/o/w9v81NHlh8pndSfZwV40/s/rt8i2yBXEVUEj1lMJBro/toggl-2-trello/presentation).
