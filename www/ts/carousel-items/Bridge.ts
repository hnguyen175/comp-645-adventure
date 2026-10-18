import CarouselItem from "./CarouselItem.ts";
import NavController from "../NavController.ts";
import PlayerService from "../PlayerService.ts";
import TemplateGameTasks from "../templates/TemplateGameTasks.ts";
import loggingProxy from "../utilities/LoggingProxy.ts";
import must from "../utilities/RequiredField.ts";

export default class Bridge extends CarouselItem {
    constructor(carouselItem: HTMLElement, private readonly navController: NavController, private readonly playerService: PlayerService) {
        super(carouselItem);
    }

    static async create(navController: NavController, playerService: PlayerService, template: TemplateGameTasks): Promise<Bridge> {
        const element = must(await this.loadElement("../views/bridge.html") as HTMLElement);
        const bridge = loggingProxy(new Bridge(element, navController, playerService));

        const footer = must(bridge.carouselItem.querySelector("footer"));
        footer.after(template.templateFragment);

        return bridge;
    }
}