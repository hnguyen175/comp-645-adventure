/// <reference types="vite/client" />

import * as Vitest from "vitest";
import BaseBattleChallenge from "../../www/ts/carousel-items/BaseBattleChallenge";
import Lake from "../../www/ts/carousel-items/Lake";
import GameTasks from "../../www/ts/templates/GameTasks";
import Party from "../../www/ts/Party";
import Player from "../../www/ts/Player";
import currentGameState from "../../www/ts/GameState";
import must from "../../www/ts/utilities/RequiredField";
import Mountain from "../../www/ts/carousel-items/Mountain";
import Bridge from "../../www/ts/carousel-items/Bridge";
import RandomGenerator from "../../www/ts/utilities/RandomGenerator";

import lakeHtml from "../../www/views/lake.html?raw";
import bridgeHtml from "../../www/views/bridge.html?raw";
import mountainHtml from "../../www/views/mountain.html?raw";
import dungeonHtml from "../../www/views/dungeon.html?raw";
import NavController from "../../www/ts/NavController";

Vitest.beforeEach(() => {
  Vitest.vi.restoreAllMocks();

  const template = document.createElement("template");
  template.id = "templGoToNextChallenge";
  document.body.appendChild(template);

  Vitest.vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
    switch (url) {
      case "../views/lake.html":
        return new Response(lakeHtml);
      case "../views/mountain.html":
        return new Response(mountainHtml);
      case "../views/bridge.html":
        return new Response(bridgeHtml);
      case "../views/dungeon.html":
        return new Response(dungeonHtml);
      default:
        throw new Error(`Unhandled fetch URL: ${url}`);
    }
  });

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

  <template id="templGoToNextChallenge">
    <div style="text-align: center; margin-top: 20px;" class="next-challenge">
      <p>Congratulations! You have completed the current challenge.</p>
      <p>Prepare for the next adventure!</p>
      <ons-button class="button next-challenge-button">Next Challenge</ons-button>
      <p></p>
    </div>
  </template>
        </html>
    `;
  GameTasks.initialize({} as any); // Initialize GameTasks with a mock NavController

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

Vitest.test.each([[Lake], [Mountain], [Bridge]] as const)(
  "create method should create an instance of %s",
  async (ChallengeClass) => {
    const mockPlayerService = {} as any;
    const mockNavController = new NavController();
    const challenge = await ChallengeClass.create(
      mockNavController,
      mockPlayerService,
    );

    Vitest.vi.spyOn(ChallengeClass, "create");

    await Vitest.vi.waitFor(() => {
      Vitest.expect(challenge).toBeInstanceOf(ChallengeClass);
    });
  },
);

// for (const ChallengeClass of [Lake, Mountain, Bridge] as const) {
// Vitest.describe(`Level ${ChallengeClass.name}`, () => {
Vitest.describe.each([
  [Lake, "You've been slimed"],
  [Mountain, "Who knew rocks"],
  [Bridge, "assaulting tollbooth"],
] as const)("level %s", (ChallengeClass, attackMsg) => {
  Vitest.test.each([51, 100, 150] as const)(
    "should display the correct attack message when the boss has %i HP",
    async (miniBossHp) => {
      // Mock dependencies
      const mockPlayerService = {} as any;
      const mockNavController = new NavController();
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
      const level = await ChallengeClass.create(
        mockNavController,
        mockPlayerService,
        miniBoss,
      );

      await Vitest.vi.waitFor(async () => {
        // Assert that the ChallengeClass instance is created
        Vitest.expect(level).toBeInstanceOf(ChallengeClass);
      });

      const gameParty = must(currentGameState.getParty());
      const initialMiniBossHp = miniBoss.hp;
      const initialPlayerHP = gameParty.players[0].hp;

      // Click the first attack button
      const buttons =
        level.carouselItem.querySelectorAll<HTMLElement>("ons-button");
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
      const playerStatCell = level.carouselItem.querySelector(
        'ons-list-item[data-property="hp"]',
      );
      Vitest.expect(playerStatCell?.classList.contains("row-flash")).toBe(true);

      // also esure boss' ons-list-item has 'row-flash' style applied to it
      const bossStatCell = [
        ...level.carouselItem.querySelectorAll(
          'ons-list-item[data-property="hp"]',
        ),
      ].at(-1);
      Vitest.expect(bossStatCell?.classList.contains("row-flash")).toBe(true);

      // verify #pChallengeResult has the correct text content
      const resultElement =
        level.carouselItem.querySelector("#pChallengeResult");
      Vitest.expect(resultElement?.textContent).toContain(attackMsg);
    },
  );
});

for (const [ChallengeClass, message] of [
  [Lake, "thoroughly washed"],
  [Mountain, "DOWN YOU GO"],
  [Bridge, "PAYMENT DECLINED"],
] as const) {
  Vitest.describe(`Level ${ChallengeClass.name}`, async () => {
    Vitest.test.each([51, 150] as const)(
      `boss' HP for ${ChallengeClass.name} challenge`,
      async (miniBossHp) => {
        // Mock dependencies
        const mockPlayerService = {} as any;
        const mockNavController = new NavController();
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
        const level = await ChallengeClass.create(
          mockNavController,
          mockPlayerService,
          miniBoss,
        );

        await Vitest.vi.waitFor(() => {
          // Assert that the ChallengeClass instance is created
          Vitest.expect(level).toBeInstanceOf(ChallengeClass);
        });

        const gameParty = must(currentGameState.getParty());
        const initialMiniBossHp = miniBoss.hp;
        const initialPlayerHP = gameParty.players[0].hp;

        // Click the first attack button
        const buttons =
          level.carouselItem.querySelectorAll<HTMLElement>("ons-button");
        Vitest.expect(buttons.length).toBeGreaterThan(0);
        buttons.forEach((button) => button.click()); // Click all attack buttons

        await Vitest.vi.waitFor(async () => {
          // Assert that the attack buttons is disabled
          buttons.forEach((button) => {
            Vitest.expect(button.hasAttribute("disabled")).toBe(true);
          });
        });

        const resultElement =
          level.carouselItem.querySelector("#pChallengeResult");

        // players' strengths win out
        if (miniBossHp < 100) {
          Vitest.expect(miniBoss.hp).toBe(0);
          // verify #pChallengeResult has the correct text content
          Vitest.expect(resultElement?.textContent).toContain(
            "You defeated the",
          );

          await Vitest.vi.waitFor(
            () => {
              // verify that the next challenge button is present
              const nextChallengeButton =
                level.carouselItem.querySelector<HTMLElement>(
                  ".next-challenge-button",
                );
              Vitest.expect(nextChallengeButton).not.toBeNull();

              // simulate a click on the next challenge button
              nextChallengeButton?.click();
            },
            { timeout: 5000 },
          );
        } else {
          // mini-boss' HP is still above 0
          // verify #pChallengeResult has the correct text content
          Vitest.expect(resultElement?.textContent).toContain(message);
          Vitest.expect(gameParty.players[0].hp).toBe(
            initialPlayerHP - Math.floor(initialPlayerHP * 0.1),
          );
          Vitest.expect(gameParty.players[1].hp).toBe(
            initialPlayerHP - Math.floor(initialPlayerHP * 0.1),
          );
        }
      },
    );
  });
}
