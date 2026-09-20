import * as Vitest from 'vitest';

import AllPlayersList from '../../www/ts/rendering/AllPlayersList';

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