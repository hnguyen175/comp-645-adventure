/// <reference types="vite/client" />

import * as Vitest from "vitest";
import Mountain from "../../www/ts/carousel-items/Mountain.ts";
import GameTasks from "../../www/ts/templates/GameTasks.ts";
import Party from "../../www/ts/Party.ts";
import Player from "../../www/ts/Player.ts";
import currentGameState from "../../www/ts/GameState.ts";
import must from "../../www/ts/utilities/RequiredField.ts";

Vitest.beforeAll(async () => {
  Vitest.vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
    const mountain = await import("../../www/views/mountain.html?raw");
    return new Response(mountain.default);
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

Vitest.beforeEach(() => { });

Vitest.test(
  "Mountain constructor should create a Mountain instance",
  async () => {
    const mockNavController = {} as any;
    const mockPlayerService = {} as any;
    const mockTemplate = {} as any;

    const mountain = await Mountain.create(
      mockNavController,
      mockPlayerService,
    );
    Vitest.expect(mountain).toBeInstanceOf(Mountain);
  },
);

Vitest.test("awardStatsToPlayers should award stats to players", async () => {
  const mockNavController = {} as any;
  const mockPlayerService = {} as any;
  const mockTemplate = {} as any;

  const mountain = await Mountain.create(mockNavController, mockPlayerService);
  Vitest.expect(mountain).toBeInstanceOf(Mountain);
  let party = must(currentGameState.getParty());
  let beforeParty: Party = new Party();
  Object.assign(beforeParty, structuredClone(party));

  mountain.awardStatsToPlayers();

  party = must(currentGameState.getParty());

  Vitest.expect(beforeParty.earnedGold).toBeLessThan(party.earnedGold);
  party.players.forEach((player, index) => {
    const beforePlayer = beforeParty.players[index];
    Vitest.expect(beforePlayer.luk).toBeLessThanOrEqual(player.luk);
    Vitest.expect(beforePlayer.spd).toBeLessThan(player.spd);

    Vitest.expect(beforePlayer.hp).toBe(beforePlayer.hp);
    Vitest.expect(beforePlayer.str).toBe(beforePlayer.str);
    Vitest.expect(beforePlayer.mp).toBe(beforePlayer.mp);
    Vitest.expect(beforePlayer.wep).toBe(beforePlayer.wep);
    Vitest.expect(beforePlayer.cls).toBe(beforePlayer.cls);
  });
});
