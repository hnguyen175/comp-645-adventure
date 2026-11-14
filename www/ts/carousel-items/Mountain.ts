import NavController from "../NavController.ts";
import PlayerService from "../PlayerService.ts";
import loggingProxy from "../utilities/LoggingProxy.ts";
import must from "../utilities/RequiredField.ts";
import BaseBattleChallenge, { DamageResult } from "./BaseBattleChallenge.ts";
import PlayerView from "../rendering/PlayerView.ts";
import Player from "../Player.ts";
import RandomGenerator from "../utilities/RandomGenerator.ts";
import currentGameState from "../GameState.ts";

export default class Mountain extends BaseBattleChallenge {
  constructor(
    carouselItem: HTMLElement,
    navController: NavController,
    playerService: PlayerService,
    playerView: PlayerView,
    miniBoss: Player,
  ) {
    super(carouselItem, navController, playerService, playerView, miniBoss);
  }

  static async create(
    navController: NavController,
    playerService: PlayerService,
    miniBoss: Player = new Player(null, null, null, {
      hp: RandomGenerator.randomStat(11, 101, 1),
      spd: RandomGenerator.villainRandomStat(),
      str: RandomGenerator.villainRandomStat(),
      mp: RandomGenerator.villainRandomStat(),
      luk: RandomGenerator.randomLuk(),
      wep: "Evil " + RandomGenerator.randomWeapon(),
      cls: "Dark " + RandomGenerator.randomClass(),
    }),
  ): Promise<Mountain> {
    const element = must(
      (await this.loadElement("../views/mountain.html")) as HTMLElement,
    );
    const mountain = loggingProxy(
      new Mountain(
        element,
        navController,
        playerService,
        new PlayerView(),
        miniBoss,
      ),
    );

    mountain.setupControls(mountain);

    return mountain;
  }

  public override awardStatsToPlayers(): void {
    const party = must(currentGameState.getParty());
    party.players.forEach((player) => {
      player.luk += Math.trunc(RandomGenerator.randomStat(50, 60, 1) / 100);
      player.spd += RandomGenerator.randomStat(10, 25, 1);
    });
    party.addGold(RandomGenerator.randomStat(111, 222, 1));
  }

  protected attackMessage(
    playerDamage: DamageResult,
    villainDamage: DamageResult,
  ): string {
    return /*html*/ `
    CRACK! A thunderous strike deals
    ${villainDamage.damage} damage to the brute!
    With ${villainDamage.hp} HP remaining,
    he's still standing. Apparently, his skull
    is thicker than the mountain!

    ${`<p>
      BOULDER DASH! ${playerDamage.name} takes
      ${playerDamage.damage} damage and has
      ${playerDamage.hp} HP left.
      Who knew rocks could be so unfriendly?
    </p>`}
  `;
  }

  protected defeatMessage(villainName: string): string {
    return /*html*/ `
    DOWN YOU GO! ${villainName} has sent your party tumbling down the mountain! At least the trip down was faster than the climb!
  `;
  }
}
