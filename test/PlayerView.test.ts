// @vitest-environment jsdom

import * as Vitest from 'vitest';
import PlayerView from '../www/ts/PlayerView';
import Players from '../www/ts/Players';
import Player from '../www/ts/Player';

let playerView: PlayerView = null as unknown as PlayerView;
Vitest.beforeEach(() => {
    // Clear the document body before each test
    document.body.innerHTML = '';
    playerView = new PlayerView();
});

Vitest.test('renderPlayerCards should render player cards correctly', () => {
    document.body.innerHTML = `
        <div id="playerCards"></div>
    `;

    const players = new Players();
    players.addPlayer(new Player('alice', 'alice@wonderland.org'));

    const playerCards = document.getElementById("playerCards");

    playerView.renderPlayerCards(players);

    Vitest.expect(playerCards?.innerHTML).toContain('<ons-card class="player-card"><ons-list><ons-list-header>');
    Vitest.expect(playerCards?.innerHTML).toContain('<ons-list-item class="player-stat">');
    Vitest.expect(playerCards?.innerHTML).toContain('</ons-list-item>');
    Vitest.expect(playerCards?.innerHTML).toContain('</ons-list></ons-card>');
    Vitest.expect(playerCards?.innerHTML).toContain('alice');
});

Vitest.test('renderPlayerCards should log error if playerCards container is not found', () => {
    const consoleErrorSpy = Vitest.vi.spyOn(console, 'error').mockImplementation(() => {});
    playerView.renderPlayerCards(new Players());
    Vitest.expect(consoleErrorSpy).toHaveBeenCalled();
});