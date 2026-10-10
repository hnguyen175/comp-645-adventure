import NavController from "../NavController.ts";
import loggingProxy from "../utilities/LoggingProxy.ts";
import must from "../utilities/RequiredField.ts";
import CarouselItem from "./CarouselItem.ts";

export default class Comrades extends CarouselItem {
    constructor(carouselItem: HTMLElement, private readonly navController: NavController) {
        super(carouselItem);
    }

    static async create(navController: NavController): Promise<Comrades> {
        const element = must(await this.loadElement("../views/comrades.html"));
        const comrades = loggingProxy(new Comrades(element, navController));
        comrades.registerEvents();

        return comrades;
    }

    private registerEvents(): void {
        const carouselItem = must(this.carouselItem);
        carouselItem.addEventListener("click", (event) => {
            if ((event.target as HTMLElement).closest("#btnStartGame")) {
                void this.navController.onGameStart().catch((error) => {
                    console.error("Error in onGameStart:", error);
                });
            }
        });
    }
}