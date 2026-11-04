/// <reference types="vite/client" />

import * as Vitest from "vitest";
import Bridge from "../../www/ts/carousel-items/Bridge";
import GameTasks from "../../www/ts/templates/GameTasks";
import Party from "../../www/ts/Party";
import Player from "../../www/ts/Player";
import currentGameState from "../../www/ts/GameState";
import must from "../../www/ts/utilities/RequiredField";

Vitest.beforeAll(async () => {
  Vitest.vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
    const bridge = await import("../../www/views/bridge.html?raw");
    return new Response(bridge.default);
  });

  Vitest.vi.stubGlobal("ons", {
    createElement: Vitest.vi.fn((html: string) => {
      const template = document.createElement("template");
      template.innerHTML = html.trim();
      return template.content.firstElementChild as HTMLElement;
    }),
  });

  GameTasks.initialize({} as any); // Initialize GameTasks with a mock NavController

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

  const party = new Party();
  party.addPlayer(new Player());
  currentGameState.setParty(party);
});

Vitest.beforeEach(() => {});

Vitest.test("Bridge constructor should create a Bridge instance", async () => {
  const mockNavController = {} as any;
  const mockPlayerService = {} as any;
  const mockTemplate = {} as any;

  const bridge = await Bridge.create(mockNavController, mockPlayerService);
  Vitest.expect(bridge).toBeInstanceOf(Bridge);
});

Vitest.test("awardStatsToPlayers should award stats to players", async () => {
  const mockNavController = {} as any;
  const mockPlayerService = {} as any;
  const mockTemplate = {} as any;

  const bridge = await Bridge.create(mockNavController, mockPlayerService);
  Vitest.expect(bridge).toBeInstanceOf(Bridge);
  let party = must(currentGameState.getParty());
  let beforeParty: Party = new Party();
  Object.assign(beforeParty, structuredClone(party));

  bridge.awardStatsToPlayers();

  party = must(currentGameState.getParty());

  Vitest.expect(beforeParty.earnedGold).toBeLessThan(party.earnedGold);
  party.players.forEach((player, index) => {
    const beforePlayer = beforeParty.players[index];
    Vitest.expect(beforePlayer.luk).toBeLessThan(player.luk);
    Vitest.expect(beforePlayer.mp).toBeLessThan(player.mp);

    Vitest.expect(beforePlayer.hp).toBe(beforePlayer.hp);
    Vitest.expect(beforePlayer.str).toBe(beforePlayer.str);
    Vitest.expect(beforePlayer.spd).toBe(player.spd);
    Vitest.expect(beforePlayer.wep).toBe(beforePlayer.wep);
    Vitest.expect(beforePlayer.cls).toBe(beforePlayer.cls);
  });
});
