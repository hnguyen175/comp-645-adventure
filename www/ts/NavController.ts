import PlayerService from './PlayerService.ts';
import PlayerView from './rendering/PlayerView.ts';
import NewGame from './carousel-items/NewGame.ts';
import CarouselItem from './carousel-items/CarouselItem.ts';

import LoadGame2 from './carousel-items/LoadGame2.ts';
import Welcome from './carousel-items/Welcome.ts';
import Comrades from './carousel-items/Comrades.ts';
import DrunkenTavern from './carousel-items/DrunkenTavern.ts';

interface CarouselChangeEvent extends Event {
    carousel: ons.OnsCarouselElement;
    activeIndex: number;
}

export default class NavController {
    private carousel!: ons.OnsCarouselElement;
    newGame!: NewGame;
    loadGame2!: LoadGame2;
    welcome!: Welcome;
    comrades!: Comrades;
    drunkenTavern!: DrunkenTavern;

    constructor(private playerService: PlayerService = new PlayerService(),
        private playerView: PlayerView = new PlayerView()
    ) {
    }

    async init(): Promise<void> {
        const carousel = document.getElementById("carouselNewGame") as ons.OnsCarouselElement | null;
        if (!carousel) {
            throw new Error("Carousel element not found.");
        }

        this.carousel = carousel;

        this.newGame = await NewGame.create(this);
        this.welcome = await Welcome.create(this, this.playerService);
        this.comrades = await Comrades.create(this);
        this.loadGame2 = await LoadGame2.create(this, this.playerService);
        this.drunkenTavern = await DrunkenTavern.create(this, this.playerService);
    }

    static showSection(sectionId: string) {
        const sections = document.querySelectorAll("section");
        if (!sections || sections.length == 0) {
            console.error("No sections found in the document.");
            return;
        }

        for (const section of sections) {
            if (section.id == sectionId) {
                section.style.display = "block";
            } else {
                section.style.display = "none";
            }
        }
    }

    async onCarouselNewGame() {
        this.loadCarouselItem([this.newGame]);
        await this.carousel.next();
    }

    async onCarouselPriorDisplayingItem(event: Event) {
        const activeItem = NavController.getActiveCarouselItem(event);

        switch (activeItem?.id) {
            // case "caiNewGame":
            //     break;
            case "caiWelcome":
                await this.priorWelcome();
                break;
            case "caiPlayers":
                this.priorDisplayingPlayers();
                break;
            // case "caiLoadGame":
            //     break;
        };
    }

    private async priorWelcome() {
        await this.welcome.updateLoadGameButtonState();
    }

    private priorDisplayingPlayers() {
        console.log("Preparing to display players section.");

        if (this.playerService.activePlayers !== null) {
            this.playerView.renderPlayerCards(this.playerService.activePlayers);
        }
    }

    private static getActiveCarouselItem(event: Event) {
        const items = ((event as CarouselChangeEvent).carousel as HTMLElement).querySelectorAll("ons-carousel-item");
        const activeItem = items[(event as CarouselChangeEvent).activeIndex];
        return activeItem;
    }

    private static playerInputs(): { name: HTMLInputElement; email: HTMLInputElement } | null {
        const playerNameInput = document.getElementById("inputPlayerName") as HTMLInputElement | null;
        const playerEmailInput = document.getElementById("inputPlayerEmail") as HTMLInputElement | null;

        if (!playerNameInput || !playerEmailInput) {
            console.error("Player form fields not found.");
            return null;
        }

        return {
            name: playerNameInput,
            email: playerEmailInput
        };
    }

    async onRollButtonClick() {
        const playerInputs = NavController.playerInputs();
        if (!playerInputs) {
            console.error("Player form fields not found.");
            return;
        }
        const isValid = this.playerService.isPlayerInfoValid(playerInputs.name.value, playerInputs.email.value);

        if (!isValid.name && !isValid.email) {
            this.playerService.savePlayers(playerInputs.name.value, playerInputs.email.value);
            this.loadGame2.loadPlayers();
            await this.addCarouselItem(this.comrades);

            await this.carousel.next();

            return;
        }

        if (isValid.name) {
            this.playerView.showValidationToast(playerInputs.name, isValid.name);
        }
        if (isValid.email) {
            this.playerView.showValidationToast(playerInputs.email, isValid.email);
        }
    }

    async onLoadGame2ButtonClick(email: string): Promise<void> {
        this.playerService.loadPlayers(email);
        await this.addCarouselItem(this.comrades);

        await this.carousel.next();
    }

    async onReloadButtonClick() {
        // add load-game html page
        this.loadCarouselItem([this.loadGame2]);

        await this.carousel.next();
    }

    async addCarouselItem(carouselItem: CarouselItem) {
        const existingItem = this.carousel.querySelector<HTMLElement>(`ons-carousel-item#${carouselItem.getCarouselItem().id}`);
        if (!existingItem) {
            this.carousel.appendChild(carouselItem.getCarouselItem());
        }
    }

    loadCarouselItem(carouselItems: CarouselItem[]) {
        this.cleanupCarouselItems();

        for (const carouselItem of carouselItems) {
            this.carousel.appendChild(carouselItem.getCarouselItem());
        }
    }

    async onGameStart() {
        await this.addCarouselItem(this.drunkenTavern);
        await this.carousel.next();
    }

    async onDeleteGame(email: string) {
        this.playerService.deletePlayers(email);
        this.loadGame2.loadPlayers();

        // if there are still players left, do not navigate back to the welcome screen
        if (this.playerService.listPlayersFromStorage().length > 0) {
            this.cleanupCarouselItems();
            return;
        }

        // if there are no players left, go back to the welcome screen
        // for preventing to swipe back, delete all items except for the welcome item
        await this.resetCarouselToWelcome();
    }

    private async resetCarouselToWelcome() {
        await this.carousel.prev();

        this.cleanupCarouselItems();
    }

    // This method removes all carousel items that are after the currently active item. This is useful for cleaning up the carousel when navigating back to a previous item, ensuring that only relevant items remain in the carousel.
    private cleanupCarouselItems() {
        const items = (this.carousel as HTMLElement).querySelectorAll("ons-carousel-item");
        let index = 0;
        const activeIndex = this.getActiveIndex();
        for (const item of items) {
            if (activeIndex < index) {
                item.remove();
            }
            index++;
        }
    }

    // Workaround for BAD onsen return type of getActiveIndex, currently it's define in .d.ts as 'void'
    private getActiveIndex(): number {
        return (this.carousel.getActiveIndex as unknown as () => number)();
    }
};