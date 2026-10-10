import * as Vitest from "vitest";
import Welcome from "../../www/ts/carousel-items/Welcome";
import must from "../../www/ts/utilities/RequiredField";

import welcomeHtml from "../../www/views/welcome.html?raw";
let navControllerMock: any;
let playerServiceMock: any;

Vitest.beforeAll(async () => {
    // Set up the DOM environment for testing
    Vitest.vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
        if (url.toString().endsWith("welcome.html")) {
            return new Response(welcomeHtml);
        }
        throw new Error("DOM environment setup is not implemented yet.");
    });

    navControllerMock = {
        onCarouselNewGame: Vitest.vi.fn(),
        onReloadButtonClick: Vitest.vi.fn()
    }

    Vitest.vi.stubGlobal("ons", {
        createElement: (html: string) => {
            const template = document.createElement("template");
            template.innerHTML = html.trim();
            return template.content.firstElementChild as HTMLElement;
        }
    });

    playerServiceMock = {
        listPlayersFromStorage: Vitest.vi.fn(() => ["a", "b", "c"]),
    }
});

Vitest.test("Welcome should be properly initialized", async () => {
    const welcome = await Welcome.create(navControllerMock, playerServiceMock);

    //setup
    const carousselItem = welcome.carouselItem;
    const reloadButton = must(carousselItem.querySelector("#btnReload") as HTMLButtonElement);

    // there are list of player setup in playerServiceMock, so the reload button should be enabled
    Vitest.expect(reloadButton.getAttribute("disabled")).toBeNull();

    Vitest.expect(welcome).not.toBeNull();
    Vitest.expect(welcome.carouselItem).not.toBeNull();

    (welcome.carouselItem.querySelector("#btnNewGame") as HTMLButtonElement).click();
    Vitest.expect(navControllerMock.onCarouselNewGame).toHaveBeenCalled();

    (welcome.carouselItem.querySelector("#btnReload") as HTMLButtonElement).click();
    Vitest.expect(navControllerMock.onReloadButtonClick).toHaveBeenCalled();

    (welcome.carouselItem).click();
    Vitest.expect(navControllerMock.onCarouselNewGame).not.toHaveBeenCalledTimes(2);
    Vitest.expect(navControllerMock.onReloadButtonClick).not.toHaveBeenCalledTimes(2);
});

Vitest.test("Welcome should disable reload button when no players in storage", async () => {
    // Mock the playerService to return an empty list of players
    playerServiceMock.listPlayersFromStorage = Vitest.vi.fn(() => []);
    const welcome = await Welcome.create(navControllerMock, playerServiceMock);

    //setup
    const carousselItem = welcome.carouselItem;
    const reloadButton = must(carousselItem.querySelector("#btnReload") as HTMLButtonElement);

    // there are no players in storage, so the reload button should be disabled
    Vitest.expect(reloadButton.getAttribute("disabled")).toBe("true");
});