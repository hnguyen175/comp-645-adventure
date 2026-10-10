import * as Vitest from 'vitest';
import LoadGame from '../../www/ts/carousel-items/LoadGame';
import Player from '../../www/ts/Player';
import Players from '../../www/ts/Players';
import AllPlayersList from '../../www/ts/rendering/AllPlayersList';

const loadGameHtml = '../../www/views/load-game.html?raw';

Vitest.beforeAll(async () => {
    // Mock the fetch function to return the HTML content for the specified URLs
    Vitest.vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
        if (url.toString().endsWith("../views/load-game.html")) {
            const loadGame = await import(loadGameHtml);
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

Vitest.test('LoadGame should be properly initialized', async () => {
    const navControllerMock = {
        // onLoadGameButtonClick: Vitest.vi.fn().mockResolvedValue(undefined),
        onLoadGameButtonClick: Vitest.vi.fn(() => {
            return Promise.resolve();
        })
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

    const allPlayersListMock = Vitest.vi.spyOn(AllPlayersList, 'renderAllPlayersList');

    const loadGame = await LoadGame.create(navControllerMock as any, playerServiceMock as any);
    Vitest.expect(loadGame).not.toBeNull();

    Vitest.expect(allPlayersListMock).not.toHaveBeenCalled(); // Ensure that renderAllPlayersList is not called during initialization

    loadGame.loadPlayers(); // Load players to render the list
    Vitest.expect(allPlayersListMock).toHaveBeenCalled(); // Ensure that renderAllPlayersList is called after loading players

    const selectLastItem = loadGame.carouselItem.querySelector<HTMLElement>('#onslPlayers')?.lastElementChild;
    Vitest.expect(selectLastItem?.getAttribute('selected')).toBeNull(); // Ensure it's not selected initially 
    await selectLastItem?.dispatchEvent(new Event('click', { bubbles: true }));

    Vitest.vi.waitFor(() => {
        Vitest.expect(selectLastItem?.classList).toContain('selected');
    },
        { timeout: 1000000 }
    );

    Vitest.vi.waitFor(() => {
        Vitest.expect(navControllerMock.onLoadGameButtonClick).toHaveBeenCalledTimes(1);
        Vitest.expect(navControllerMock.onLoadGameButtonClick).toHaveBeenCalledWith("player2@example.com");
    });

    // simulate clicking on the list, but not the item
    loadGame.carouselItem.querySelector<HTMLElement>('#onslPlayers')?.dispatchEvent(new Event('click', { bubbles: true }));
    // ... in that case the prior selected item should still be selected, and the navController should not be called again
    Vitest.vi.waitFor(() => {
        Vitest.expect(navControllerMock.onLoadGameButtonClick).toHaveBeenCalledTimes(1);
        Vitest.expect(selectLastItem?.classList).toContain('selected');
    });
});

Vitest.test('LoadGame should handle delete icon click', async () => {
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

    const allPlayersListMock = Vitest.vi.spyOn(AllPlayersList, 'renderAllPlayersList');

    const loadGame = await LoadGame.create(navControllerMock as any, playerServiceMock as any);
    Vitest.expect(loadGame).not.toBeNull();
    Vitest.expect(allPlayersListMock).not.toHaveBeenCalled(); // Ensure that renderAllPlayersList is not called during initialization

    Vitest.expect(loadGame.carouselItem.querySelector<HTMLElement>(".delete-icon")).toBeNull(); // Ensure the delete icon is not present initially

    loadGame.loadPlayers(); // Load players to render the list with delete icons
    Vitest.expect(loadGame.carouselItem.querySelector<HTMLElement>(".delete-icon")).not.toBeNull(); // Ensure the delete icon is present after loading players
    loadGame.carouselItem.querySelector<HTMLElement>(".delete-icon")?.dispatchEvent(new Event('click', { bubbles: true }));

    Vitest.expect(navControllerMock.onDeleteGame).toHaveBeenCalledWith("player1@example.com");
});