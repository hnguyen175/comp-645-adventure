import NavController from "../NavController.ts";
import PlayerService from "../PlayerService.ts";
import loggingProxy from "../utilities/LoggingProxy.ts";
import must from "../utilities/RequiredField.ts";
import BaseBattleChallenge, { DamageResult } from "./BaseBattleChallenge.ts";
import Player from "../Player.ts";
import PlayerView from "../rendering/PlayerView.ts";
import RandomGenerator from "../utilities/RandomGenerator.ts";
import currentGameState from "../GameState.ts";

export default class Bridge extends BaseBattleChallenge {
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
  ): Promise<Bridge> {
    const element = must(
      (await this.loadElement("../views/bridge.html")) as HTMLElement,
    );
    const bridge = loggingProxy(
      new Bridge(
        element,
        navController,
        playerService,
        new PlayerView(),
        miniBoss,
      ),
    );

    bridge.setupControls(bridge);

    return bridge;
  }

  public override awardStatsToPlayers(): void {
    const party = must(currentGameState.getParty());
    party.players.forEach((player) => {
      player.luk += Math.trunc(RandomGenerator.randomStat(50, 60, 1) / 100);
      player.mp += RandomGenerator.randomStat(10, 25, 1);
    });
    party.addGold(RandomGenerator.randomStat(55, 1234, 1));
  }

  protected attackMessage(
    playerDamage: DamageResult,
    villainDamage: DamageResult,
  ): string {
    return /*html*/ `
    WHACK! Your party delivers
    ${villainDamage.damage} damage to the troll!
    He has ${villainDamage.hp} HP left,
    and he's threatening to charge extra
    for assaulting tollbooth employees!

    ${`<p>
      CLONK! ${playerDamage.name} takes
      ${playerDamage.damage} damage and has
      ${playerDamage.hp} HP remaining.
      Apparently, that's the bridge toll!
      No refunds!
    `}
  `;
  }

  protected defeatMessage(villainName: string): string {
    return /*html*/ `
    PAYMENT DECLINED! ${villainName} has beaten your party senseless! Sorry, ${villainName}, the toll has already been collected—in bruises!
  `;
  }
}
