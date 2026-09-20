import Player from "./Player.ts";
import wrapMethods from './utilities/WrapMethods.ts';

export default class Players {
    // private key: string;
    // private currentScreen: string;
    questCompleted: boolean = false;
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

    savePlayersToStorage() {
        const json = JSON.stringify(this);
        console.log("Saving players to storage:", json);
        localStorage.setItem(this.players[0]?.email, json);
    }

    static loadPlayersFromStorage(email: string) : Players | null {
        const savedPlayers = localStorage.getItem(email);
        if (savedPlayers) {
            return Players.fromJSON(JSON.parse(savedPlayers));
        }
        return null;
    }

    private static fromJSON(data: Partial<Players>) : Players {
        const players = Object.assign(wrapMethods(new Players()), data);

        players.players = data.players?.map(
            playerData => Player.fromJSON(playerData)) || [];
        return players;
    }
};