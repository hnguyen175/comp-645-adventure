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
    players.addPlayer(Player.createRandomPlayer('alice', 'alice@wonderland.org'));

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

Vitest.test('showValidationToast should display a toast message', async () => {
    document.body.innerHTML = `
        <input id="testInput" type="text">
    `;
    const input = document.getElementById("testInput") as HTMLInputElement;
    playerView.showValidationToast(input, "This is a test message.");
    const toast = document.querySelector(".validation-toast");
    Vitest.expect(toast?.textContent).toBe("This is a test message.");
    Vitest.expect(document.body.contains(toast as Node)).toBe(true);

    // Wait for the toast to disappear
    await new Promise(resolve => setTimeout(resolve, 3100));
    Vitest.expect(document.body.contains(toast as Node)).toBe(false);
});