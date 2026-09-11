// @vitest-environment jsdom
import * as Vitest from 'vitest';
import PlayerService from '../www/ts/PlayerService';
import Player from '../www/ts/Player';

Vitest.beforeEach(() => {
    sessionStorage.clear();
});

Vitest.test("savePlayers saves a player to session storage", () => {
    const name = "John Doe";
    const email = "john.doe@somewhere.com";
    PlayerService.savePlayers(name, email);
    const savedPlayer = Player.load();
    Vitest.expect(savedPlayer).not.toBeNull();
    Vitest.expect(savedPlayer?.name).toBe(name);
    Vitest.expect(savedPlayer?.email).toBe(email);
});

Vitest.test("loadMainPlayer returns null when no player is saved", () => {
    const player = PlayerService.loadMainPlayer();
    Vitest.expect(player).toBeNull();
});

Vitest.test("loadMainPlayer returns the saved player", () => {
    const name = "John Doe";
    const email = "john.doe@somewhere.com";
    PlayerService.savePlayers(name, email);
    const player = PlayerService.loadMainPlayer();
    Vitest.expect(player).not.toBeNull();
    Vitest.expect(player?.name).toBe(name);
    Vitest.expect(player?.email).toBe(email);
});