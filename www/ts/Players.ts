import Player from "./Player.js";

export default class Players {
    players: Player[];

    constructor() {
        this.players = [];
    }

    addPlayer(player: Player) {
        this.players.push(player);
    }

    addDefaultPlayers() {
        this.players.push(Player.getDefaultPlayer());
        this.players.push(Player.getDefaultPlayer());
    }

    savePlayersToSessionStorage() {
        const json = JSON.stringify(this.players);
        console.log("Saving players to session storage:", json);
        sessionStorage.setItem("players", json);
    }

    loadPlayersFromSessionStorage() {
        const savedPlayers = sessionStorage.getItem("players");
        if (savedPlayers) {
            const playersData = JSON.parse(savedPlayers) as Array<Player>;
            this.players = playersData;
        }
    }
};
