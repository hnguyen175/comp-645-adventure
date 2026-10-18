import CarouselItem from "./CarouselItem.ts";
import NavController from "../NavController.ts";
import PlayerService from "../PlayerService.ts";
import TemplateGameTasks from "../templates/TemplateGameTasks.ts";
import loggingProxy from "../utilities/LoggingProxy.ts";
import must from "../utilities/RequiredField.ts";

export default class Lake extends CarouselItem {
    constructor(carouselItem: HTMLElement, private readonly navController: NavController, private readonly playerService: PlayerService) {
        super(carouselItem);
    }

    static async create(navController: NavController, playerService: PlayerService, template: TemplateGameTasks): Promise<Lake> {
        const element = must(await this.loadElement("../views/lake.html") as HTMLElement);
        const lake = loggingProxy(new Lake(element, navController, playerService));

        const footer = must(lake.carouselItem.querySelector("footer"));
        footer.after(template.templateFragment);

        return lake;
    }
}