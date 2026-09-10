// @vitest-environment jsdom
import * as Vitest from 'vitest';

import Players from '../www/ts/Players';
import Player from '../www/ts/Player';

Vitest.beforeEach(() => {
    sessionStorage.clear();
});

Vitest.test("addPlayer adds a player to the players array", () => {
    const players = new Players();
    const player = Player.getDefaultPlayer();
    players.addPlayer(player);
    Vitest.expect(players.players.length).toBe(1);
    Vitest.expect(players.players[0]).toEqual(player);
});

Vitest.test("addDefaultPlayers adds two default players to the players array", () => {
    const players = new Players();
    players.addDefaultPlayers();
    Vitest.expect(players.players.length).toBe(2);
});

Vitest.test("savePlayersToSessionStorage saves players to session storage", () => {
    const players = new Players();
    const player1 = Player.getDefaultPlayer();
    const player2 = Player.getDefaultPlayer();
    players.addPlayer(player1);
    players.addPlayer(player2);
    players.savePlayersToSessionStorage();
    const savedPlayers = sessionStorage.getItem("players");
    Vitest.expect(savedPlayers).not.toBeNull();
    const playersData = JSON.parse(savedPlayers as string);
    Vitest.expect(playersData.length).toBe(2);
    Vitest.expect(playersData[0]).toEqual(player1);
    Vitest.expect(playersData[1]).toEqual(player2);
});

Vitest.test("loadPlayersFromSessionStorage loads players from session storage", () => {
    const players = new Players();
    const player1 = Player.getDefaultPlayer();
    const player2 = Player.getDefaultPlayer();
    players.addPlayer(player1);
    players.addPlayer(player2);
    players.savePlayersToSessionStorage();
    const newPlayers = new Players();
    newPlayers.loadPlayersFromSessionStorage();
    Vitest.expect(newPlayers.players.length).toBe(2);
    Vitest.expect(newPlayers.players[0]).toEqual(player1);
    Vitest.expect(newPlayers.players[1]).toEqual(player2);
});

Vitest.test("loadPlayersFromSessionStorage does not throw error when no players are saved", () => {
    const players = new Players();
    Vitest.expect(() => players.loadPlayersFromSessionStorage()).not.toThrow();
    Vitest.expect(players.players.length).toBe(0);
});