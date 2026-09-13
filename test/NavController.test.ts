// @vitest-environment jsdom

import * as Vitest from 'vitest';
import NavController from '../www/ts/NavController';
import PlayerService from '../www/ts/PlayerService';
import Players from '../www/ts/Players';
import PlayerView from '../www/ts/PlayerView';
import type { OnsCarouselElement as CarouselElement } from '../www/lib/onsenui';

let navController : NavController = null as unknown as NavController;
let playerService : PlayerService = null as unknown as PlayerService;
let playerView : PlayerView = null as unknown as PlayerView;

Vitest.beforeEach(() => {
    playerService = new PlayerService();
    playerView = new PlayerView();
    navController = new NavController(playerService, playerView);

    // Clear the document body before each test
    document.body.innerHTML = '';
    sessionStorage.clear();
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
    const consoleErrorSpy = Vitest.vi.spyOn(console, 'error').mockImplementation(() => {});
    NavController.showSection('section1');
    Vitest.expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
});

// Vitest.test.each([
//     ['ArrowRight', 'next'],
//     ['ArrowLeft', 'prev'],
//     ['ArrowUp', 'nada'],
//     ['ArrowDown', 'nada'],
//     ['a', 'nada'],
//     ['PgDown', 'nada'],
//     ['Enter', 'nada']
// ] as const)("navigateCarousel handles %s keydown event", (key, method) => {
//     const carousel = document.createElement('div') as unknown as HTMLElement & {
//         next: () => void;
//         prev: () => void;
//         nada: () => void;
//     };

//     carousel.id = 'carouselNewGame';
//     carousel[method] = Vitest.vi.fn();

//     document.body.appendChild(carousel);

//     navController.navigateCarousel(new KeyboardEvent('keydown', { key }));

//     if (method === 'nada') {
//         Vitest.expect(carousel[method]).not.toHaveBeenCalled();
//     } else {
//         Vitest.expect(carousel[method]).toHaveBeenCalledOnce();
//     }
// });

// Vitest.test("navigateCarousel on click event for btnNewGame calls next on carousel", () => {
//     const carousel = document.createElement('div') as unknown as HTMLElement & {
//         next: () => void;
//     };
//     carousel.id = 'carouselNewGame';
//     carousel.next = Vitest.vi.fn();

//     const btnNewGame = document.createElement('button') as unknown as HTMLElement & {
//         id: string;
//     };
//     btnNewGame.id = 'btnNewGame';

//     document.body.appendChild(carousel);
//     document.body.appendChild(btnNewGame);

//     document.getElementById("btnNewGame")?.addEventListener(
//         "click",
//         navController.navigateCarousel
//     );

//     btnNewGame.click();

//     Vitest.expect(carousel.next).toHaveBeenCalledOnce();
// });

// Vitest.test("navigateCarousel logs an error if carousel element is not found", () => {
//     const consoleErrorSpy = Vitest.vi.spyOn(console, 'error').mockImplementation(() => {});
//     navController.navigateCarousel(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
//     Vitest.expect(consoleErrorSpy).toHaveBeenCalled();
//     consoleErrorSpy.mockRestore();
// });

Vitest.test("onCarouselPlayersPreChange retrieves the active carousel item", () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        <ons-carousel-item id="caiWelcome">
        </ons-carousel-item>
        <ons-carousel-item id="caiPlayers">
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

    const savePlayerSpy = Vitest.vi.spyOn(playerService, 'savePlayers').mockImplementation(() : Players => {return new Players();});

    navController.onCarouselPlayersPreChange(event);

    Vitest.expect(savePlayerSpy).toHaveBeenCalledWith("John Doe", "john.doe@example.com");
});

Vitest.test("onCarouselPlayersPreChange no input fields found logs an error", () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        <ons-carousel-item id="caiWelcome">
        </ons-carousel-item>
        <ons-carousel-item id="caiPlayers">
        </ons-carousel-item>
        </ons-carousel>

        <input type="text" id="inputPlayerName" value="" />
        <input type="text" id="inputPlayerEmail" value="" />
    `;

    const carousel = document.getElementById("carouselNewGame") as unknown as HTMLElement;

    const event = new Event('prechange');
    Object.assign(event, {
        carousel,
        activeIndex: 1,
    });

    Vitest.vi.spyOn(playerService, 'savePlayers').mockImplementation((name: string, email: string) : Players => {return new Players();});
    const consoleErrorSpy = Vitest.vi.spyOn(console, 'error').mockImplementation(() => {});

    navController.onCarouselPlayersPreChange(event);

    Vitest.expect(playerService.savePlayers).not.toHaveBeenCalled();
    Vitest.expect(consoleErrorSpy).toHaveBeenCalled();
});

Vitest.test("onCarouselPlayersPreChange input fields not found logs an error", () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        <ons-carousel-item id="caiWelcome">
        </ons-carousel-item>
        <ons-carousel-item id="caiPlayers">
        </ons-carousel-item>
        </ons-carousel>
    `;

    const carousel = document.getElementById("carouselNewGame") as unknown as HTMLElement;

    const event = new Event('prechange');
    Object.assign(event, {
        carousel,
        activeIndex: 1,
    });

    Vitest.vi.spyOn(playerService, 'savePlayers').mockImplementation((name: string, email: string) : Players => {return new Players();});
    const consoleErrorSpy = Vitest.vi.spyOn(console, 'error').mockImplementation(() => {});

    navController.onCarouselPlayersPreChange(event);

    Vitest.expect(playerService.savePlayers).not.toHaveBeenCalled();
    Vitest.expect(consoleErrorSpy).toHaveBeenCalled();
});

Vitest.test("onCarouselPlayersPreChange does nothing if active item is not caiPlayers", () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        <ons-carousel-item id="caiWelcome">
        </ons-carousel-item>
        <ons-carousel-item id="caiPlayers">
        </ons-carousel-item>
        </ons-carousel>

        <input type="text" id="inputPlayerName" value="John Doe" />
        <input type="text" id="inputPlayerEmail" value="john.doe@example.com" />
    `;

    const carousel = document.getElementById("carouselNewGame") as unknown as HTMLElement;

    const event = new Event('prechange');
    Object.assign(event, {
        carousel,
        activeIndex: 0,
    });

    Vitest.vi.spyOn(playerService, 'savePlayers').mockImplementation((name: string, email: string) : Players => {return new Players();});
    const consoleErrorSpy = Vitest.vi.spyOn(console, 'error').mockImplementation(() => {});

    navController.onCarouselPlayersPreChange(event);

    Vitest.expect(playerService.savePlayers).not.toHaveBeenCalled();
    Vitest.expect(consoleErrorSpy).not.toHaveBeenCalled();
});

Vitest.test("onCarouselPlayersPreChange logs an error if playerService.savePlayers returns null", () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        <ons-carousel-item id="caiWelcome">
        </ons-carousel-item>
        <ons-carousel-item id="caiPlayers">
        </ons-carousel-item>
        </ons-carousel>

        <input type="text" id="inputPlayerName" value="John Doe" />
        <input type="text" id="inputPlayerEmail" value="john.doe@example.com" />
    `;

    Vitest.vi.spyOn(playerService, 'savePlayers').mockReturnValue(null);
    const consoleErrorSpy = Vitest.vi.spyOn(console, 'error').mockImplementation(() => {});

    const carousel = document.getElementById("carouselNewGame") as unknown as HTMLElement;

    const event = new Event('prechange');
    Object.assign(event, {
        carousel,
        activeIndex: 1,
    });

    navController.onCarouselPlayersPreChange(event);

    Vitest.expect(consoleErrorSpy).toHaveBeenCalled();
});

Vitest.test("onCarouselNewGamePostChange retrieves the active carousel item and loads main player", () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        <ons-carousel-item id="caiWelcome"></ons-carousel-item>
        <ons-carousel-item id="caiPlayers"></ons-carousel-item>
        <ons-carousel-item id="caiNewGame"></ons-carousel-item>
        </ons-carousel>
        <input type="text" id="inputPlayerName" />
        <input type="text" id="inputPlayerEmail" />
    `;
    const carousel = document.getElementById("carouselNewGame") as unknown as HTMLElement;

    const event = new Event('postchange');
    Object.assign(event, {
        carousel,
        activeIndex: 2,
    });

    Vitest.vi.spyOn(playerService, 'loadMainPlayer').mockReturnValue({
        name: "John Doe",
        email: "john.doe@example.com"
    } as any);

    navController.onCarouselNewGamePostChange(event);

    Vitest.expect((document.getElementById("inputPlayerName") as HTMLInputElement).value).toBe("John Doe");
    Vitest.expect((document.getElementById("inputPlayerEmail") as HTMLInputElement).value).toBe("john.doe@example.com");
});

Vitest.test("onCarouselNewGamePostChange log error if no input fields found", () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        <ons-carousel-item id="caiWelcome"></ons-carousel-item>
        <ons-carousel-item id="caiPlayers"></ons-carousel-item>
        <ons-carousel-item id="caiNewGame"></ons-carousel-item>
        </ons-carousel>
    `;

    const carousel = document.getElementById("carouselNewGame") as unknown as HTMLElement;

    const event = new Event('postchange');
    Object.assign(event, {
        carousel,
        activeIndex: 2,
    });

    Vitest.vi.spyOn(playerService, 'loadMainPlayer').mockReturnValue({
        name: "John Doe",
        email: "john.doe@example.com"
    } as any);

    const consoleErrorSpy = Vitest.vi.spyOn(console, 'error').mockImplementation(() => {});

    navController.onCarouselNewGamePostChange(event);

    Vitest.expect(consoleErrorSpy).toHaveBeenCalled();
});

Vitest.test("onCarouselNewGamePostChange does nothing if no main player is found", () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        <ons-carousel-item id="caiWelcome"></ons-carousel-item>
        <ons-carousel-item id="caiPlayers"></ons-carousel-item>
        <ons-carousel-item id="caiNewGame"></ons-carousel-item>
        </ons-carousel>
        <input type="text" id="inputPlayerName" />
        <input type="text" id="inputPlayerEmail" />
    `;
    const carousel = document.getElementById("carouselNewGame") as unknown as HTMLElement;

    const event = new Event('postchange');
    Object.assign(event, {
        carousel,
        activeIndex: 2,
    });

    Vitest.vi.spyOn(playerService, 'loadMainPlayer').mockReturnValue(null);
    navController.onCarouselNewGamePostChange(event);

    Vitest.expect((document.getElementById("inputPlayerName") as HTMLInputElement).value).toBe("");
    Vitest.expect((document.getElementById("inputPlayerEmail") as HTMLInputElement).value).toBe("");
});

Vitest.test("onCarouselNewGamePostChange does nothing if active item is not caiNewGame", () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        <ons-carousel-item id="caiWelcome"></ons-carousel-item>
        <ons-carousel-item id="caiPlayers"></ons-carousel-item>
        <ons-carousel-item id="caiNewGame"></ons-carousel-item>
        </ons-carousel>
        <input type="text" id="inputPlayerName" />
        <input type="text" id="inputPlayerEmail" />
    `;

    const carousel = document.getElementById("carouselNewGame") as unknown as HTMLElement;

    const event = new Event('postchange');
    Object.assign(event, {
        carousel,
        activeIndex: 0,
    });

    navController.onCarouselNewGamePostChange(event);

    Vitest.expect((document.getElementById("inputPlayerName") as HTMLInputElement).value).toBe("");
    Vitest.expect((document.getElementById("inputPlayerEmail") as HTMLInputElement).value).toBe("");
});

Vitest.test("onCarouselNewGame navigates to next carousel item", () => {
    document.body.innerHTML = `
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
              <ons-card>
        <ons-button class="btn js-load-game" id="btnNewGame">New Game</ons-button>
      </ons-card>
        `;

    const carousel = document.getElementById("carouselNewGame") as unknown as CarouselElement;
    Object.defineProperty(carousel, 'next', {
        value: Vitest.vi.fn(),
    });

    const btnNewGame = document.getElementById("btnNewGame") as unknown as HTMLElement;
    btnNewGame.addEventListener(
        "click",
        (event) => navController.onCarouselNewGame(event)
    );

    btnNewGame.click();

    Vitest.expect(carousel.next).toHaveBeenCalledOnce();
});

Vitest.test("onCarouselNewGame logs an error if carousel element is not found", () => {
    document.body.innerHTML = `
        <ons-card>
            <ons-button class="btn js-load-game" id="btnNewGame">New Game</ons-button>
        </ons-card>
        `;
    const btnNewGame = document.getElementById("btnNewGame") as unknown as HTMLElement;
    btnNewGame.addEventListener(
        "click",
        (event) => navController.onCarouselNewGame(event)
    );

    btnNewGame.click();
    Vitest.vi.spyOn(console, 'error').mockImplementation(() => {});
});