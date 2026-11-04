/// <reference types="vite/client" />

import * as Vitest from "vitest";
import currentGameState from "../../www/ts/GameState";
import Party from "../../www/ts/Party";
import Player from "../../www/ts/Player";
import PlayerView from "../../www/ts/rendering/PlayerView";
import must from "../../www/ts/utilities/RequiredField";
import RandomGenerator from "../../www/ts/utilities/RandomGenerator";
import GameTasks from "../../www/ts/templates/GameTasks";

let Lake: typeof import("../../www/ts/carousel-items/Lake").default;

Vitest.beforeAll(async () => {
  // const template = document.createElement("template");
  // template.id = "templGoToNextChallenge";
  // document.body.appendChild(template);

  const module = await import("../../www/ts/carousel-items/Lake");
  Lake = module.default;

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
  GameTasks.initialize({} as any); // Initialize GameTasks with a mock NavController
});

Vitest.beforeEach(() => {
  Vitest.vi.restoreAllMocks();

  Vitest.vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
    const lake = await import("../../www/views/lake.html?raw");
    return new Response(lake.default);
  });

  Vitest.vi.stubGlobal("ons", {
    createElement: Vitest.vi.fn((html: string) => {
      const template = document.createElement("template");
      template.innerHTML = html.trim();
      return template.content.firstElementChild as HTMLElement;
    }),
  });

  const player1 = new Player(null, null, null, {
    hp: 50,
    str: 50,
    spd: 50,
    mp: 50,
    luk: 50,
    wep: RandomGenerator.randomWeapon(),
    cls: RandomGenerator.randomClass(),
  });
  const player2 = new Player(null, null, null, {
    hp: 50,
    str: 50,
    spd: 50,
    mp: 50,
    luk: 50,
    wep: RandomGenerator.randomWeapon(),
    cls: RandomGenerator.randomClass(),
  });
  const party = new Party();
  party.addPlayer(player1);
  party.addPlayer(player2);
  currentGameState.setParty(party);
});

Vitest.test("Lake constructor should create a Lake instance", async () => {
  // Mock dependencies
  const mockNavController = {} as any;
  const mockPlayerService = {} as any;
  const mockTemplate = {} as any;

  // Mock the static create method
  Vitest.vi
    .spyOn(Lake, "create")
    .mockResolvedValue(
      new Lake(
        mockNavController,
        mockPlayerService,
        {} as any,
        new PlayerView(),
        new Player(),
      ),
    );

  // Call the create method
  const lake = await Lake.create(
    mockNavController,
    mockPlayerService,
    mockTemplate,
  );

  await Vitest.vi.waitFor(() => {
    // Assert that the create method was called with the correct arguments
    Vitest.expect(Lake.create).toHaveBeenCalled();
    // Assert that the Lake instance is created
    Vitest.expect(lake).toBeInstanceOf(Lake);
  });
});

Vitest.test.each([[51], [100], [150]])(
  "Lake battle with %i HP mini-boss",
  async (miniBossHp) => {
    // Mock dependencies
    const mockNavController = {} as any;
    const mockPlayerService = {} as any;
    const mockTemplate = {} as any;
    const mockGoToNextChallengeTemplate = {} as any;
    const miniBoss = new Player(null, null, null, {
      hp: miniBossHp,
      str: RandomGenerator.randomStat(),
      spd: RandomGenerator.randomStat(),
      mp: RandomGenerator.randomStat(),
      luk: RandomGenerator.randomLuk(),
      wep: "Evil " + RandomGenerator.randomWeapon(),
      cls: "Dark " + RandomGenerator.randomClass(),
    });

    // Call the create method
    const lake = await Lake.create(
      mockNavController,
      mockPlayerService,
      miniBoss,
    );

    await Vitest.vi.waitFor(() => {
      // Assert that the create method was called with the correct arguments
      // Vitest.expect(Lake.create).toHaveBeenCalledWith(mockNavController, mockPlayerService, mockTemplate, miniBoss);
      // Assert that the Lake instance is created
      Vitest.expect(lake).toBeInstanceOf(Lake);
    });

    const gameParty = must(currentGameState.getParty());
    const initialMiniBossHp = miniBoss.hp;
    const initialPlayerHP = gameParty.players[0].hp;

    // Click the first attack button
    const buttons =
      lake.carouselItem.querySelectorAll<HTMLElement>("ons-button");
    Vitest.expect(buttons.length).toBeGreaterThan(0);
    buttons[0].click();

    await Vitest.vi.waitFor(() => {
      // Assert that the attack button is disabled
      Vitest.expect(buttons[0].hasAttribute("disabled")).toBe(true);
    });

    Vitest.expect(miniBoss.hp).toBe(
      initialMiniBossHp - gameParty.players[0].str,
    ); // boss' HP - player's str (50) = 1
    Vitest.expect(gameParty.players[0].hp).toBe(
      initialPlayerHP - Math.floor(initialPlayerHP * 0.1),
    ); // player's HP reduced by 10%

    // ensure the ons-list-item has 'row-flash' style applied to it
    const playerStatCell = lake.carouselItem.querySelector(
      'ons-list-item[data-property="hp"]',
    );
    Vitest.expect(playerStatCell?.classList.contains("row-flash")).toBe(true);

    // also esure boss' ons-list-item has 'row-flash' style applied to it
    const bossStatCell = [
      ...lake.carouselItem.querySelectorAll(
        'ons-list-item[data-property="hp"]',
      ),
    ].at(-1);
    Vitest.expect(bossStatCell?.classList.contains("row-flash")).toBe(true);

    // verify #pChallengeResult has the correct text content
    const resultElement = lake.carouselItem.querySelector("#pChallengeResult");
    Vitest.expect(resultElement?.textContent).toContain("Keep fighting");
  },
);

Vitest.test.each([[51], [150]] as const)(
  "Lake battle with %i HP mini-boss and multiple players",
  async (miniBossHp) => {
    // Mock dependencies
    const mockNavController = {} as any;
    const mockPlayerService = {} as any;
    const mockTemplate = {} as any;
    const mockGoToNextChallengeTemplate = {} as any;
    const miniBoss = new Player(null, null, null, {
      hp: miniBossHp,
      str: RandomGenerator.randomStat(),
      spd: RandomGenerator.randomStat(),
      mp: RandomGenerator.randomStat(),
      luk: RandomGenerator.randomLuk(),
      wep: "Evil " + RandomGenerator.randomWeapon(),
      cls: "Dark " + RandomGenerator.randomClass(),
    });

    // Call the create method
    const lake = await Lake.create(
      mockNavController,
      mockPlayerService,
      miniBoss,
    );

    await Vitest.vi.waitFor(() => {
      // Assert that the create method was called with the correct arguments
      // Vitest.expect(Lake.create).toHaveBeenCalledWith(mockNavController, mockPlayerService, mockTemplate, miniBoss);
      // Assert that the Lake instance is created
      Vitest.expect(lake).toBeInstanceOf(Lake);
    });

    const gameParty = must(currentGameState.getParty());
    const initialMiniBossHp = miniBoss.hp;
    const initialPlayerHP = gameParty.players[0].hp;

    // Click the first attack button
    const buttons =
      lake.carouselItem.querySelectorAll<HTMLElement>("ons-button");
    Vitest.expect(buttons.length).toBeGreaterThan(0);
    buttons[0].click();
    // 2nd attack
    buttons[1].click();

    await Vitest.vi.waitFor(() => {
      // Assert that the attack button is disabled
      Vitest.expect(buttons[0].hasAttribute("disabled")).toBe(true);
      Vitest.expect(buttons[1].hasAttribute("disabled")).toBe(true);
    });

    const resultElement = lake.carouselItem.querySelector("#pChallengeResult");

    // players' strengths win out
    if (miniBossHp < 100) {
      Vitest.expect(miniBoss.hp).toBe(0);
      // verify #pChallengeResult has the correct text content
      Vitest.expect(resultElement?.textContent).toContain("You defeated the");
    } else {
      // mini-boss' HP is still above 0
      // verify #pChallengeResult has the correct text content
      Vitest.expect(resultElement?.textContent).toContain(
        "All your party members have attacked!",
      );
      Vitest.expect(gameParty.players[0].hp).toBe(
        initialPlayerHP - Math.floor(initialPlayerHP * 0.1),
      );
      Vitest.expect(gameParty.players[1].hp).toBe(
        initialPlayerHP - Math.floor(initialPlayerHP * 0.1),
      );
    }
  },
);
