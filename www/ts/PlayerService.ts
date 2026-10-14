import Player from './Player.ts';
import Party from './Party.ts';
import playerRegistry from './PlayerRegistry.ts';
import currentGameState from "./GameState.ts";
import must from './utilities/RequiredField.ts';

type PlayerInfoResult = {
    name?: string;
    email?: string;
};

export default class PlayerService {
    savePlayers(name: string, email: string): void {
        const player = Player.createRandomPlayer(name, email);

        const players = new Party();
        players.addPlayer(player);
        players.addDefaultPlayers();

        players.savePlayersToStorage();

        playerRegistry.addEmail(email);

        currentGameState.setPlayers(players);
    }

    loadPlayers(email: string): Party | null {
        const current = Party.loadPlayersFromStorage(email);
        if (current !== null) {
            currentGameState.setPlayers(current);
        }
        return current;
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
        return playerRegistry.getEmails();
    }

    deletePlayers(email: string): void {
        localStorage.removeItem(email);
        playerRegistry.removeEmail(email);
    }

    createVillain(): Player {
        const villain = Player.getVillainPlayer();
        currentGameState.setDtkVillain(villain);
        return villain;
    }

    static saveActivePlayers(): void {
        const players = must(currentGameState.getPlayers());
        players.savePlayersToStorage();
    }
}