/// <reference types="vitest" />
import * as Vitest from "vitest";

import Party from "../www/ts/Party";
import Player from "../www/ts/Player";
import PlayerService from "../www/ts/PlayerService";

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

Vitest.test(
  "addDefaultPlayers adds two default players to the players array",
  () => {
    const party = new Party();
    party.addDefaultPlayers();
    Vitest.expect(party.players.length).toBe(2);
  },
);

Vitest.test("savePlayersToStorage saves players to storage", () => {
  const party = new Party();
  party.addGold(100);
  party.escapeTimer = 30;
  party.inventory = "Sword, Shield";
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
  Vitest.expect(savedParty!.escapeTimer).toBe(30);
  Vitest.expect(savedParty!.currentScreen).toBe("DrunkenTavern");
  Vitest.expect(savedParty!.inventory).toBe("Sword, Shield");
  Vitest.expect(savedParty?.averageLuk()).toBe(
    Math.round((player1.luk + player2.luk) / 2),
  );
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

Vitest.test(
  "loadPlayersFromStorage does not throw error when no players are saved",
  () => {
    Vitest.expect(() =>
      playerService.loadParty("nonexistent@example.com"),
    ).not.toThrow();
    const players = playerService.loadParty("nonexistent@example.com");
    Vitest.expect(players).toBeNull();
  },
);

Vitest.test(
  "loadPlayersFromStorage from invalid JSON does not throw error",
  () => {
    localStorage.setItem("nonexistent@example.com", "[]");
    Vitest.expect(() =>
      Party.loadPlayersFromStorage("nonexistent@example.com"),
    ).not.toThrow();
  },
);

Vitest.test(
  "randomPlayerPicker returns a player from the players array",
  () => {
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
  },
);

Vitest.test("averageLuk returns the average luck of the players", () => {
  const party = new Party();
  const player1 = new Player();
  player1.luk = 10;
  const player2 = new Player();
  player2.luk = 20;
  party.addPlayer(player1);
  party.addPlayer(player2);
  Vitest.expect(party.averageLuk()).toBe(15);
});

Vitest.test("averageLuk returns 0 when there are no players", () => {
  const party = new Party();
  Vitest.expect(party.averageLuk()).toBe(0);
});

Vitest.test.each([
  [10, "A"],
  [9, "A"],
  [8, "B"],
  [3, "B"],
  [2, "C"],
  [1, "C"],
  [0, "F"],
])(
  "calculateFinalScore returns %s for escapeTimer %i",
  (escapeTimer, expectedGrade) => {
    const party = new Party();
    party.escapeTimer = escapeTimer;
    Vitest.expect(party.calculateFinalScore()).toBe(expectedGrade);
  },
);
