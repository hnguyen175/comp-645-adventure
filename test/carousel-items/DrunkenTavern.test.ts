import * as Vitest from "vitest";
import DrunkenTavern from "../../www/ts/carousel-items/DrunkenTavern";
import must from "../../www/ts/utilities/RequiredField";
import Party from "../../www/ts/Party";
import Player from "../../www/ts/Player";
import currentGameState from "../../www/ts/GameState";
import PlayerService from "../../www/ts/PlayerService";
import GameTasks from "../../www/ts/templates/GameTasks";

const drunkenTavernHtml = "../../www/views/drunken-tavern.html?raw";

type ChallengeMock = {
  outcome: "win" | "lose" | "winWithLuck" | "loseWithLuck" | "tie";
};

let playerService: PlayerService = null as unknown as PlayerService;
let templateFragmentMock: unknown;
let navControllerMock: any;

Vitest.beforeEach(async () => {
  Vitest.vi.restoreAllMocks();

  navControllerMock = {
    createNextChallenge: Vitest.vi
      .fn()
      .mockImplementation(async (carouselItem) => {
        const mockForest = {
          constructor: { name: "FangornForest" },
        };
        return mockForest;
      }),
  };

  // Mock the fetch function to return the HTML content for the specified URLs
  Vitest.vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
    if (url.toString().endsWith("../views/drunken-tavern.html")) {
      const drunkenTavern = await import(drunkenTavernHtml);
      return new Response(drunkenTavern.default);
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
  playerService = new PlayerService();
  mockScenario();
  setupVillainMock();

  document.body.innerHTML = /*html*/ `
        <html>
            <template id="templGameTasks">
    <h4 style="text-align: center;" class="game-tasks">
      <a href="#" data-gametsk="save">Save Game</a> | <a href="#" data-gametsk="load">Load Game</a> | <a href="#"
        data-gametsk="quit">Quit Game</a> | <a href=" #" data-gametsk="settings">Settings</a>
    </h4>
            </template>
        </html>
    `;
  GameTasks.initialize(navControllerMock);
  //   const mockGameTasks = Vitest.vi.mockObject(GameTasks.instance);
  //   templateFragmentMock = Vitest.vi
  //     .spyOn(mockGameTasks, "templateFragment", "get")
  //     .mockImplementation(() => {
  //       document.body.innerHTML = /*html*/ `
  //             <html>
  //                 <template id="templGameTasks">
  //                 </template>
  //             </html>
  //         `;
  //       const template = must(
  //         document.querySelector<HTMLTemplateElement>("#templGameTasks"),
  //       );
  //       return template.content.cloneNode(true) as DocumentFragment;
  //     });
});

Vitest.test("DrunkenTavern should be properly initialized", async () => {
  const dkt = await DrunkenTavern.create(navControllerMock, playerService);
  Vitest.expect(dkt).not.toBeNull();
  Vitest.expect(dkt.carouselItem).not.toBeNull();
});

Vitest.test(
  "DrunkenTavern should handle click events on challenge buttons",
  async () => {
    const dkt = await DrunkenTavern.create(navControllerMock, playerService);
    dkt.initializePage();

    Vitest.expect(dkt).not.toBeNull();
    Vitest.expect(dkt.carouselItem).not.toBeNull();

    const btnSTR = must(dkt.carouselItem.querySelector<HTMLElement>("#btnSTR"));
    Vitest.expect(btnSTR).not.toBeNull();

    btnSTR.click();
    Vitest.expect(currentGameState.getParty()).not.toBeNull();
  },
);

Vitest.test(
  "DrunkenTavern should handle click events when clicked element is not a challenge button",
  async () => {
    const dkt = await DrunkenTavern.create(navControllerMock, playerService);
    Vitest.expect(dkt).not.toBeNull();
    Vitest.expect(dkt.carouselItem).not.toBeNull();
    const nonButtonElement = must(
      dkt.carouselItem.querySelector<HTMLElement>("#divDrunkenTavernVillain"),
    );

    nonButtonElement.click();

    dkt.carouselItem
      .querySelectorAll("ons-button.challenge-button")
      .forEach((btn) => {
        Vitest.expect(btn.hasAttribute("disabled")).toBe(false);
      });
  },
);

function mockScenario(challengeMock: ChallengeMock | null = null) {
  Vitest.vi.spyOn(currentGameState, "getParty").mockImplementation(() => {
    const players = new Party();
    const player = new Player("player");
    players.addPlayer(player);

    if (challengeMock == null) {
      // accept the default data
    } else if (challengeMock.outcome === "win") {
      player.mp = 100;
      player.str = 100;
      player.spd = 100;
    } else if (challengeMock.outcome === "lose") {
      player.mp = 10;
      player.str = 10;
      player.spd = 10;
    } else if (
      challengeMock.outcome === "winWithLuck" ||
      challengeMock.outcome === "loseWithLuck"
    ) {
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
    currentGameState.setParty(players);
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
] as const)(
  "DrunkenTavern challenge button click should handle %s, %s",
  async (setupScenario, attribute) => {
    setupScenario();

    const dkt = await DrunkenTavern.create(navControllerMock, playerService);

    const btnStrength = must(
      dkt.carouselItem.querySelector<HTMLElement>(
        `#btn${attribute.toUpperCase()}`,
      ),
    );
    Vitest.expect(btnStrength).not.toBeNull();

    const mockDktQuerySelector = Vitest.vi.spyOn(
      dkt.carouselItem,
      "querySelector",
    );
    const htmlElementMock = must(
      dkt.carouselItem.querySelector<HTMLElement>("#divDrunkenTavernChallenge"),
    );

    btnStrength.click();

    Vitest.expect(mockDktQuerySelector).toHaveBeenCalledWith(
      "#divDrunkenTavernChallenge",
    );
    Vitest.expect(
      document.getElementById("divDrunkenTavernChallenge")?.textContent,
    ).not.toBe("");
    Vitest.expect(
      must(dkt.carouselItem.querySelector("#btnSTR")).hasAttribute("disabled"),
    ).toBe(true);
    Vitest.expect(
      dkt.carouselItem
        .querySelector<HTMLButtonElement>("#btnSPD")
        ?.hasAttribute("disabled"),
    ).toBe(true);
    Vitest.expect(
      dkt.carouselItem
        .querySelector<HTMLButtonElement>("#btnMP")
        ?.hasAttribute("disabled"),
    ).toBe(true);

    if (
      setupScenario.toString().includes("winWithLuck") ||
      setupScenario.toString().includes("win")
    ) {
      const replaceWith = Vitest.vi
        .spyOn(dkt.carouselItem, "replaceWith")
        .mockImplementation(() => Vitest.vi.fn());

      const nextChallenge = await Vitest.vi.waitFor(
        () => {
          const btn = dkt.carouselItem.querySelector<HTMLButtonElement>(
            "ons-button.challenge-button",
          );

          Vitest.expect(btn).not.toBeNull();
          return btn;
        },
        { timeout: 5000 },
      );

      if (nextChallenge) {
        nextChallenge.dispatchEvent(new Event("click"));

        Vitest.expect(replaceWith).toHaveBeenCalled();
      }
    }
  },
);

Vitest.test("Tie scenario user can try their luk 3 times", async () => {
  mockScenario({ outcome: "tie" });
  const dkt = await DrunkenTavern.create(navControllerMock, playerService);

  const mockDktQuerySelector = Vitest.vi.spyOn(
    dkt.carouselItem,
    "querySelector",
  );
  const htmlElementMock = must(
    dkt.carouselItem.querySelector<HTMLElement>("#divDrunkenTavernChallenge"),
  );

  let btnName: string;
  for (let i = 0; i < 3; i++) {
    switch (i) {
      case 0:
        btnName = "#btnSTR";
        break;
      case 1:
        btnName = "#btnSPD";
        break;
      case 2:
        btnName = "#btnMP";
        break;
      default:
        throw new Error("Invalid button index");
    }
    const btnStrength = must(
      dkt.carouselItem.querySelector<HTMLElement>(btnName),
    );

    Vitest.expect(btnStrength.hasAttribute("disabled")).toBe(false);
    btnStrength.click();

    Vitest.expect(mockDktQuerySelector).toHaveBeenCalledWith(
      "#divDrunkenTavernChallenge",
    );
    Vitest.expect(
      document.getElementById("divDrunkenTavernChallenge")?.textContent,
    ).not.toBe("");

    switch (i) {
      case 0:
        Vitest.expect(
          must(dkt.carouselItem.querySelector("#btnSTR")).hasAttribute(
            "disabled",
          ),
        ).toBe(true);
        Vitest.expect(
          must(
            dkt.carouselItem.querySelector("#btnSPD")?.hasAttribute("disabled"),
          ),
        ).toBe(false);
        Vitest.expect(
          must(
            dkt.carouselItem.querySelector("#btnMP")?.hasAttribute("disabled"),
          ),
        ).toBe(false);
        break;
      case 1:
        Vitest.expect(
          must(
            dkt.carouselItem.querySelector("#btnSTR")?.hasAttribute("disabled"),
          ),
        ).toBe(true);
        Vitest.expect(
          must(dkt.carouselItem.querySelector("#btnSPD")).hasAttribute(
            "disabled",
          ),
        ).toBe(true);
        Vitest.expect(
          must(
            dkt.carouselItem.querySelector("#btnMP")?.hasAttribute("disabled"),
          ),
        ).toBe(false);
        break;
      case 2:
        Vitest.expect(
          must(
            dkt.carouselItem.querySelector("#btnSTR")?.hasAttribute("disabled"),
          ),
        ).toBe(true);
        Vitest.expect(
          must(
            dkt.carouselItem.querySelector("#btnSPD")?.hasAttribute("disabled"),
          ),
        ).toBe(true);
        Vitest.expect(
          must(dkt.carouselItem.querySelector("#btnMP")).hasAttribute(
            "disabled",
          ),
        ).toBe(true);
        break;
    }
  }
});

function setupVillainMock() {
  Vitest.vi.spyOn(playerService, "createVillain").mockImplementation(() => {
    // const villain = playerService.createVillain();
    const villain = Player.getVillainPlayer();
    villain.mp = 50;
    villain.str = 50;
    villain.spd = 50;
    villain.luk = 50;

    // currentGameState.setDtkVillain(villain);
    return villain;
  });
}
