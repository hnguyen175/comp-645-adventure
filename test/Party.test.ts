import * as Vitest from 'vitest';

import Party from '../www/ts/Party';
import Player from '../www/ts/Player';
import PlayerService from '../www/ts/PlayerService';

let playerService = new PlayerService();
Vitest.beforeEach(() => {
    const playerService = new PlayerService();
    localStorage.clear();
});

Vitest.test("addPlayer adds a player to the players array", () => {
    const party = new Party();
    const player = new Player();
    party.addPlayer(player);
    Vitest.expect(party.players.length).toBe(1);
    Vitest.expect(party.players[0]).toEqual(player);
    Vitest.expect(party.toString()).toBe(`Players: ${player.toString()}`);
});

Vitest.test("addDefaultPlayers adds two default players to the players array", () => {
    const party = new Party();
    party.addDefaultPlayers();
    Vitest.expect(party.players.length).toBe(2);
});

Vitest.test("savePlayersToStorage saves players to storage", () => {
    const party = new Party();
    party.addGold(100);
    const player1 = new Player();
    const player2 = new Player();
    party.addPlayer(player1);
    party.addPlayer(player2);
    party.savePlayersToStorage();
    // const savedPlayers = localStorage.getItem("players");
    const savedParty = playerService.loadParty(player1.email);
    Vitest.expect(savedParty).not.toBeNull();
    Vitest.expect(savedParty!.players.length).toBe(2);
    Vitest.expect(savedParty!.players[0]).toEqual(player1);
    Vitest.expect(savedParty!.players[1]).toEqual(player2);
    Vitest.expect(savedParty!.earnedGold).toBe(100);
    Vitest.expect(savedParty!.currentScreen).toBe('DrunkenTavern');
});

Vitest.test("loadPlayersFromStorage loads players from storage", () => {
    const party = new Party();
    const player1 = new Player();
    const player2 = new Player();
    party.addPlayer(player1);
    party.addPlayer(player2);
    party.savePlayersToStorage();
    const savedParty = playerService.loadParty(player1.email) as Party;
    Vitest.expect(savedParty.players.length).toBe(2);
    Vitest.expect(savedParty.players[0]).toEqual(player1);
    Vitest.expect(savedParty.players[1]).toEqual(player2);
});

Vitest.test("loadPlayersFromStorage does not throw error when no players are saved", () => {
    Vitest.expect(() => playerService.loadParty("nonexistent@example.com")).not.toThrow();
    const players = playerService.loadParty("nonexistent@example.com");
    Vitest.expect(players).toBeNull();
});

Vitest.test("loadPlayersFromStorage from invalid JSON does not throw error", () => {
    localStorage.setItem("nonexistent@example.com", "[]");
    Vitest.expect(() => Party.loadPlayersFromStorage("nonexistent@example.com")).not.toThrow();
});

Vitest.test("randomPlayerPicker returns a player from the players array", () => {
    const party = new Party();
    const player1 = new Player();
    const player2 = new Player();
    party.addPlayer(player1);
    party.addPlayer(player2);

    const pickedPlayer1 = party.draw();
    const pickedPlayer2 = party.draw();

    Vitest.expect(pickedPlayer1).not.toBe(pickedPlayer2); // They may be equal, but it's unlikely
    Vitest.expect(party.players).toContain(party.draw());
    Vitest.expect(party.players).toContain(party.draw());
});