import * as Vitest from 'vitest';
import PlayerView from '../../www/ts/rendering/PlayerView';
import Players from '../../www/ts/Players';
import Player from '../../www/ts/Player';

let playerView: PlayerView = null as unknown as PlayerView;
Vitest.beforeEach(() => {
    // Clear the document body before each test
    document.body.innerHTML = '';
    playerView = new PlayerView();
});

Vitest.test('renderPlayerCards should render player cards correctly', () => {
    document.body.innerHTML = `
        <ons-carousel-item id="caiComrades">
            <div class="player-cards"></div>
        </ons-carousel-item>
    `;

    const players = new Players();
    const player1 = Player.createRandomPlayer('alice', 'alice@wonderland.org');
    players.addPlayer(player1);

    const playerCards = document.querySelector("#caiComrades .player-cards") as HTMLElement;

    playerView.renderPlayerCards("caiComrades", players.players);

    Vitest.expect(playerCards.querySelector("ons-card.player-card ons-list ons-list-header.list-item__icon div.left img.avatar")?.getAttribute("src")).toBe(`https://api.dicebear.com/10.x/pixel-art/svg?seed=${encodeURIComponent(player1.id)}&size=20`);

    Vitest.expect(playerCards.querySelector("ons-card ons-list-header div.right[data-property='name']")?.textContent?.trim()).toBe(player1.name);
    Object.entries(player1).forEach(([property, value]) => {
        if (property.startsWith("_")) {
            return;
        }
        Vitest.expect(playerCards.querySelector(`ons-list-item.player-stat[data-property='${property}']`)?.textContent.trim()).toBe(`${property.toUpperCase()}: ${value}`);
    });
});

Vitest.test('renderPlayerCards should log error if playerCards container is not found', () => {
    const consoleErrorSpy = Vitest.vi.spyOn(console, 'error').mockImplementation(() => { });
    try {
        playerView.renderPlayerCards("htmlId", []);
    } catch (error: Error | any) {
        Vitest.expect(error.message).contains("required value was not found");
    }
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