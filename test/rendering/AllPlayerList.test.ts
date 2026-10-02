import * as Vitest from 'vitest';

import AllPlayersList from '../../www/ts/rendering/AllPlayersList';
import Players from '../../www/ts/Players';
import Player from '../../www/ts/Player';

const playerListElement = document.createElement("select") as HTMLSelectElement;
Vitest.beforeEach(() => {
    playerListElement.appendChild(document.createElement("option")); // Add a placeholder option
});

Vitest.test("renderAllPlayersList should render player options correctly", () => {
    const players = ["one", "two", "three"];
    AllPlayersList.renderAllPlayersList(playerListElement, players);

    // first item is the placeholder, so we expect 4 items in total
    Vitest.expect(playerListElement.length).toBe(4);
    Vitest.expect(playerListElement.options[1].value).toBe("one");
    Vitest.expect(playerListElement.options[2].value).toBe("two");
    Vitest.expect(playerListElement.options[3].value).toBe("three");

    const newPlayers = ["four", "five"];
    AllPlayersList.renderAllPlayersList(playerListElement, newPlayers);

    // first item is the placeholder, so we expect 3 items in total
    Vitest.expect(playerListElement.length).toBe(3);
    Vitest.expect(playerListElement.options[1].value).toBe("four");
    Vitest.expect(playerListElement.options[2].value).toBe("five");
});

Vitest.test("renderAllPlayersList2 should render player list items correctly", () => {
    const players = ["one", "two", "three"];
    const playerServiceMock = {
        loadPlayers: Vitest.vi.fn((email: string) => {
            const players = Player.getDefaultPlayer();
            players.name = email; // Use email as name for testing
            players.email = email;
            return { players: [players], currentScreen: "TestScreen" };
        }),
    }

    const temp = document.createElement('div') as HTMLDivElement;

    const createElementSpy = Vitest.vi.spyOn(document, 'createElement');

    AllPlayersList.renderAllPlayersList2(temp, players, playerServiceMock as any);

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

Vitest.test("renderAllPlayersList2 should handle missing players gracefully", () => {
    const players = ["one", "two"];
    const playerServiceMock = {
        loadPlayers: Vitest.vi.fn((email: string) => {
            return null; // Simulate missing players
        }),
    }
    const temp = document.createElement('div') as HTMLDivElement;

    temp.appendChild(document.createElement("div")); // Add a placeholder item
    temp.appendChild(document.createElement("div")); // and another one to ensure we have more than one child

    const consoleErrorSpy = Vitest.vi.spyOn(console, 'error').mockImplementation(() => { });

    AllPlayersList.renderAllPlayersList2(temp, players, playerServiceMock as any);

    Vitest.expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
});
