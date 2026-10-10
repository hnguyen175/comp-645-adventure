import * as Vitest from 'vitest';

import AllPlayersList from '../../www/ts/rendering/AllPlayersList';
import Players from '../../www/ts/Players';
import Player from '../../www/ts/Player';
import currentGameState from '../../www/ts/GameState';

const playerListElement = document.createElement("select") as HTMLSelectElement;
Vitest.beforeEach(() => {
    playerListElement.appendChild(document.createElement("option")); // Add a placeholder option
});

Vitest.test("renderAllPlayersList should render player list items correctly", () => {
    const names = ["one", "two", "three"];
    const playerServiceMock = {
        loadPlayers: Vitest.vi.fn((email: string) => {
            const players = new Players();
            players.addPlayer(Player.createRandomPlayer(email, email));
            players.currentScreen = "TestScreen";
            return players;
        }),
        listPlayersFromStorage: Vitest.vi.fn(() => names),
    }
    Vitest.vi.spyOn(currentGameState, 'getPlayers').mockReturnValue({
        players: [Player.createRandomPlayer("one", "one")]
    } as Players);
    HTMLElement.prototype.scrollIntoView = Vitest.vi.fn(); // Mock scrollIntoView to avoid errors in test environment

    const temp = document.createElement('div') as HTMLDivElement;

    const createElementSpy = Vitest.vi.spyOn(document, 'createElement');

    AllPlayersList.renderAllPlayersList(temp, playerServiceMock as any);

    const rows = [...temp.querySelectorAll("ons-list-item")].map(row => ({
        name: row.getAttribute("data-email"),
        values: [...row.querySelectorAll(".player-row > div")].map(cell => cell.innerHTML)
    }));

    const imageElement = '<img src=\"images/trash.svg\" alt=\"Delete\" class=\"delete-icon\">';
    Vitest.expect(rows).toEqual([
        { name: "one", values: ["one", "one", "TestScreen", imageElement] },
        { name: "two", values: ["two", "two", "TestScreen", imageElement] },
        { name: "three", values: ["three", "three", "TestScreen", imageElement] }
    ]);
});

Vitest.test("renderAllPlayersList should handle missing players gracefully", () => {
    const players = ["one", "two"];
    const playerServiceMock = {
        loadPlayers: Vitest.vi.fn((email: string) => {
            return null; // Simulate missing players
        }),
        listPlayersFromStorage: Vitest.vi.fn(() => players),
    }
    const temp = document.createElement('div') as HTMLDivElement;

    temp.appendChild(document.createElement("div")); // Add a placeholder item
    temp.appendChild(document.createElement("div")); // and another one to ensure we have more than one child

    const consoleErrorSpy = Vitest.vi.spyOn(console, 'error').mockImplementation(() => { });

    AllPlayersList.renderAllPlayersList(temp, playerServiceMock as any);

    Vitest.expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
});
