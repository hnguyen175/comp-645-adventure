import Player from './Player.ts';
import Players from './Players.ts';

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
};