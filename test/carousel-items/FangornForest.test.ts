import * as Vitest from "vitest";
import FangornForest, { NavCtrlPicker } from "../../www/ts/carousel-items/FangornForest";
import currentGameState from '../../www/ts/GameState';
import Party from "../../www/ts/Party";
import Player from "../../www/ts/Player";

let mockNavController: NavCtrlPicker;
let mockPlayerService: any;
let mockTemplateGameTasks: any;
let mockCurrentGameState: any;
let mockOns: any;
const players = new Party();
Vitest.beforeEach(() => {
    mockNavController = {
        // createNextChallenge: Vitest.vi.fn(),
        createNextChallenge: Vitest.vi.fn().mockImplementation(() => {
            const mockLake = {
                constructor: { name: "Lake" }
            }
            return mockLake;
        })
        // Define the mock implementation for the navController
        // You can add methods and properties as needed for your tests
    };
    mockPlayerService = {
        // Define the mock implementation for the playerService
        // You can add methods and properties as needed for your tests
    };
    mockTemplateGameTasks = {
        // Define the mock implementation for the templateGameTasks
        // You can add methods and properties as needed for your tests
    };
    Vitest.vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
        const forest = await import('../../www/views/forest.html?raw');
        return new Response(forest.default);
    });

    mockOns = {
        createElement: Vitest.vi.fn((html: string) => {
            const template = document.createElement('template');
            template.innerHTML = html.trim();
            return template.content.firstElementChild as HTMLElement;
        })
    };
    Vitest.vi.stubGlobal('ons', mockOns);

    mockCurrentGameState = {
        getPlayers: Vitest.vi.fn(() => {
            if (players.players.length > 0) {
                return players;
            }
            players.addPlayer(Player.createRandomPlayer());
            return players;
        }),
    };
    Vitest.vi.spyOn(currentGameState, 'getPlayers').mockImplementation(mockCurrentGameState.getPlayers);
});

Vitest.afterEach(() => {
    players.players = [];
    Vitest.vi.restoreAllMocks();
});

Vitest.test("setupNextChallenge should return a challenge type", async () => {
    const fangornForest = await FangornForest.create(mockNavController, mockPlayerService, mockTemplateGameTasks);

    Vitest.expect(fangornForest).toBeInstanceOf(FangornForest);
    Vitest.expect(mockOns.createElement).toHaveBeenCalled();
    Vitest.expect(mockCurrentGameState.getPlayers).toHaveBeenCalled();
});

Vitest.test.each([
    ["hp"],
    ["mp"]
] as const)("registerEvents should set up event listeners for %s button", async (healthType) => {
    // Vitest.test("registerEvents should set up event listeners for buttons", async () => {
    const fangornForest = await FangornForest.create(mockNavController, mockPlayerService, mockTemplateGameTasks);

    const btnAskForHP = fangornForest.carouselItem.querySelector("#btnAskForHP");
    const btnAskForMP = fangornForest.carouselItem.querySelector("#btnAskForMP");

    const currentHpPoints: number[] = [...players.players].map(player => player[healthType]);

    switch (healthType) {
        case "hp":
            await btnAskForHP?.dispatchEvent(new Event("click"));
            break;
        case "mp":
            await btnAskForMP?.dispatchEvent(new Event("click"));
            break;
        default:
            throw new Error(`Unknown health type: ${healthType}`);
    }

    await btnAskForHP?.dispatchEvent(new Event("click"));

    // Verify that the player's HP has increased and the next challenge is set up
    const updatedHpPoints = [...players.players].map(player => player[healthType]);
    Vitest.expect(updatedHpPoints.length).toBe(currentHpPoints.length);
    updatedHpPoints.every((value, index) => {
        Vitest.expect(value).toBeGreaterThanOrEqual(currentHpPoints[index]);
    });

    Vitest.expect(mockNavController.createNextChallenge).toHaveBeenCalled();

    // buttons are greyed out after clicking
    Vitest.expect(btnAskForHP?.hasAttribute("disabled")).toBe(true);
    Vitest.expect(btnAskForMP?.hasAttribute("disabled")).toBe(true);

    const informHealthBoost = fangornForest.carouselItem.querySelector("#pForestResult")?.textContent;
    Vitest.expect(informHealthBoost).toContain("Congratulation!");

    const hpValues = fangornForest.carouselItem.querySelectorAll(`ons-list-item[data-property="${healthType}"]`);
    Vitest.expect(hpValues.length).toBe(players.players.length);
    hpValues.forEach((item) => {
        Vitest.expect(item.classList.contains("row-flash")).toBe(true);
    });

    const carouselItemReplace = Vitest.vi.spyOn(fangornForest.carouselItem, 'replaceWith');

    const goToNextChallengeBtn = fangornForest.carouselItem.querySelector("#btnGoToNextChallenge");

    Vitest.expect(goToNextChallengeBtn).not.toBeNull();
    Vitest.expect(["Lake", "Bridge", "Mountain"]).toContain(goToNextChallengeBtn?.textContent);

    goToNextChallengeBtn?.dispatchEvent(new Event("click"));
    // Vitest.vi.waitFor(() => {
    //     Vitest.expect(carouselItemReplace).toHaveBeenCalled();
    // });
    Vitest.expect(carouselItemReplace).toHaveBeenCalledOnce();

});