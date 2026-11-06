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

export type DamageResult = {
  name: string;
  hp: number;
  damage: number;
};

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
      const playerName = must(
        card.querySelector('[data-property="name"]')?.textContent,
      ); // Get the player's name from the card

      // get the data-player-id attribute from the card
      const playerId = must(card.getAttribute("data-player-id"));

      const attackButton = document.createElement("ons-button");
      // set the attribute data-player-id to the button
      attackButton.setAttribute("data-player-id", playerId);

      attackButton.textContent = `Attack 💥`;
      attackButton.addEventListener("click", () => {
        // Handle the attack logic here
        fireAndForget(
          this.processPlayerAttack(playerName, playerId, attackButton),
        );
      });
      card.appendChild(attackButton);
    });
  }

  private async processPlayerAttack(
    playerName: string,
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
      `Player ${playerName} (ID: ${playerId}) - hp: ${hpValue}, str: ${strValue}  is attacking the mini-boss!`,
    );

    // disable the button after click
    attackButton.setAttribute("disabled", "true");

    // reduce miniboss by the player's stat value
    const villainDamage = this.applyDamageToBoss(strValue);

    console.log(
      `Mini-boss HP reduced by ${strValue}. New HP: ${villainDamage.hp}`,
    );

    let damageResult: DamageResult | undefined;
    if (villainDamage.hp > 0) {
      damageResult = this.applyDamageToPlayer(playerId);
    }

    await this.updateBattleResult(damageResult, villainDamage);
  }

  private async updateBattleResult(
    playerDamage: DamageResult | undefined,
    villainDamage: DamageResult | undefined,
  ) {
    const battleChallengeResult = must(
      this.carouselItem.querySelector("#pChallengeResult"),
    );
    if (this.miniBoss.hp <= 0) {
      await this.handleVictoryResult(battleChallengeResult);
    } else {
      // any player left?
      this.updateBattleMessage(
        battleChallengeResult,
        playerDamage,
        villainDamage,
      );
    }
  }

  private updateBattleMessage(
    battleChallengeResult: Element,
    playerDamage: DamageResult | undefined,
    villainDamage: DamageResult | undefined,
  ) {
    if (this.carouselItem.querySelector("ons-button:not([disabled])")) {
      battleChallengeResult.innerHTML = this.attackMessage(
        playerDamage,
        villainDamage,
      );
    } else {
      battleChallengeResult.innerHTML = this.defeatMessage(this.miniBoss.name);

      // save to local storage
      this.saveCurrentGame(this);
    }
  }

  private async handleVictoryResult(lakeResult: Element) {
    this.awardStatsToPlayers();
    const tmpGold = must(currentGameState.getParty()?.earnedGold);

    lakeResult.textContent = `You defeated the ${this.miniBoss.name}! and earned ${tmpGold.toLocaleString()} Gold!`;

    this.carouselItem.querySelectorAll("ons-button").forEach((button) => {
      button.setAttribute("disabled", "true");
    });

    const nextChallenge = await this.navController.createNextChallenge(this);

    this.setupNextChallengeButton(nextChallenge);

    // save to local storage
    this.saveCurrentGame(nextChallenge);
  }

  private setupNextChallengeButton(nextChallenge: CarouselItem) {
    const templateFragment = must(tmplGotoNextChallenge.templateFragment);
    const gotoNextButton = templateFragment.querySelector(
      ".next-challenge-button",
    )!;

    gotoNextButton.setAttribute("disabled", "true");

    gotoNextButton.textContent = nextChallenge.constructor.name;

    const footer = must(this.carouselItem.querySelector("footer"));
    footer.before(templateFragment);

    gotoNextButton.addEventListener("click", () => {
      console.log(
        `Navigating to the next challenge: ${nextChallenge.carouselItem.id}`,
      );
      this.carouselItem.replaceWith(nextChallenge.carouselItem);
    });

    gotoNextButton.removeAttribute("disabled");
  }

  private saveCurrentGame(nextChallenge: CarouselItem) {
    const party = must(currentGameState.getParty());
    party.currentScreen = nextChallenge.constructor.name;
    PlayerService.saveActiveParty();
  }

  private applyDamageToBoss(statValue: number) {
    const villainDamage: DamageResult = {
      name: "",
      hp: 0,
      damage: 0,
    };

    villainDamage.name = this.miniBoss.name;
    villainDamage.damage = statValue;

    villainDamage.hp = this.miniBoss.hp = Math.max(
      this.miniBoss.hp - statValue,
      0,
    ); // Ensure HP doesn't go below 0

    const bossStatCell = must(
      this.carouselItem.querySelector("#divChallengeVillain .clsValue"),
    );
    bossStatCell.textContent = this.miniBoss.hp.toString();

    const listItem = must(bossStatCell.closest<HTMLElement>("ons-list-item"));
    listItem.classList.remove("row-flash");
    void listItem.offsetWidth; // Trigger reflow to restart the animation
    listItem.classList.add("row-flash");

    return villainDamage;
  }

  private applyDamageToPlayer(playerId: string): DamageResult {
    const damageResult: DamageResult = {
      name: "",
      hp: 0,
      damage: 0,
    };

    const attackingPlayer = must(
      currentGameState
        .getParty()
        ?.players.find((player) => player.id === playerId),
    );

    damageResult.name = attackingPlayer.name;
    // 10% of the player's HP is taken as damage
    damageResult.damage = Math.ceil(attackingPlayer.hp * 0.1);
    // reduce the player's HP by 10%
    damageResult.hp = attackingPlayer.hp =
      attackingPlayer.hp - damageResult.damage;

    const playerStatCell = must(
      this.carouselItem.querySelector(
        `[data-player-id="${playerId}"] .clsValue`,
      ),
    );
    playerStatCell.textContent = attackingPlayer.hp.toString();
    const listItem = must(playerStatCell.closest("ons-list-item"));
    listItem.classList.add("row-flash");

    return damageResult;
  }

  protected abstract awardStatsToPlayers(): void;
  protected abstract attackMessage(
    playerDamage: DamageResult | undefined,
    villainDamage: DamageResult | undefined,
  ): string;
  protected abstract defeatMessage(villainName: string): string;
}
