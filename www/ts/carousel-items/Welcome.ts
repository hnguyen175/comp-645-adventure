import CarouselItem from './CarouselItem.ts';
import must from '../utilities/RequiredField.ts';
import NavController from '../NavController.ts';
import PlayerService from '../PlayerService.ts';
import loggingProxy from '../utilities/LoggingProxy.ts';

export default class Welcome extends CarouselItem {
    constructor(carouselItem: HTMLElement, private readonly navController: NavController, private readonly playerService: PlayerService) {
        super(carouselItem);
    }

    static async create(navController: NavController, playerService: PlayerService): Promise<Welcome> {
        const element = must(await this.loadElement("../views/welcome.html"));
        const welcome = loggingProxy(new Welcome(element, navController, playerService));

        welcome.registerEvents();
        await welcome.updateLoadGameButtonState();

        return welcome;
    }

    private registerEvents(): void {
        const carouselItem = this.carouselItem;
        carouselItem.addEventListener("click", (event) => {
            void this.handleButtonClick(event);
        });
    }

    private async handleButtonClick(event: Event): Promise<void> {
        if ((event.target as HTMLElement).closest("#btnNewGame")) {
            await this.navController.onCarouselNewGame();
        }
        else if ((event.target as HTMLElement).closest("#btnReload")) {
            await this.navController.onReloadButtonClick();
        }
    }

    // disable 'reload' button if there are no players in storage
    async updateLoadGameButtonState(): Promise<void> {
        const carouselItem = this.carouselItem;
        const reloadButton = must(carouselItem.querySelector<HTMLElement>("#btnReload"));
        const players = await this.playerService.listPlayersFromStorage();
        if (!players || players.length === 0) {
            reloadButton.setAttribute("disabled", "true");
        } else {
            reloadButton.removeAttribute("disabled");
        }
    }
}