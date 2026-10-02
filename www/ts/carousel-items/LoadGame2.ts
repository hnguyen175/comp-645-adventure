import PlayerService from "../PlayerService.ts";
import CarouselItem from "./CarouselItem.ts";
import must from "../utilities/RequiredField.ts";
import AllPlayersList from "../rendering/AllPlayersList.ts";
import NavController from "../NavController.ts";

export default class LoadGame2 extends CarouselItem {
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
    ): Promise<LoadGame2> {
        const element = await this.loadElement("../views/load-game2.html");
        const loadGame2 = new LoadGame2(element, navController, playerService);
        loadGame2.loadPlayers();

        await loadGame2.registerEvents();
        return loadGame2;
    }

    private registerEvents(): void {
        const carouselItem = must(this.getCarouselItem());
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

            await this.navController.onLoadGame2ButtonClick(email);

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
        const allPlayers = must(this.playerService.listPlayersFromStorage());
        const onsList = must(
            this.getCarouselItem().querySelector<HTMLElement>("#onslPlayers"),
        );

        AllPlayersList.renderAllPlayersList2(
            onsList,
            allPlayers,
            this.playerService,
        );
    }
}