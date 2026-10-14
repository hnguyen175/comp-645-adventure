import * as Vitest from 'vitest';
import gameState from '../www/ts/GameState';
import Players from '../www/ts/Party';
import Player from '../www/ts/Player';

Vitest.test('GameState get and set methods', () => {
    const players = gameState.getPlayers()?.players;
    Vitest.expect(players).toBeUndefined();

    const newPlayers = new Players();
    gameState.setPlayers(newPlayers);
    Vitest.expect(gameState.getPlayers()).toBe(newPlayers);
});

Vitest.test('GameState get and set villain methods', () => {
    const villain = gameState.getDtkVillain();
    Vitest.expect(villain).toBeNull();

    const newVillain = Player.createRandomPlayer();
    gameState.setDtkVillain(newVillain);
    Vitest.expect(gameState.getDtkVillain()).toBe(newVillain);
});