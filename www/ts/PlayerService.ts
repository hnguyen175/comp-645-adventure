import Player from './Player.ts';
import Players from './Players.ts';

type PlayerInfoResult = {
    name?: string;
    email?: string;
};

export default class PlayerService {
    savePlayers(name: string, email: string): Players {
        const player = new Player(name, email);

        const players = new Players();
        players.addPlayer(player);
        players.addDefaultPlayers();

        players.savePlayersToSessionStorage();
        player.save();

        return players;
    }

    loadMainPlayer(): Player | null {
        const player = Player.load();
        if (!player) {
            console.error("Main player not found.");
            return null;
        }
        return player;
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