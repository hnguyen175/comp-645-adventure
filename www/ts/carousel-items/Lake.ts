import NavController from "../NavController.ts";
import Player from "../Player.ts";
import PlayerService from "../PlayerService.ts";
import PlayerView from "../rendering/PlayerView.ts";
import loggingProxy from "../utilities/LoggingProxy.ts";
import RandomGenerator from "../utilities/RandomGenerator.ts";
import must from "../utilities/RequiredField.ts";
import BaseBattleChallenge from "./BaseBattleChallenge.ts";
import currentGameState from "../GameState.ts";

export default class Lake extends BaseBattleChallenge {
  public constructor(
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
  ): Promise<Lake> {
    const element = must(
      (await this.loadElement("../views/lake.html")) as HTMLElement,
    );
    const lake = loggingProxy(
      new Lake(
        element,
        navController,
        playerService,
        new PlayerView(),
        miniBoss,
      ),
    );

    lake.setupControls(lake);

    return lake;
  }

  protected awardStatsToPlayers(): void {
    const party = must(currentGameState.getParty());
    party.players.forEach((player) => {
      player.luk += RandomGenerator.playerRandomStat() / 100;
      player.str += RandomGenerator.randomStat(10, 25, 1);
    });
    party.addGold(RandomGenerator.randomStat(999, 1234, 1));
  }
}
