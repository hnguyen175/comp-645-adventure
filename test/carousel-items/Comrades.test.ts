import * as Vitest from "vitest";
import Comrades from "../../www/ts/carousel-items/Comrades";
import Player from "../../www/ts/Player";
import Players from "../../www/ts/Players";
import AllPlayersList from "../../www/ts/rendering/AllPlayersList";

const comradesHtml = "../../www/views/players.html?raw";

Vitest.beforeAll(async () => {
    // Mock the fetch function to return the HTML content for the specified URLs
    Vitest.vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
        if (url.toString().endsWith("../views/players.html")) {
            const comrades = await import(comradesHtml);
            return new Response(comrades.default);
        }
        throw new Error(`Unexpected URL: ${url}`);
    });

    Vitest.vi.stubGlobal("ons", {
        createElement: (html: string) => {
            const template = document.createElement("template");
            template.innerHTML = html.trim();
            return template.content.firstElementChild as HTMLElement;
        },
    });

});

const navControllerMock = {
    onGameStart: Vitest.vi.fn(),
};

Vitest.test("Comrades should be properly initialized", async () => {
    const comrades = await Comrades.create(navControllerMock as any);
    Vitest.expect(comrades).not.toBeNull();
});

Vitest.test("Clicking on the start game button should call onGameStart", async () => {
    const comrades = await Comrades.create(navControllerMock as any);
    const startGameButton = comrades.getCarouselItem().querySelector<HTMLElement>("#btnStartGame");
    Vitest.expect(startGameButton).not.toBeNull();

    await startGameButton?.dispatchEvent(new Event("click", { bubbles: true }));

    Vitest.expect(navControllerMock.onGameStart).toHaveBeenCalled();
});

Vitest.test("Clicking on the list but not the start game button should not call onGameStart", async () => {
    const comrades = await Comrades.create(navControllerMock as any);
    const div = comrades.getCarouselItem().querySelector<HTMLElement>("#playerCards");
    Vitest.expect(div).not.toBeNull();
    await div?.dispatchEvent(new Event("click", { bubbles: true }));

    Vitest.expect(navControllerMock.onGameStart).not.toHaveBeenCalled();
});