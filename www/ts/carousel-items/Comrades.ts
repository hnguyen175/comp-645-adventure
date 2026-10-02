import NavController from "../NavController.ts";
import must from "../utilities/RequiredField.ts";
import CarouselItem from "./CarouselItem.ts";

export default class Comrades extends CarouselItem {
    constructor(carouselItem: HTMLElement, private readonly navController: NavController) {
        super(carouselItem);
    }

    static async create(navController: NavController): Promise<Comrades> {
        const element = must(await this.loadElement("../views/players.html"));
        const comrades = new Comrades(element, navController);
        comrades.registerEvents();

        return comrades;
    }

    private registerEvents(): void {
        const carouselItem = must(this.getCarouselItem());
        carouselItem.addEventListener("click", (event) => {
            void this.handlePlayerClick(event);
        });
    }

    private async handlePlayerClick(event: Event): Promise<void> {
        if ((event.target as HTMLElement).closest("#btnStartGame")) {
            await this.navController.onGameStart();
        }
    }
}