/// <reference types="vite/client" />

import * as Vitest from 'vitest';
import NavController from '../www/ts/NavController';
import PlayerService from '../www/ts/PlayerService';
import Players from '../www/ts/Players';
import Player from '../www/ts/Player';
import PlayerView from '../www/ts/rendering/PlayerView';
import type { OnsCarouselElement as CarouselElement } from '../www/lib/onsenui';

import loadGameHtml from '../www/views/load-game.html?raw';
import newGameHtml from '../www/views/new-game.html?raw';
import playersHtml from '../www/views/comrades.html?raw';
import welcomeHtml from '../www/views/welcome.html?raw';
import drunkenTavernHtml from '../www/views/drunken-tavern.html?raw';
import currentGameState from '../www/ts/GameState';

const toastMock = Vitest.vi.fn().mockResolvedValue(undefined);

let navController: NavController = null as unknown as NavController;
let playerService: PlayerService = null as unknown as PlayerService;
let playerView: PlayerView = null as unknown as PlayerView;

Vitest.beforeEach(async () => {
    playerService = new PlayerService();
    playerView = new PlayerView();
    navController = new NavController(playerService, playerView);

    Vitest.vi.stubGlobal('ons', {
        notification: {
            toast: toastMock
        }
    });

    // Clear the document body before each test
    document.body.innerHTML = '';
    localStorage.clear();

    Vitest.vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
        if (url === "../views/new-game.html") {
            return new Response(newGameHtml);
        }
        if (url === "../views/load-game.html") {
            return new Response(loadGameHtml);
        }
        if (url === "../views/comrades.html") {
            return new Response(playersHtml);
        }
        if (url === "../views/welcome.html") {
            return new Response(welcomeHtml);
        }
        if (url === "../views/drunken-tavern.html") {
            return new Response(drunkenTavernHtml);
        }

        throw new Error(`Unexpected fetch URL: ${url}`);
    });
    Vitest.vi.stubGlobal("ons", {
        createElement: Vitest.vi.fn((htmlString: string) => {
            const template = document.createElement("template");
            template.innerHTML = htmlString.trim();
            return template.content.firstElementChild! as HTMLElement;
        })
    });

});

Vitest.test("showSection displays the correct section and hides others", () => {
    // Create mock sections
    const section1 = document.createElement('section');
    section1.id = 'section1';
    section1.style.display = 'none';
    document.body.appendChild(section1);

    const section2 = document.createElement('section');
    section2.id = 'section2';
    section2.style.display = 'none';
    document.body.appendChild(section2);

    // Call the function
    NavController.showSection('section1');

    // Assert the correct behavior
    Vitest.expect(section1.style.display).toBe('block');
    Vitest.expect(section2.style.display).toBe('none');
});

Vitest.test("showSection logs an error if no sections are found", () => {
    // Spy on console.error
    const consoleErrorSpy = Vitest.vi.spyOn(console, 'error').mockImplementation(() => { });
    NavController.showSection('section1');
    Vitest.expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
});

Vitest.test("onCarouselPriorDisplayingItem prior displaying players", () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        <ons-carousel-item id="caiWelcome">
        </ons-carousel-item>
        <ons-carousel-item id="caiComrades">
        <ons-card id="playerCards"></ons-card>
        </ons-carousel-item>
        </ons-carousel>

        <input type="text" id="inputPlayerName" value="John Doe" />
        <input type="text" id="inputPlayerEmail" value="john.doe@example.com" />
    `;

    const carousel = document.getElementById("carouselNewGame") as unknown as HTMLElement;

    const event = new Event('prechange');
    Object.assign(event, {
        carousel,
        activeIndex: 1,
    });

    const playerServiceSpy = Vitest.vi.spyOn(currentGameState, 'getPlayers').mockImplementation(() => {
        return new Players();
    });

    const renderPlayerCardsSpy = Vitest.vi.spyOn(playerView, 'renderPlayerCards').mockImplementation(() => { });

    navController.onCarouselPriorDisplayingItem(event);

    Vitest.expect(renderPlayerCardsSpy).toHaveBeenCalledOnce();
});

Vitest.test("onCarouselPriorDisplayingItem prior displaying players with no active players", async () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        <ons-carousel-item id="caiWelcome">
        </ons-carousel-item>
        <ons-carousel-item id="caiComrades">
        <ons-card id="playerCards"></ons-card>
        </ons-carousel-item>
        </ons-carousel>
`;
    const carousel = document.getElementById("carouselNewGame") as unknown as HTMLElement;
    const event = new Event('prechange');
    Object.assign(event, {
        carousel,
        activeIndex: 1,
    });

    const playerServiceSpy = Vitest.vi.spyOn(currentGameState, 'getPlayers').mockImplementation(() => {
        return null;
    });
    const renderPlayerCardsSpy = Vitest.vi.spyOn(playerView, 'renderPlayerCards').mockImplementation(() => { });


    await navController.onCarouselPriorDisplayingItem(event).catch((error) => {
        Vitest.expect(error.message).toBe("required value was not found");
        Vitest.expect(renderPlayerCardsSpy).not.toHaveBeenCalled();
    });
});

Vitest.test("onCarouselPriorDisplayingItem prior displaying Welcome", async () => {
    document.body.innerHTML = /*html*/ `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        <ons-carousel-item id="caiWelcome">
        </ons-carousel-item>
        <ons-carousel-item id="caiComrades">
        </ons-carousel-item>
        </ons-carousel>

        <input type="text" id="inputPlayerName" value="John Doe" />
        <input type="text" id="inputPlayerEmail" value="john.doe@example.com" />
        <template id="templ8GameTasks">
            <h4 style="text-align: center;" class="game-tasks">
                Game Tasks
            </h4>
        </template>
    `;
    await navController.init();

    const carousel = document.getElementById("carouselNewGame") as unknown as HTMLElement;

    const event = new Event('prechange');
    Object.assign(event, {
        carousel,
        activeIndex: 0,
    });

    Vitest.vi.spyOn(playerService, 'savePlayers').mockImplementation((name: string, email: string): Players => { return new Players(); });
    const consoleErrorSpy = Vitest.vi.spyOn(console, 'error').mockImplementation(() => { });

    navController.onCarouselPriorDisplayingItem(event);

    Vitest.expect(playerService.savePlayers).not.toHaveBeenCalled();
    Vitest.expect(consoleErrorSpy).not.toHaveBeenCalled();
});

Vitest.test("onCarouselPriorDisplayingItem prior displaying drunken tavern", async () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        <ons-carousel-item id="caiWelcome">
            <h1>Welcome</h1>
        </ons-carousel-item>
        <ons-carousel-item id="caiDrunkenTavern">
            <h1>Drunken Tavern</h1>
        </ons-carousel-item>
        </ons-carousel>
        <template id="templ8GameTasks">
            <h4 style="text-align: center;" class="game-tasks">
                Game Tasks
            </h4>
        </template>
    `;
    await navController.init();

    const carousel = document.getElementById("carouselNewGame") as unknown as HTMLElement;

    const event = new Event('prechange');
    Object.assign(event, {
        carousel,
        activeIndex: 1,
    });

    const mockPlayers = new Players();
    const playerServiceSpy = Vitest.vi.spyOn(currentGameState, 'getPlayers').mockImplementation(() => {
        return mockPlayers;
    });
    const renderPlayerCardsSpy = Vitest.vi.spyOn(playerView, 'renderPlayerCards')
        .mockImplementationOnce((carouselId: string, players: Player[], showStrength = true) => {
            Vitest.expect(carouselId).toBe("caiDrunkenTavern");
            Vitest.expect(players).toBe(mockPlayers.players);
            Vitest.expect(showStrength).toBe(true);
        })
        .mockImplementationOnce((carouselId: string, players: Player[], showStrength = false) => {
            Vitest.expect(carouselId).toBe("divDrunkenTavernVillain");
            Vitest.expect(players.length).toBe(1);
            Vitest.expect(showStrength).toBe(false);
        });

    await navController.onCarouselPriorDisplayingItem(event);
});

Vitest.test("onCarouselPriorDisplayingItem prior displaying load game", async () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        <ons-carousel-item id="caiWelcome">
            <h1>Welcome</h1>
        </ons-carousel-item>
        <ons-carousel-item id="caiLoadGame">
            <h1>load game</h1>
        </ons-carousel-item>
        </ons-carousel>
        <template id="templ8GameTasks">
            <h4 style="text-align: center;" class="game-tasks">
                Game Tasks
            </h4>
        </template>
    `;
    await navController.init();
    Vitest.expect(navController.loadGame).not.toBeNull();

    const carousel = document.getElementById("carouselNewGame") as unknown as HTMLElement;

    const event = new Event('prechange');
    Object.assign(event, {
        carousel,
        activeIndex: 1,
    });

    const mockLoadGame = Vitest.vi.spyOn(navController.loadGame, 'loadPlayers').mockImplementation(() => { });
    await navController.onCarouselPriorDisplayingItem(event);

    Vitest.expect(mockLoadGame).toHaveBeenCalledOnce();
});

Vitest.test("onCarouselNewGame navigates to next carousel item", async () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
            <ons-carousel-item id="caiWelcome">
                <h1>Welcome</h1>
            </ons-carousel-item>
        </ons-carousel>
        <ons-button class="btn js-load-game" id="btnNewGame">New Game</ons-button>
        <template id="templ8GameTasks">
            <h4 style="text-align: center;" class="game-tasks">
                Game Tasks
            </h4>
        </template>
        `;
    await navController.init();

    const carousel = document.getElementById("carouselNewGame") as unknown as CarouselElement;
    Object.defineProperties(carousel, {
        'getActiveIndex': {
            value: Vitest.vi.fn(() => 0),
        },
        'next': {
            value: Vitest.vi.fn(),
        }
    });

    await navController.loadCarouselItem([navController.newGame]);

    const btnNewGame = document.getElementById("btnNewGame") as unknown as HTMLElement;
    btnNewGame.addEventListener(
        "click",
        async () => navController.onCarouselNewGame()
    );

    await btnNewGame.click();

    Vitest.expect(carousel.next).toHaveBeenCalledOnce();
});

Vitest.test("Carousel element is not found during init throws an error", async () => {
    document.body.innerHTML = `
        <ons-card>
            <ons-button class="btn js-load-game" id="btnNewGame">New Game</ons-button>
        </ons-card>
        `;
    Vitest.vi.spyOn(console, 'error').mockImplementation(() => { });

    await Vitest.expect(navController.init()).rejects.toThrow("Carousel element not found.");
});

Vitest.test("onRollButtonClick with invalid player info shows toast notification", async () => {
    const playerViewMock = {
        showValidationToast: Vitest.vi.fn().mockResolvedValue(undefined)
    };
    const navController = new NavController(playerService, playerViewMock as unknown as PlayerView);

    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
            <ons-carousel-item id="caiWelcome">
                <h2>Welcome</h2>
            </ons-carousel-item>
            <ons-carousel-item id="caiComrades">
                <h2>Comrades</h2>
            </ons-carousel-item>
            <ons-carousel-item id="caiNewGame">
                <h2>New Game</h2>
            </ons-carousel-item>
        </ons-carousel>
        <ons-button class="btn js-roll" id="btnRoll">Roll</ons-button>
        <input id="inputPlayerName">
        <input id="inputPlayerEmail" value="john.doe.example.com">
        <template id="templ8GameTasks">
            <h4 style="text-align: center;" class="game-tasks">
                Game Tasks
            </h4>
        </template>
    `;

    await navController.init();

    await navController.onRollButtonClick();

    Vitest.expect(
        playerViewMock.showValidationToast.mock.calls.map(
            ([input, message]) => [input.id, message]
        )
    ).toEqual([
        ["inputPlayerName", "Player name is required."],
        ["inputPlayerEmail", "Invalid email format."]
    ]);
});

Vitest.test("onRollButtonClick with missing input fields logs an error and does not call toast", async () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>   
        <ons-carousel-item id="caiWelcome">
            <h2>Welcome</h2>
        </ons-carousel-item>
        <ons-carousel-item id="caiComrades">
            <h2>Players</h2>
        </ons-carousel-item>
        <ons-carousel-item id="caiNewGame">
            <h2>New Game</h2>
        </ons-carousel-item>
    </ons-carousel>
    <ons-button class="btn js-roll" id="btnRoll">Roll</ons-button>
    <template id="templ8GameTasks">
        <h4 style="text-align: center;" class="game-tasks">
            Game Tasks
        </h4>
    </template>
    `;

    await navController.init();

    const btnRoll = document.getElementById("btnRoll") as unknown as HTMLElement;
    btnRoll.addEventListener(
        "click",
        () => navController.onRollButtonClick()
    );

    Vitest.vi.spyOn(console, 'error').mockImplementation(() => { });

    btnRoll.click();

    Vitest.expect(console.error).toHaveBeenCalled();
    Vitest.expect(toastMock).not.toHaveBeenCalled();
});

Vitest.test.each([
    ["", "Player name is required.", "", "Player email is required."],
    ["", "Player name is required.", "john.doe", "Invalid email format."],
    ["name", "", "", "Player email is required."],
    ["", "Player name is required.", "a@b.c", ""]
])("onRollButtonClick with %s email and %s validation message shows appropriate toast", async (name, expectedNameMsg, email, expectedEmailMsg) => {
    const playerViewMock = {
        showValidationToast: Vitest.vi.fn().mockResolvedValue(undefined)
    };
    const navController = new NavController(playerService, playerViewMock as unknown as PlayerView);
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
            <ons-carousel-item id="caiWelcome">
                <h2>Welcome</h2>
            </ons-carousel-item>
            <ons-carousel-item id="caiComrades">
                <h2>Players</h2>
            </ons-carousel-item>
            <ons-carousel-item id="caiNewGame">
                <h2>New Game</h2>
            </ons-carousel-item>
        </ons-carousel>
        <ons-button class="btn js-roll" id="btnRoll">Roll</ons-button>
        <input id="inputPlayerName" value="${name}">
        <input id="inputPlayerEmail" value="${email}">
        <template id="templ8GameTasks">
            <h4 style="text-align: center;" class="game-tasks">
                Game Tasks
            </h4>
        </template>
    `;

    await navController.init();

    await navController.onRollButtonClick();

    if (expectedNameMsg) {
        await Vitest.expect(playerViewMock.showValidationToast).toHaveBeenCalledWith(
            document.getElementById("inputPlayerName"),
            expectedNameMsg
        );
    }

    if (expectedEmailMsg) {
        await Vitest.expect(playerViewMock.showValidationToast).toHaveBeenCalledWith(
            document.getElementById("inputPlayerEmail"),
            expectedEmailMsg
        );
    }
});

Vitest.test("onRollButtonClick with valid name and valid email shows no toast", async () => {
    const playerViewMock = {
        showValidationToast: Vitest.vi.fn().mockResolvedValue(undefined)
    };
    const navController = new NavController(playerService, playerViewMock as unknown as PlayerView);
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
            <ons-carousel-item id="caiWelcome">
                <h2>Welcome</h2>
            </ons-carousel-item>
            <ons-carousel-item id="caiComrades">
                <h2>Players</h2>
            </ons-carousel-item>
            <ons-carousel-item id="caiNewGame">
                <h2>New Game</h2>
            </ons-carousel-item>
        </ons-carousel>
        <ons-button class="btn js-roll" id="btnRoll">Roll</ons-button>
        <input id="inputPlayerName" value="John Doe">
        <input id="inputPlayerEmail" value="a@b.c">
        <template id="templ8GameTasks">
            <h4 style="text-align: center;" class="game-tasks">
                Game Tasks
            </h4>
        </template>
    `;

    await navController.init();
    const carousel = document.getElementById("carouselNewGame") as unknown as ons.OnsCarouselElement;
    carousel.next = Vitest.vi.fn();

    Vitest.vi.spyOn(playerService, 'savePlayers').mockImplementation((name: string, email: string): Players => { return new Players(); });
    await navController.onRollButtonClick();

    Vitest.expect(playerViewMock.showValidationToast).not.toHaveBeenCalled();
    Vitest.expect(playerService.savePlayers).toHaveBeenCalledWith("John Doe", "a@b.c");
});

Vitest.test("onReloadButtonClick calls loadCarouselItems and navigates to next item", async () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
            <ons-carousel-item id="caiWelcome">
                <h1>Welcome</h1>
            </ons-carousel-item>
        </ons-carousel>
        <template id="templ8GameTasks">
            <h4 style="text-align: center;" class="game-tasks">
                Game Tasks
            </h4>
        </template>
    `;
    await navController.init();

    const loadCarouselItemsMock = Vitest.vi.spyOn(navController, 'loadCarouselItem').mockResolvedValue(undefined);
    const carousel = document.getElementById("carouselNewGame") as unknown as CarouselElement;
    const nextMock = Vitest.vi.fn();
    Object.defineProperty(carousel, 'next', {
        value: nextMock
    });

    await navController.onReloadButtonClick();

    Vitest.expect(nextMock).toHaveBeenCalledOnce();
});

Vitest.test("loadCarouselItems removes all carousel items except welcome", async () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        </ons-carousel>
        <template id="templ8GameTasks">
            <h4 style="text-align: center;" class="game-tasks">
                Game Tasks
            </h4>
        </template>
    `;
    await navController.init();
    const carousel = document.getElementById("carouselNewGame") as unknown as CarouselElement;

    Object.defineProperties(carousel, {
        'getActiveIndex': {
            value: Vitest.vi.fn(() => 0),
        },
    });

    await navController.loadCarouselItem([
        navController.welcome,
        navController.newGame,
        navController.loadGame,
        navController.comrades
    ]);

    const items = carousel.querySelectorAll("ons-carousel-item");
    Vitest.expect(items.length).toBe(4); // welcome + 2 new items
    Vitest.expect(fetch).toHaveBeenCalledTimes(5);
});

Vitest.test("onLoadGameButtonClick loads players and navigates to next carousel item", async () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        </ons-carousel>
        <template id="templ8GameTasks">
            <h4 style="text-align: center;" class="game-tasks">
                Game Tasks
            </h4>
        </template>
        `;
    await navController.init();
    const carousel = document.getElementById("carouselNewGame") as unknown as CarouselElement;

    Object.defineProperties(carousel, {
        'getActiveIndex': {
            value: Vitest.vi.fn(() => 0),
        },
    });

    navController.loadCarouselItem([navController.loadGame]);


    const nextMock = Vitest.vi.fn();
    Object.defineProperty(carousel, 'next', {
        value: nextMock
    });

    const loadPlayersSpy = Vitest.vi.spyOn(playerService, 'loadPlayers').mockImplementation((email: string): Players => { return new Players(); });

    await navController.onLoadGameButtonClick("a@b.c");
    Vitest.expect(nextMock).toHaveBeenCalledOnce();
    Vitest.expect(loadPlayersSpy).toHaveBeenCalledWith("a@b.c");
});

Vitest.test("onDeleteGame deletes players and resets carousel to welcome if no players left", async () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        </ons-carousel>
        <template id="templ8GameTasks">
            <h4 style="text-align: center;" class="game-tasks">
                Game Tasks
            </h4>
        </template>
        `;
    await navController.init();
    const carousel = document.getElementById("carouselNewGame") as unknown as CarouselElement;
    Object.defineProperties(carousel, {
        'getActiveIndex': {
            value: Vitest.vi.fn(() => 0),
        },
        'setActiveIndex': {
            value: Vitest.vi.fn(),
        },
        'prev': {
            value: Vitest.vi.fn(),
        }
    });

    navController.loadCarouselItem([navController.loadGame]);

    // Vitest.vi.spyOn(playerService, 'savePlayers').mockImplementation((name: string, email: string): Players => { return new Players(); });
    Vitest.vi.spyOn(playerService, 'deletePlayers').mockImplementation((email: string): void => { });
    const loadPlayersSpy = Vitest.vi.spyOn(navController.loadGame, 'loadPlayers').mockImplementation(() => Vitest.vi.fn());

    await navController.onDeleteGame("a@b.c");

    Vitest.expect(playerService.deletePlayers).toHaveBeenCalledWith("a@b.c");
    Vitest.expect(loadPlayersSpy).toHaveBeenCalled();
    Vitest.vi.waitFor(() => {
        Vitest.expect(carousel.setActiveIndex).toHaveBeenCalledWith(0);
    });
});

Vitest.test("onDeleteGame deletes players and does not reset carousel if players left", async () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        </ons-carousel>
        <template id="templ8GameTasks">
            <h4 style="text-align: center;" class="game-tasks">
                Game Tasks
            </h4>
        </template>
        `;
    await navController.init();
    const carousel = document.getElementById("carouselNewGame") as unknown as CarouselElement;
    Object.defineProperties(carousel, {
        'getActiveIndex': {
            value: Vitest.vi.fn(() => 0),
        },
        'prev': {
            value: Vitest.vi.fn(),
        }
    });

    navController.loadCarouselItem([navController.loadGame]);

    Vitest.vi.spyOn(playerService, 'listPlayersFromStorage').mockImplementation((): string[] => { return ["a@b.c"]; });
    Vitest.vi.spyOn(playerService, 'deletePlayers').mockImplementation((email: string): void => { });
    const loadPlayersSpy = Vitest.vi.spyOn(navController.loadGame, 'loadPlayers').mockImplementation(() => Vitest.vi.fn());

    await navController.onDeleteGame("a@b.c");

    Vitest.expect(playerService.deletePlayers).toHaveBeenCalledWith("a@b.c");
    Vitest.expect(loadPlayersSpy).toHaveBeenCalled();
    Vitest.expect(carousel.prev).not.toHaveBeenCalled();
});

Vitest.test("onGameStart adds drunkenTavern carousel item and navigates to it", async () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        </ons-carousel>
        <template id="templ8GameTasks">
            <h4 style="text-align: center;" class="game-tasks">
                Game Tasks
            </h4>
        </template>
        `;

    // // const beforeIndex = navController.get
    await navController.init();

    const carousel = document.getElementById("carouselNewGame") as unknown as CarouselElement;
    const nextMock = Vitest.vi.fn();
    Object.defineProperties(carousel, {
        'getActiveIndex': {
            value: Vitest.vi.fn(() => 0),
        },
        'next': {
            value: nextMock
        }
    });

    navController.loadCarouselItem([navController.welcome]);

    await navController.onGameStart();

    Vitest.expect(nextMock).toHaveBeenCalledOnce();
    Vitest.expect(carousel.querySelector(`#${navController.drunkenTavern.carouselItem.id}`)).not.toBeNull();
});

Vitest.test("resetCarouselToLoadGame adds loadGame carousel item if not present and navigates to it", async () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
            <ons-carousel-item id="caiWelcome">
                <h1>Welcome</h1>
            </ons-carousel-item>
        </ons-carousel>
        <ons-button class="btn js-load-game" id="btnNewGame">New Game</ons-button>
        <template id="templ8GameTasks">
            <h4 style="text-align: center;" class="game-tasks">
                Game Tasks
            </h4>
        </template>
        `;
    await navController.init();

    const carousel = document.getElementById("carouselNewGame") as unknown as CarouselElement;
    Object.defineProperties(carousel, {
        'getActiveIndex': {
            value: Vitest.vi.fn(() => 1), // Assuming the loadGame item is at index 1
        },
        'next': {
            value: Vitest.vi.fn(),
        },
        'setActiveIndex': {
            value: Vitest.vi.fn(),
        },
    });

    await navController.loadCarouselItem([navController.newGame]);

    await navController.resetCarouselToLoadGame();
    Vitest.expect(carousel.setActiveIndex).toHaveBeenCalledWith(1);
});

Vitest.test("resetCarouselToLoadGame with LoadGame item already present navigates to it without adding a new item", async () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
            <ons-carousel-item id="caiWelcome">
                <h1>Welcome</h1>
            </ons-carousel-item>
            <ons-carousel-item id="caiLoadGame">
                <h1>Load Game</h1>
            </ons-carousel-item>
        </ons-carousel>
        <ons-button class="btn js-load-game" id="btnNewGame">New Game</ons-button>
        <template id="templ8GameTasks">
            <h4 style="text-align: center;" class="game-tasks">
                Game Tasks
            </h4>
        </template>
        `;
    await navController.init();

    const carousel = document.getElementById("carouselNewGame") as unknown as CarouselElement;
    Object.defineProperties(carousel, {
        'getActiveIndex': {
            value: Vitest.vi.fn(() => 1), // Assuming the loadGame item is at index 1
        },
        'next': {
            value: Vitest.vi.fn(),
        },
        'setActiveIndex': {
            value: Vitest.vi.fn(),
        },
    });

    await navController.loadCarouselItem([navController.newGame]);

    await navController.resetCarouselToLoadGame();
    Vitest.expect(carousel.setActiveIndex).toHaveBeenCalledWith(1);
});