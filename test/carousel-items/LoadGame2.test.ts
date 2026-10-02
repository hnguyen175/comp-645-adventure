import * as Vitest from 'vitest';
import LoadGame2 from '../../www/ts/carousel-items/LoadGame2';
import Player from '../../www/ts/Player';
import Players from '../../www/ts/Players';
import AllPlayersList from '../../www/ts/rendering/AllPlayersList';

const loadGame2Html = '../../www/views/load-game2.html?raw';

Vitest.beforeAll(async () => {
    // Mock the fetch function to return the HTML content for the specified URLs
    Vitest.vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
        if (url.toString().endsWith("../views/load-game2.html")) {
            const loadGame = await import(loadGame2Html);
            return new Response(loadGame.default);
        }
        throw new Error(`Unexpected URL: ${url}`);
    });

    Vitest.vi.stubGlobal('ons', {
        createElement: (html: string) => {
            const template = document.createElement('template');
            template.innerHTML = html.trim();
            return template.content.firstElementChild as HTMLElement;
        },
    });
});

Vitest.test('LoadGame2 should be properly initialized', async () => {
    const navControllerMock = {
        onLoadGame2ButtonClick: Vitest.vi.fn(),
    };

    const playerServiceMock = {
        listPlayersFromStorage: Vitest.vi.fn(() => ["player1@example.com", "player2@example.com"]),
        loadPlayers: Vitest.vi.fn((email: string) => {
            const players = new Players();
            players.addPlayer(new Player("Player1", "player1@example.com"));
            players.addPlayer(new Player("Player2", "player2@example.com"));
            players.addDefaultPlayers();
            return players;
        }),
    };

    const allPlayersListMock = Vitest.vi.spyOn(AllPlayersList, 'renderAllPlayersList2');

    const loadGame = await LoadGame2.create(navControllerMock as any, playerServiceMock as any);
    Vitest.expect(loadGame).not.toBeNull();
    Vitest.expect(allPlayersListMock).toHaveBeenCalled();

    const selectLastItem = loadGame.getCarouselItem().querySelector<HTMLElement>('#onslPlayers')?.lastElementChild;
    Vitest.expect(selectLastItem?.getAttribute('selected')).toBeNull(); // Ensure it's not selected initially 
    await selectLastItem?.dispatchEvent(new Event('click', { bubbles: true }));

    Vitest.vi.waitFor(() => {
        Vitest.expect(selectLastItem?.classList).toContain('selected');
    });

    Vitest.expect(navControllerMock.onLoadGame2ButtonClick).toHaveBeenCalledWith("player2@example.com");

    // simulate clicking on the list, but not the item
    loadGame.getCarouselItem().querySelector<HTMLElement>('#onslPlayers')?.dispatchEvent(new Event('click', { bubbles: true }));
    // ... in that case the prior selected item should still be selected, and the navController should not be called again
    Vitest.expect(navControllerMock.onLoadGame2ButtonClick).toHaveBeenCalledTimes(1);
    Vitest.vi.waitFor(() => {
        Vitest.expect(selectLastItem?.classList).toContain('selected');
    });
});

Vitest.test('LoadGame2 should handle delete icon click', async () => {
    const navControllerMock = {
        onDeleteGame: Vitest.vi.fn(),
    };

    const playerServiceMock = {
        listPlayersFromStorage: Vitest.vi.fn(() => ["player1@example.com", "player2@example.com"]),
        loadPlayers: Vitest.vi.fn((email: string) => {
            const players = new Players();
            players.addPlayer(new Player("Player1", "player1@example.com"));
            players.addPlayer(new Player("Player2", "player2@example.com"));
            players.addDefaultPlayers();
            return players;
        }),
    };

    const allPlayersListMock = Vitest.vi.spyOn(AllPlayersList, 'renderAllPlayersList2');

    const loadGame = await LoadGame2.create(navControllerMock as any, playerServiceMock as any);
    Vitest.expect(loadGame).not.toBeNull();
    Vitest.expect(allPlayersListMock).toHaveBeenCalled();

    loadGame.getCarouselItem().querySelector<HTMLElement>(".delete-icon")?.dispatchEvent(new Event('click', { bubbles: true }));

    Vitest.expect(navControllerMock.onDeleteGame).toHaveBeenCalledWith("player1@example.com");
});