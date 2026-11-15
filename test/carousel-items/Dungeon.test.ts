/// <reference types="vitest" />

import * as Vitest from "vitest";
import Dungeon from "../../www/ts/carousel-items/Dungeon";
import GameTasks from "../../www/ts/templates/GameTasks";
import Party from "../../www/ts/Party";
import Player from "../../www/ts/Player";
import currentGameState from "../../www/ts/GameState";
import must from "../../www/ts/utilities/RequiredField";

Vitest.beforeAll(async () => {
  Vitest.vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
    const dungeon = await import("../../www/views/dungeon.html?raw");
    return new Response(dungeon.default);
  });

  Vitest.vi.stubGlobal("ons", {
    createElement: Vitest.vi.fn((html: string) => {
      const template = document.createElement("template");
      template.innerHTML = html;
      return template.content.firstElementChild;
    }),
  });

  const party = new Party();
  party.addPlayer(new Player());
  currentGameState.setParty(party);

  document.body.innerHTML = /*html*/ `
<html>
        <ons-carousel id="carouselNewGame" swipeable auto-scroll>
        </ons-carousel>
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

Vitest.test.each([
  [1_000, "You have successfully escaped the dungeon!"],
  [5_000, "You have escaped the dungeon!"],
  [9_000, "You have barely escaped the dungeon!"],
  [11_000, "You have barely escaped the dungeon!"],
])(
  "Dungeon.create should create a Dungeon instance and handle button click after %i ms",
  async (timeout, expectedText) => {
    const mockCreateNextChallenge = Vitest.vi.fn(async () => ({
      constructor: { name: "Dungeon" },
    }));
    // Vitest.test("Dungeon.create should create a Dungeon instance", async () => {
    // const mockCreateNextChallenge = Vitest.vi.fn(() => Promise.resolve());

    const mockNavController = {
      createNextChallenge: mockCreateNextChallenge,
    } as any;
    // const mockNavController = {} as any;
    const mockPlayerService = {} as any;
    const dungeon = await Dungeon.create(mockNavController, mockPlayerService);

    Vitest.expect(dungeon).toBeInstanceOf(Dungeon);

    // const transition = Vitest.vi.spyOn(
    //   dungeon as unknown as {
    //     transitionToNextChallenge: () => Promise<void>;
    //   },
    //   "transitionToNextChallenge",
    // );

    dungeon.onPostDisplayingItem();

    window.setTimeout(() => {
      //grab the buttons and simulate clicks
      const buttons =
        dungeon.carouselItem.querySelectorAll<HTMLButtonElement>(
          "#btnDunAction",
        );
      buttons.forEach((button) => {
        button.click();
      });
    }, timeout);

    await Vitest.vi.waitFor(
      () => {
        // Vitest.expect(mockCreateNextChallenge).toHaveBeenCalled();

        // Since the timeout is 3 out of 10 seconds, we expect the #pDunEnemy text to be "You have escaped the dungeon!"
        const pDunEnemy = must(
          dungeon.carouselItem.querySelector("#pDunEnemy"),
        );
        Vitest.expect(pDunEnemy?.textContent).toBe(expectedText);
      },
      {
        timeout: 25_000,
        interval: 1_000,
      },
    );
  },
);
