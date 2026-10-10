import * as Vitest from "vitest";
import NewGame from "../../www/ts/carousel-items/NewGame";
import newGameHtml from "../../www/views/new-game.html?raw";

let fetchSpy: any;

Vitest.beforeAll(async () => {
    // Set up the DOM environment for testing
    fetchSpy = Vitest.vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
        if (url.toString().endsWith("new-game.html")) {
            return new Response(newGameHtml);
        }

        throw new Error("DOM environment setup is not implemented yet.");
    });

    Vitest.vi.stubGlobal("ons", {
        createElement: (html: string) => {
            const template = document.createElement("template");
            template.innerHTML = html.trim();
            return template.content.firstElementChild as HTMLElement;
        }
    });
});

Vitest.test("NewGame should be properly initialized", async () => {
    const navControllerMock = {
        onRollButtonClick: Vitest.vi.fn(),
        emptyInput: Vitest.vi.fn((inputField: string) => { })
    }

    const newGame = await NewGame.create(navControllerMock as any);
    Vitest.expect(newGame).not.toBeNull();

    (newGame.carouselItem.querySelector("#btnRoll") as HTMLButtonElement).click();
    Vitest.expect(navControllerMock.onRollButtonClick).toHaveBeenCalled();

    const newGameEmptyInputSpy = Vitest.vi.spyOn(newGame, "emptyInput");
    (newGame.carouselItem.querySelector("#btnClearName") as HTMLButtonElement).click();
    Vitest.expect(newGameEmptyInputSpy).toHaveBeenCalledWith("onsPlayerName");

    (newGame.carouselItem.querySelector("#btnClearEmail") as HTMLButtonElement).click();
    Vitest.expect(newGameEmptyInputSpy).toHaveBeenCalledWith("onsPlayerEmail");
});

Vitest.test("NewGame should not throw error when emptyInput is called with non-existing input field", async () => {
    const navControllerMock = {
        onRollButtonClick: Vitest.vi.fn(),
    }

    Vitest.vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
        if (url.toString().endsWith("new-game.html")) {
            return new Response(
                `<ons-carousel-item id="caiNewGame">
                    <ons-button id="btnClearName" class="btn" modifier="quiet">x</ons-button>
                    <ons-button id="btnClearEmail" class="btn" modifier="quiet">x</ons-button>
            </ons-carousel-item>`
            );
        }

        throw new Error("DOM environment setup is not implemented yet.");
    });

    const newGame = await NewGame.create(navControllerMock as any);
    const newGameEmptyInputSpy = Vitest.vi.spyOn(newGame, "emptyInput");

    Vitest.expect(newGame).not.toBeNull();

    (newGame.carouselItem.querySelector("#btnClearName") as HTMLButtonElement).click();
    Vitest.expect(newGameEmptyInputSpy).toHaveBeenCalledWith("onsPlayerName");

    (newGame.carouselItem.querySelector("#btnClearEmail") as HTMLButtonElement).click();
    Vitest.expect(newGameEmptyInputSpy).toHaveBeenCalledWith("onsPlayerEmail");
});

Vitest.test("NewGame should throw error when loadElement fails", async () => {
    fetchSpy.mockRestore(); // Restore the original fetch implementation
    const navControllerMock = {
        onRollButtonClick: Vitest.vi.fn(),
    }

    // Simulate a failed fetch
    // Vitest.vi.spyOn(globalThis, 'fetch').mockResolvedValue(null as any);

    await Vitest.expect(NewGame.create(navControllerMock as any)).rejects.toThrow(
        "Failed to parse URL from ../views/new-game.html");
});