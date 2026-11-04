import CarouselItem from "./CarouselItem.ts";
import NavController from "../NavController.ts";
import PlayerService from "../PlayerService.ts";
import must from "../utilities/RequiredField.ts";
import GameTasks from "../templates/GameTasks.ts";

export default class Dungeon extends CarouselItem {
  private constructor(
    carouselItem: HTMLElement,
    private readonly navController: NavController,
    private readonly playerService: PlayerService,
  ) {
    super(carouselItem);
  }

  static async create(
    navController: NavController,
    playerService: PlayerService,
  ): Promise<Dungeon> {
    const element = must(await this.loadElement("../views/dungeon.html"));
    const dungeon = new Dungeon(element, navController, playerService);

    const footer = must(dungeon.carouselItem.querySelector("footer"));
    footer.after(GameTasks.instance.templateFragment);

    return dungeon;
  }
}
