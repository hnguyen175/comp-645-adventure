import * as Vitest from 'vitest';
import DrunkenTavern from '../../www/ts/carousel-items/DrunkenTavern';
import must from '../../www/ts/utilities/RequiredField';
import Players from '../../www/ts/Players';
import Player from '../../www/ts/Player';
import currentGameState from '../../www/ts/GameState';
import PlayerService from '../../www/ts/PlayerService';
import TemplateGameTasks from '../../www/ts/templates/TemplateGameTasks';

const drunkenTavernHtml = '../../www/views/drunken-tavern.html?raw';

type ChallengeMock = {
    outcome: "win" | "lose" | "winWithLuck" | "loseWithLuck" | "tie";
}

let playerService: PlayerService = null as unknown as PlayerService;
let gameStateMock: unknown;
let templateFragmentMock: unknown;

Vitest.beforeAll(async () => {
    // Mock the fetch function to return the HTML content for the specified URLs
    Vitest.vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
        if (url.toString().endsWith("../views/drunken-tavern.html")) {
            const drunkenTavern = await import(drunkenTavernHtml);
            return new Response(drunkenTavern.default);
        }
        throw new Error(`Unexpected URL: ${url}`);
    });

    Vitest.vi.stubGlobal('ons', {
        createElement: (html: string) => {
            const template = document.createElement('template');
            template.innerHTML = html.trim();
            return template.content.firstElementChild as HTMLElement;
        }
    });
    playerService = new PlayerService();

    gameStateMock = Vitest.vi.spyOn(currentGameState, 'getPlayers').mockImplementation(() => {
        const players = new Players();
        players.addPlayer(Player.createRandomPlayer());

        playerService.savePlayers(players.players[0].name, players.players[0].email);
        const villain = playerService.createVillain();

        return players;
    });

    templateFragmentMock = Vitest.vi.spyOn(TemplateGameTasks.prototype, 'templateFragment', 'get').mockImplementation(() => {
        document.body.innerHTML = /*html*/ `
            <html>
                <template id="templ8GameTasks">
                </template>
            </html>
        `;
        const template = must(document.querySelector<HTMLTemplateElement>("#templ8GameTasks"));
        return template.content.cloneNode(true) as DocumentFragment;
    });
});

Vitest.test('DrunkenTavern should be properly initialized', async () => {
    const dkt = await DrunkenTavern.create(templateFragmentMock as unknown as TemplateGameTasks);
    Vitest.expect(dkt).not.toBeNull();
    Vitest.expect(dkt.carouselItem).not.toBeNull();
});

Vitest.test('DrunkenTavern should handle click events on challenge buttons', async () => {
    const dkt = await DrunkenTavern.create(templateFragmentMock as unknown as TemplateGameTasks);
    dkt.initializePage();

    Vitest.expect(dkt).not.toBeNull();
    Vitest.expect(dkt.carouselItem).not.toBeNull();

    const btnSTR = must(dkt.carouselItem.querySelector<HTMLElement>('#btnSTR'));
    Vitest.expect(btnSTR).not.toBeNull();

    btnSTR.click();
    Vitest.expect(gameStateMock).toHaveBeenCalledTimes(1);
    Vitest.expect(currentGameState.getDtkVillain()).not.toBeNull();
    Vitest.expect(currentGameState.getPlayers()).not.toBeNull();
});

Vitest.test('DrunkenTavern should handle click events when clicked element is not a challenge button', async () => {
    const dkt = await DrunkenTavern.create(templateFragmentMock as unknown as TemplateGameTasks);
    Vitest.expect(dkt).not.toBeNull();
    Vitest.expect(dkt.carouselItem).not.toBeNull();
    const nonButtonElement = must(dkt.carouselItem.querySelector<HTMLElement>('#divDrunkenTavernVillain'));

    const gameStateMock = Vitest.vi.spyOn(currentGameState, 'getPlayers').mockImplementation(() => {
        return null; // This should not be called in this test
    });

    nonButtonElement.click();

    Vitest.expect(gameStateMock).not.toHaveBeenCalled();
});

function mockScenario(challengeMock: ChallengeMock) {
    gameStateMock = Vitest.vi.spyOn(currentGameState, 'getPlayers').mockImplementation(() => {
        const players = new Players();
        const player = Player.createRandomPlayer();
        players.addPlayer(player);

        if (challengeMock.outcome === "win") {
            player.mp = 100;
            player.str = 100;
            player.spd = 100;
        } else if (challengeMock.outcome === "lose") {
            player.mp = 10;
            player.str = 10;
            player.spd = 10;
        } else if (challengeMock.outcome === "winWithLuck" || challengeMock.outcome === "loseWithLuck") {
            player.mp = 50;
            player.str = 50;
            player.spd = 50;
            if (challengeMock.outcome === "winWithLuck") {
                player.luk = 100;
            } else {
                player.luk = 1;
            }
        } else if (challengeMock.outcome === "tie") {
            player.mp = 50;
            player.str = 50;
            player.spd = 50;
            player.luk = 50;
        }

        playerService.savePlayers(players.players[0].name, players.players[0].email);

        const villain = playerService.createVillain();
        villain.mp = 50;
        villain.str = 50;
        villain.spd = 50;
        villain.luk = 50;

        currentGameState.setDtkVillain(villain);

        return players;
    });
}

Vitest.test.each([
    [() => mockScenario({ outcome: "lose" }), "str"],
    [() => mockScenario({ outcome: "win" }), "str"],
    [() => mockScenario({ outcome: "lose" }), "spd"],
    [() => mockScenario({ outcome: "win" }), "spd"],
    [() => mockScenario({ outcome: "lose" }), "mp"],
    [() => mockScenario({ outcome: "win" }), "mp"],
    [() => mockScenario({ outcome: "winWithLuck" }), "str"],
    [() => mockScenario({ outcome: "loseWithLuck" }), "str"],
    [() => mockScenario({ outcome: "winWithLuck" }), "spd"],
    [() => mockScenario({ outcome: "loseWithLuck" }), "spd"],
    [() => mockScenario({ outcome: "winWithLuck" }), "mp"],
    [() => mockScenario({ outcome: "loseWithLuck" }), "mp"],
] as const)('DrunkenTavern challenge button click should handle %s', async (setupScenario, attribute) => {
    setupScenario();
    const dkt = await DrunkenTavern.create(templateFragmentMock as unknown as TemplateGameTasks);

    const btnStrength = must(dkt.carouselItem.querySelector<HTMLElement>(`#btn${attribute.toUpperCase()}`));
    Vitest.expect(btnStrength).not.toBeNull();

    const mockDktQuerySelector = Vitest.vi.spyOn(dkt.carouselItem, 'querySelector');
    const htmlElementMock = must(dkt.carouselItem.querySelector<HTMLElement>('#divDrunkenTavernChallenge'));

    btnStrength.click();

    Vitest.expect(mockDktQuerySelector).toHaveBeenCalledWith('#divDrunkenTavernChallenge');
    Vitest.expect(document.getElementById("divDrunkenTavernChallenge")?.textContent).not.toBe("");
    Vitest.expect(must(dkt.carouselItem.querySelector("#btnSTR")).hasAttribute("disabled")).toBe(true);
    Vitest.expect(dkt.carouselItem.querySelector<HTMLButtonElement>("#btnSPD")?.hasAttribute("disabled")).toBe(true);
    Vitest.expect(dkt.carouselItem.querySelector<HTMLButtonElement>("#btnMP")?.hasAttribute("disabled")).toBe(true);
});

Vitest.test('Tie scenario user can try their luk 3 times', async () => {
    mockScenario({ outcome: "tie" });
    const dkt = await DrunkenTavern.create(templateFragmentMock as unknown as TemplateGameTasks);

    const mockDktQuerySelector = Vitest.vi.spyOn(dkt.carouselItem, 'querySelector');
    const htmlElementMock = must(dkt.carouselItem.querySelector<HTMLElement>('#divDrunkenTavernChallenge'));

    let btnName: string;
    for (let i = 0; i < 3; i++) {
        switch (i) {
            case 0:
                btnName = '#btnSTR';
                break;
            case 1:
                btnName = '#btnSPD';
                break;
            case 2:
                btnName = '#btnMP';
                break;
            default:
                throw new Error("Invalid button index");
        }
        const btnStrength = must(dkt.carouselItem.querySelector<HTMLElement>(btnName));

        Vitest.expect(btnStrength.hasAttribute("disabled")).toBe(false);
        btnStrength.click();

        Vitest.expect(mockDktQuerySelector).toHaveBeenCalledWith('#divDrunkenTavernChallenge');
        Vitest.expect(document.getElementById("divDrunkenTavernChallenge")?.textContent).not.toBe("");


        switch (i) {
            case 0:
                Vitest.expect(must(dkt.carouselItem.querySelector("#btnSTR")).hasAttribute("disabled")).toBe(true);
                Vitest.expect(must(dkt.carouselItem.querySelector("#btnSPD")?.hasAttribute("disabled"))).toBe(false);
                Vitest.expect(must(dkt.carouselItem.querySelector("#btnMP")?.hasAttribute("disabled"))).toBe(false);
                break;
            case 1:
                Vitest.expect(must(dkt.carouselItem.querySelector("#btnSTR")?.hasAttribute("disabled"))).toBe(true);
                Vitest.expect(must(dkt.carouselItem.querySelector("#btnSPD")).hasAttribute("disabled")).toBe(true);
                Vitest.expect(must(dkt.carouselItem.querySelector("#btnMP")?.hasAttribute("disabled"))).toBe(false);
                break;
            case 2:
                Vitest.expect(must(dkt.carouselItem.querySelector("#btnSTR")?.hasAttribute("disabled"))).toBe(true);
                Vitest.expect(must(dkt.carouselItem.querySelector("#btnSPD")?.hasAttribute("disabled"))).toBe(true);
                Vitest.expect(must(dkt.carouselItem.querySelector("#btnMP")).hasAttribute("disabled")).toBe(true);
                break;
        }
    }
});