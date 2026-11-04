import * as Vitest from 'vitest';
import gameState from '../www/ts/GameState';
import Party from '../www/ts/Party';
import Player from '../www/ts/Player';

Vitest.test('GameState get and set methods', () => {
    const players = gameState.getParty()?.players;
    Vitest.expect(players).toBeUndefined();

    const newParty = new Party();
    gameState.setParty(newParty);
    Vitest.expect(gameState.getParty()).toBe(newParty);
});