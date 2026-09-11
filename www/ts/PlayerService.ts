import Player from './Player.js';
import Players from './Players.js';

export default class PlayerService {
    static savePlayers(name: string, email: string): Players {
        const player = new Player(name, email);

        const players = new Players();
        players.addPlayer(player);
        players.addDefaultPlayers();

        players.savePlayersToSessionStorage();
        player.save();

        return players;
    }

    static loadMainPlayer(): Player | null {
        const player = Player.load();
        if (!player) {
            console.error("Main player not found.");
            return null;
        }
        return player;
    }
};