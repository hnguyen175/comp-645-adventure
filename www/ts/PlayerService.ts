import Player from './Player.ts';
import Players from './Players.ts';
import allPlayers from './AllPlayers.ts';

type PlayerInfoResult = {
    name?: string;
    email?: string;
};

export default class PlayerService {
    savePlayers(name: string, email: string): Players {
        const player = Player.createRandomPlayer(name, email);

        const players = new Players();
        players.addPlayer(player);
        players.addDefaultPlayers();

        players.savePlayersToStorage();

        allPlayers.addPlayer(email);

        return players;
    }

    static loadPlayers(email: string): Players | null {
        return Players.loadPlayersFromStorage(email);
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
};