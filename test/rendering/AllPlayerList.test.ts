import * as Vitest from 'vitest';

import AllPlayersList from '../../www/ts/rendering/AllPlayersList';
import Party from '../../www/ts/Party';
import Player from '../../www/ts/Player';
import currentGameState from '../../www/ts/GameState';

const playerListElement = document.createElement("select") as HTMLSelectElement;
Vitest.beforeEach(() => {
    playerListElement.appendChild(document.createElement("option")); // Add a placeholder option
});

Vitest.test("renderSavedGameList should render player list items correctly", () => {
    const names = ["one", "two", "three"];
    const playerServiceMock = {
        loadParty: Vitest.vi.fn((email: string) => {
            const players = new Party();
            players.addPlayer(new Player(email, email));
            players.currentScreen = "TestScreen";
            return players;
        }),
        listPartyFromStorage: Vitest.vi.fn(() => names),
    }
    Vitest.vi.spyOn(currentGameState, 'getParty').mockReturnValue({
        players: [new Player("one", "one")]
    } as Party);
    HTMLElement.prototype.scrollIntoView = Vitest.vi.fn(); // Mock scrollIntoView to avoid errors in test environment

    const temp = document.createElement('div') as HTMLDivElement;

    const createElementSpy = Vitest.vi.spyOn(document, 'createElement');

    AllPlayersList.renderSavedGameList(temp, playerServiceMock as any);

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

Vitest.test("renderSavedGameList should handle missing players gracefully", () => {
    const players = ["one", "two"];
    const playerServiceMock = {
        loadParty: Vitest.vi.fn((email: string) => {
            return null; // Simulate missing players
        }),
        listPartyFromStorage: Vitest.vi.fn(() => players),
    }
    const temp = document.createElement('div') as HTMLDivElement;

    temp.appendChild(document.createElement("div")); // Add a placeholder item
    temp.appendChild(document.createElement("div")); // and another one to ensure we have more than one child

    const consoleErrorSpy = Vitest.vi.spyOn(console, 'error').mockImplementation(() => { });

    AllPlayersList.renderSavedGameList(temp, playerServiceMock as any);

    Vitest.expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
});
