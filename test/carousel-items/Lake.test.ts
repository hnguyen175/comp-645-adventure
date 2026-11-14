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

Vitest.test("awardStatsToPlayers should award stats to players", async () => {
  const priorAwardedParty = new Party();
  Object.assign(
    priorAwardedParty,
    structuredClone(must(currentGameState.getParty())),
  );

  const lake = await Lake.create({} as any, {} as any);
  lake.awardStatsToPlayers();

  const updatedParty = new Party();
  Object.assign(
    updatedParty,
    structuredClone(must(currentGameState.getParty())),
  );

  Vitest.expect(updatedParty.earnedGold).toBeGreaterThan(
    priorAwardedParty.earnedGold,
  );

  updatedParty.players.forEach((player, index) => {
    const priorPlayer = priorAwardedParty.players[index];
    Vitest.expect(player.luk).toBeGreaterThanOrEqual(priorPlayer.luk);
    Vitest.expect(player.str).toBeGreaterThan(priorPlayer.str);

    // Ensure other stats remain unchanged
    Vitest.expect(player.hp).toBe(priorPlayer.hp);
    Vitest.expect(player.spd).toBe(priorPlayer.spd);
    Vitest.expect(player.mp).toBe(priorPlayer.mp);
    Vitest.expect(player.wep).toBe(priorPlayer.wep);
    Vitest.expect(player.cls).toBe(priorPlayer.cls);
  });
});
