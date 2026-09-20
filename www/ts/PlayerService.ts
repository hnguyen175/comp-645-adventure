import Player from './Player.ts';
import Players from './Players.ts';
import allPlayers from './AllPlayers.ts';

import wrapMethods from './utilities/WrapMethods.ts';

type PlayerInfoResult = {
    name?: string;
    email?: string;
};

export default class PlayerService {
    activePlayers: Players | null= null;

    savePlayers(name: string, email: string) : void{
        const player = Player.createRandomPlayer(name, email);

        const players = wrapMethods(new Players());
        players.addPlayer(player);
        players.addDefaultPlayers();

        players.savePlayersToStorage();

        allPlayers.addPlayer(email);

        this.activePlayers = players;
    }

    loadPlayers(email: string): Players | null {
        this.activePlayers = Players.loadPlayersFromStorage(email);
        return this.activePlayers;
    }

    isPlayerInfoValid(name: string, email: string): PlayerInfoResult {
        const errorMessage: PlayerInfoResult = {};

        if (!name.trim()) {
            errorMessage.name = "Player name is required.";
        }

        if (!email.trim()) {
            errorMessage.email = "Player email is required.";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errorMessage.email = "Invalid email format.";
            }
        }

        return errorMessage;
    }

    listPlayersFromStorage(): string[] {
        return allPlayers.getAllPlayers();
    }
};