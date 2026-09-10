import Player from "./Player.js";
export default class Players {
    players: Array<Player> = [];
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
        sessionStorage.setItem("players", JSON.stringify(this.players));
    }

    loadPlayersFromSessionStorage() {
        const savedPlayers = sessionStorage.getItem("players");
        if (savedPlayers) {
            const playersData = JSON.parse(savedPlayers) as Array<Player>;
            this.players = playersData;
        }
    }
};