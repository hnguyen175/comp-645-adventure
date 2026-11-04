import CarouselItem from "./CarouselItem.ts";
import NavController from "../NavController.ts";
import PlayerService from "../PlayerService.ts";
import GameTasks from "../templates/GameTasks.ts";
import must from "../utilities/RequiredField.ts";
import PlayerView from "../rendering/PlayerView.ts";
import currentGameState from "../GameState.ts";
import Player from "../Player.ts";
import tmplGotoNextChallenge from "../templates/GoToNextChalllenge.ts";
import { fireAndForget } from "../utilities/AsyncUtils.ts";

export default abstract class BaseBattleChallenge extends CarouselItem {
  constructor(
    carouselItem: HTMLElement,
    private readonly navController: NavController,
    private readonly playerService: PlayerService,
    private readonly playerView: PlayerView,
    private miniBoss: Player,
  ) {
    super(carouselItem);
  }

  protected setupControls(battleChallenge: BaseBattleChallenge): void {
    const footer = must(battleChallenge.carouselItem.querySelector("footer"));

    footer.after(GameTasks.instance.templateFragment);

    battleChallenge.renderPlayers();
    battleChallenge.addAttackButtons();

    battleChallenge.playerView.renderPlayerCardsByName(
      battleChallenge.carouselItem,
      "divChallengeVillain",
      [battleChallenge.miniBoss],
      ["hp", "wep", "cls"],
    );
  }

  private renderPlayers(): void {
    this.playerView.renderPlayerCards(
      this.carouselItem,
      must(currentGameState?.getParty()?.players),
      ["hp", "wep", "cls"],
    );
  }

  private addAttackButtons(): void {
    this.carouselItem.querySelectorAll(".player-card").forEach((card) => {
      const name = card.querySelector('[data-property="name"]')?.textContent; // Get the player's name from the card

      // get the data-player-id attribute from the card
      const playerId = must(card.getAttribute("data-player-id"));

      const attackButton = document.createElement("ons-button");
      // set the attribute data-player-id to the button
      attackButton.setAttribute("data-player-id", playerId);

      attackButton.textContent = `Attack`;
      attackButton.addEventListener("click", () => {
        // Handle the attack logic here
        fireAndForget(this.processPlayerAttack(name, playerId, attackButton));
      });
      card.appendChild(attackButton);
    });
  }

  private async processPlayerAttack(
    name: string | undefined,
    playerId: string,
    attackButton: HTMLElement,
  ) {
    // You can add more logic here to handle the attack, such as updating the game state, etc.
    const hpValue = must(
      this.carouselItem.querySelector(
        `[data-player-id="${playerId}"] .clsValue`,
      )?.textContent,
    );
    const strValue = must(
      currentGameState
        .getParty()
        ?.players.find((player) => player.id === playerId)?.str,
    );
    console.log(
      `Player ${name} (ID: ${playerId}) - hp: ${hpValue}, str: ${strValue}  is attacking the mini-boss!`,
    );

    // disable the button after click
    attackButton.setAttribute("disabled", "true");

    // reduce miniboss by the player's stat value
    const bossHp = this.applyDamageToBoss(strValue);

    console.log(`Mini-boss HP reduced by ${strValue}. New HP: ${bossHp}`);

    if (bossHp > 0) {
      this.applyDamageToPlayer(playerId);
    }

    await this.updateBattleResult(name, strValue);
  }

  private async updateBattleResult(name: string | undefined, damage: number) {
    const lakeResult = must(
      this.carouselItem.querySelector("#pChallengeResult"),
    );
    if (this.miniBoss.hp <= 0) {
      await this.handleVictoryResult(lakeResult);
    } else {
      // any player left?
      this.updateBattleMessage(lakeResult, name, damage);
    }
  }

  private updateBattleMessage(
    lakeResult: Element,
    name: string | undefined,
    damage: number,
  ) {
    if (this.carouselItem.querySelector("ons-button:not([disabled])")) {
      lakeResult.textContent = `Player ${name} attacked the mini-boss for ${damage} damage! ${this.miniBoss.name}'s HP is now ${this.miniBoss.hp}. Keep fighting and choose another party member!`;
    } else {
      lakeResult.textContent = `All your party members have attacked! The mini-boss still has ${this.miniBoss.hp} HP left. You need to strategize and try again!`;
    }
  }

  private async handleVictoryResult(lakeResult: Element) {
    this.awardStatsToPlayers();
    const tmpGold = must(currentGameState.getParty()?.earnedGold);

    lakeResult.textContent = `You defeated the ${this.miniBoss.name}! and earned ${tmpGold.toLocaleString()} Gold!`;

    this.carouselItem.querySelectorAll("ons-button").forEach((button) => {
      button.setAttribute("disabled", "true");
    });

    const templateFragment = must(tmplGotoNextChallenge.templateFragment);
    const gotoNextButton = templateFragment.querySelector(
      ".next-challenge-button",
    )!;
    const nextChallenge = await this.navController.createNextChallenge(this);
    gotoNextButton.textContent = nextChallenge.constructor.name;

    gotoNextButton.addEventListener("click", () => {
      this.carouselItem.replaceWith(nextChallenge.carouselItem);
    });

    const footer = must(this.carouselItem.querySelector("footer"));
    footer.before(templateFragment);
  }

  private applyDamageToBoss(statValue: number) {
    this.miniBoss.hp = Math.max(this.miniBoss.hp - statValue, 0); // Ensure HP doesn't go below 0

    const bossStatCell = must(
      this.carouselItem.querySelector("#divChallengeVillain .clsValue"),
    );
    bossStatCell.textContent = this.miniBoss.hp.toString();

    const listItem = must(bossStatCell.closest<HTMLElement>("ons-list-item"));
    listItem.classList.remove("row-flash");
    void listItem.offsetWidth; // Trigger reflow to restart the animation
    listItem.classList.add("row-flash");

    return this.miniBoss.hp;
  }

  private applyDamageToPlayer(playerId: string) {
    const attackingPlayer = must(
      currentGameState
        .getParty()
        ?.players.find((player) => player.id === playerId),
    );

    attackingPlayer.hp -= Math.ceil(attackingPlayer.hp * 0.1); // reduce the player's HP by 10%

    const playerStatCell = must(
      this.carouselItem.querySelector(
        `[data-player-id="${playerId}"] .clsValue`,
      ),
    );
    playerStatCell.textContent = attackingPlayer.hp.toString();
    const listItem = must(playerStatCell.closest("ons-list-item"));
    listItem.classList.add("row-flash");

    return attackingPlayer.hp;
  }

  protected abstract awardStatsToPlayers(): void;
}
