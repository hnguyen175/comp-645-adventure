import TemplateGameTasks from "../templates/TemplateGameTasks.ts";
import CarouselItem from "./CarouselItem.ts";
import must from "../utilities/RequiredField.ts";

export default class Forest extends CarouselItem {
    constructor(carouselItem: HTMLElement) {
        super(carouselItem);
    }

    static async create(template: TemplateGameTasks): Promise<Forest> {
        const element = await this.loadElement("../views/forest.html");
        const forest = new Forest(element);
        // await forest.registerEvents();

        const footer = must(forest.carouselItem.querySelector("footer"));
        footer.after(template.templateFragment);

        return forest;
    }
}