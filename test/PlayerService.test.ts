import * as Vitest from 'vitest';
import PlayerService from '../www/ts/PlayerService';
import Player from '../www/ts/Player';

let playerService: PlayerService;
Vitest.beforeEach(() => {
    playerService = new PlayerService();
    localStorage.clear();
});

Vitest.test("savePlayers saves a player to storage", () => {
    const name = "John Doe";
    const email = "john.doe@somewhere.com";
    playerService.savePlayers(name, email);

    const savedPlayers = PlayerService.loadPlayers(email);

    Vitest.expect(savedPlayers).not.toBeNull();
    Vitest.expect(savedPlayers?.players[0]?.name).toBe(name);
    Vitest.expect(savedPlayers?.players[0]?.email).toBe(email);
});
