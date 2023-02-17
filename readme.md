## Bot Toggl2Trello

  

Ce projet est un bot qui interroges l'API Toggl et Trello dont l'objectif est d'insérer des données dans une Board Trello spécifique correspondant à la personne ayant démarré un timer Toggl.

## Configuration au lancement

Ce bot tourne sur le port 3000 et 3001, vous pouvez le conteneuriser et utiliser le port qu'il vous convient. Cependant prenez en considération de mapper le deuxième port à nombre n+1 du premier port spécifié.
> Exemple : `docker run -p 8000:3000 -p 8001:3001 <MonImage>`

Le projet contenant le serveur et le React, peut prendre un certain temps à se lancer.
  

## Premier lancement

> Pour commencer, vous devrez générer votre clé et token API pour **Trello**. Pour se faire, [cliquez-ici](https://trello.com/app-key).

>Vous devrez renseignez ces information dans le formulaire d'informations API à la page du __Setup Menu__.
Ensuite vous devrez sélectionner le tableau où le bot agira, cela créera automatiquement une étiquette "Occupée" dans votre tableau.  
  

## Configuration des utilisateurs

La configuration se passe sur la page **Config Menu**, elle est disponible une fois la clé, le jeton et le tableau Trello configuré. 

Cette page a pour objectif d'ajouter/supprimer des utilisateurs à la détection du bot, s'il n'y a aucun utilisateur vous aurez "Aucun utilisateur", sinon, vous aurez un tableau avec les informations de celui-ci.

>Vous pouvez ajouter un utilisateur à tout moment via cette page, Dans le formulaire, spécifiez son **Nom** (Similaire à Trello) et sa clé API Toggl. L'utilisateur sera ajouté à la base de donnée et sera donc pris en considération par le bot.

>Vous avez la possibilité de **RESET** le bot, cela aura pour conséquence de supprimer toutes les données enregistrées (clé, jetons, tableau, utilisateurs) et d'arreter le programme. Vous devrez donc le redémarrer pour reprendre la configuration.

> Pour plus de confort, vous pouvez voir le nom du tableau où le bot est opérationnel en haut à droite de la page.

## Documentation

Pour retrouver la documentation officielle du projet, [cliquez-ici](https://app.gitbook.com/o/w9v81NHlh8pndSfZwV40/s/rt8i2yBXEVUEj1lMJBro/toggl-2-trello/presentation).