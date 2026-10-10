import PlayerService from "../PlayerService.ts";
import CarouselItem from "./CarouselItem.ts";
import must from "../utilities/RequiredField.ts";
import AllPlayersList from "../rendering/AllPlayersList.ts";
import NavController from "../NavController.ts";
import loggingProxy from "../utilities/LoggingProxy.ts";

export default class LoadGame extends CarouselItem {
    constructor(
        carouselItem: HTMLElement,
        private readonly navController: NavController,
        private readonly playerService: PlayerService,
    ) {
        super(carouselItem);
    }

    static async create(
        navController: NavController,
        playerService: PlayerService,
    ): Promise<LoadGame> {
        const element = await this.loadElement("../views/load-game.html");
        const loadGame = loggingProxy(new LoadGame(element, navController, playerService));

        await loadGame.registerEvents();
        return loadGame;
    }

    private registerEvents(): void {
        const carouselItem = must(this.carouselItem);
        const list = must(carouselItem.querySelector<HTMLElement>("#onslPlayers"));

        list.addEventListener("click", (event) => {
            void this.handlePlayerClick(event, list);
        });
    }

    private async handlePlayerClick(event: Event, list: HTMLElement): Promise<void> {
        const target = event.target as HTMLElement;

        const listItem = target.closest("ons-list-item");
        if (listItem) {
            const email = must(listItem.getAttribute("data-email"));
            console.log(`Selected player email: ${email}`);

            if (await this.willDeleteGame(email, target)) {
                return;
            }

            await this.navController.onLoadGameButtonClick(email);

            list.querySelectorAll("ons-list-item").forEach((item) => {
                item.classList.remove("selected");
            });
            listItem?.classList.add("selected");
        }
    }

    private async willDeleteGame(
        email: string,
        eventTarget: HTMLElement,
    ): Promise<boolean> {
        const trashIcon = eventTarget.closest("img.delete-icon");
        if (trashIcon) {
            console.log(`Trash icon clicked ${email}`);
            await this.navController.onDeleteGame(email);
            return true;
        }
        return false;
    }

    loadPlayers(): void {
        // Implementation for loading players
        const onsList = must(
            this.carouselItem.querySelector<HTMLElement>("#onslPlayers"),
        );

        AllPlayersList.renderAllPlayersList(
            onsList,
            this.playerService,
        );
    }
}