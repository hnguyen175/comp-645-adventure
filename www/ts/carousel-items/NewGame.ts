import CarouselItem from "./CarouselItem.ts";
import NavController from "../NavController.ts";
import must from "../utilities/RequiredField.ts"
import loggingProxy from "../utilities/LoggingProxy.ts";

export default class NewGame extends CarouselItem {
    constructor(carouselItem: HTMLElement, private readonly navController: NavController) {
        super(carouselItem);
    }

    static async create(navController: NavController): Promise<NewGame> {
        const element = must(await this.loadElement("../views/new-game.html"));
        const newGame = loggingProxy(new NewGame(element, navController));
        newGame.registerEvents();
        return newGame;
    }

    private registerEvents(): void {
        this.carouselItem.addEventListener("click", (event) => {
            void this.handleButtonClick(event);
        });
    }

    private async handleButtonClick(event: Event): Promise<void> {
        const target = event.target as HTMLElement;
        if (target.id === "btnRoll")
            await this.navController.onRollButtonClick();

        if (target.id === "btnClearName")
            this.emptyInput("onsPlayerName");

        if (target.id === "btnClearEmail")
            this.emptyInput("onsPlayerEmail");
    }

    private emptyInput(inputField: string): void {
        const input = this.carouselItem.querySelector(`#${inputField}`) as HTMLInputElement;
        if (input) {
            input.value = "";
            input.focus();
        }
    }
}