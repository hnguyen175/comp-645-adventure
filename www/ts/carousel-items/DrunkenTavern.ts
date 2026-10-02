import CarouselItem from "./CarouselItem.ts";
import must from "../utilities/RequiredField.ts";
import NavController from "../NavController.ts";
import PlayerService from "../PlayerService.ts";

export default class DrunkenTavern extends CarouselItem {
    constructor(
        carouselItem: HTMLElement,
        private readonly navController: NavController,
        private readonly playerService: PlayerService) {
        super(carouselItem);
    }

    static async create(
        navController: NavController,
        playerService: PlayerService,
    ): Promise<DrunkenTavern> {
        const element = must(await this.loadElement("../views/drunken-tavern.html"));
        const drunkadTavern = new DrunkenTavern(element, navController, playerService);

        drunkadTavern.registerEvents();
        return drunkadTavern;
    }

    private registerEvents(): void {
    }
}