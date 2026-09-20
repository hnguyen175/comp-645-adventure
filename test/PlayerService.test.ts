import * as Vitest from 'vitest';
// import PlayerService from '../www/ts/PlayerService';

Vitest.beforeEach( async () => {
    localStorage.clear();
    Vitest.vi.resetModules();
});

Vitest.test("savePlayers saves a player to storage", async () => {
    const module = await import('../www/ts/PlayerService');
    const playerService = new module.default();

    const name = "John Doe";
    const email = "john.doe@somewhere.com";
    playerService.savePlayers(name, email);

    const savedPlayers = playerService.loadPlayers(email);

    Vitest.expect(savedPlayers).not.toBeNull();
    Vitest.expect(savedPlayers?.players[0]?.name).toBe(name);
    Vitest.expect(savedPlayers?.players[0]?.email).toBe(email);
});

Vitest.test("listPlayersFromStorage returns all saved players", async () => {
    const module = await import('../www/ts/PlayerService');
    const playerService = new module.default();
    // const module = await import('../www/ts/AllPlayers');
    // const allPlayers = module.default;

    playerService.savePlayers("Alice", "alice@wonderland.com");
    const playerList = playerService.listPlayersFromStorage();
    Vitest.expect(playerList).toHaveLength(1);
    Vitest.expect(playerList[0]).toBe("alice@wonderland.com");
});

Vitest.test.each([
    ["", "", false, false],
    ["John Doe", "", true, false],
    ["John Doe", "invalid-email", true, false],
    ["John Doe", "j@d.com", true, true],
] as const)("isPlayerInfoValid returns error messages for invalid input", async (name, email, hasNameError, hasEmailError) => {
    const module = await import('../www/ts/PlayerService');
    const playerService = new module.default();

    const result = playerService.isPlayerInfoValid(name, email);

    if (!hasNameError) {
        Vitest.expect(result.name).toBeDefined();
    } else {
        Vitest.expect(result.name).toBeUndefined();
    }

    if (!hasEmailError) {
        Vitest.expect(result.email).toBeDefined();
    } else {
        Vitest.expect(result.email).toBeUndefined();
    }
});