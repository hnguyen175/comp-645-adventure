/// <reference types="vitest" />

import * as Vitest from "vitest";
import Final from "../../www/ts/carousel-items/Final";
import GameTasks from "../../www/ts/templates/GameTasks";
import Party from "../../www/ts/Party";
import Player from "../../www/ts/Player";
import currentGameState from "../../www/ts/GameState";

Vitest.beforeAll(async () => {
  Vitest.vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
    const final = await import("../../www/views/final.html?raw");
    return new Response(final.default);
  });

  Vitest.vi.stubGlobal("ons", {
    createElement: Vitest.vi.fn((html: string) => {
      const template = document.createElement("template");
      template.innerHTML = html;
      return template.content.firstElementChild;
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

Vitest.test("Final.create should create a Final instance", async () => {
  const final = await Final.create();
  Vitest.expect(final).toBeInstanceOf(Final);
});
