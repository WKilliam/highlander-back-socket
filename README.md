# highlander-back-socket


Front 

- Map 
- Seesion
- Character ( teams )
- TChat affichage
- Tchat envoie
- Tchat reception
- Affichage des joueurs dans une partie
- Affichage de la vue de combat
- Affichage de la creation de session


Back Socket 

- Gestion des tours 
- Gestion des positions
- Gestion de l'état des joueurs
- Gestion de l'état des sessions
- Gestion des évenements
- Gestion des combats
- Gestion des rooms

Back API

- Gestion des utilisateurs
- Gestion des decks
- Gestion des cartes
- Creation de session
- Gestion de l'authentification
- Gestions de la creation des cartes 
- Gestion de la creation des decks
- Gestion de la creation des playlists

possibilité partie exterieur

Api IA Generatrice d'image

- Gestion de la creation des cartes via des prompt
- Gestion de la creation des decks via des prompt


Front end Logique 

Usilisateur crée une session :
- Il choisi une map
- Il choisi une carte avec laquel il va jouer
- création de la session
- création des 5 teams de 2 
- place le joueur en une liste d'attente pour choisir ça team
- si 4 joueur sont placé dans une équipe ( différente ) lancement d'un compte a rebours de 30 seconde
- lancement de la partie 

Relais Back Socket :
- Envoie de l'id de la session pour crée la room
- Gestion des tours
- Gestion des positions
- Gestion de l'état des joueurs
- Gestion des évenements
- Gestion des combats
- Envoie signal pour premier tour au joueurs de la room

