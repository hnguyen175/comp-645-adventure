import * as Vitest from 'vitest';

import Players from '../www/ts/Players';
import Player from '../www/ts/Player';
import PlayerService from '../www/ts/PlayerService';

let playerService = new PlayerService();
Vitest.beforeEach(() => {
    const playerService = new PlayerService();
    localStorage.clear();
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

Vitest.test("savePlayersToStorage saves players to storage", () => {
    const players = new Players();
    const player1 = Player.getDefaultPlayer();
    const player2 = Player.getDefaultPlayer();
    players.addPlayer(player1);
    players.addPlayer(player2);
    players.savePlayersToStorage();
    // const savedPlayers = localStorage.getItem("players");
    const savedPlayers = playerService.loadPlayers(player1.email);
    Vitest.expect(savedPlayers).not.toBeNull();
    Vitest.expect(savedPlayers!.players.length).toBe(2);
    Vitest.expect(savedPlayers!.players[0]).toEqual(player1);
    Vitest.expect(savedPlayers!.players[1]).toEqual(player2);
});

Vitest.test("loadPlayersFromStorage loads players from storage", () => {
    const players = new Players();
    const player1 = Player.getDefaultPlayer();
    const player2 = Player.getDefaultPlayer();
    players.addPlayer(player1);
    players.addPlayer(player2);
    players.savePlayersToStorage();
    const newPlayers = playerService.loadPlayers(player1.email) as Players;
    Vitest.expect(newPlayers.players.length).toBe(2);
    Vitest.expect(newPlayers.players[0]).toEqual(player1);
    Vitest.expect(newPlayers.players[1]).toEqual(player2);
});

Vitest.test("loadPlayersFromStorage does not throw error when no players are saved", () => {
    Vitest.expect(() => playerService.loadPlayers("nonexistent@example.com")).not.toThrow();
    const players = playerService.loadPlayers("nonexistent@example.com");
    Vitest.expect(players).toBeNull();
});

Vitest.test("loadPlayersFromStorage from invalid JSON does not throw error", () => {
    localStorage.setItem("nonexistent@example.com", "[]");
    Vitest.expect(() => Players.loadPlayersFromStorage("nonexistent@example.com")).not.toThrow();
});