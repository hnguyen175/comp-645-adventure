import PlayerService from './PlayerService.ts';
import PlayerView from './rendering/PlayerView.ts';
import NewGame from './carousel-items/NewGame.ts';
import CarouselItem from './carousel-items/CarouselItem.ts';

import LoadGame from './carousel-items/LoadGame.ts';
import Welcome from './carousel-items/Welcome.ts';
import Comrades from './carousel-items/Comrades.ts';
import DrunkenTavern from './carousel-items/DrunkenTavern.ts';

import must from './utilities/RequiredField.ts';

import currentGameState from './GameState.ts';
import loggingProxy from './utilities/LoggingProxy.ts';
import TemplateGameTasks from './templates/TemplateGameTasks.ts';
import FangornForest from './carousel-items/FangornForest.ts';
import ShuffleBag from './utilities/ShuffleBag.ts';
import Mountain from './carousel-items/Mountain.ts';
import Lake from './carousel-items/Lake.ts';
import Bridge from './carousel-items/Bridge.ts';

interface CarouselChangeEvent extends Event {
    carousel: ons.OnsCarouselElement;
    activeIndex: number;
}

export default class NavController {
    private carousel!: ons.OnsCarouselElement;
    newGame!: NewGame;
    loadGame!: LoadGame;
    welcome!: Welcome;
    comrades!: Comrades;
    drunkenTavern!: DrunkenTavern;
    templateGameTask!: TemplateGameTasks;
    forest!: FangornForest;

    constructor(private playerService: PlayerService = loggingProxy(new PlayerService()),
        private playerView: PlayerView = new PlayerView()
    ) { }

    async init(): Promise<void> {
        const carousel = document.getElementById("carouselNewGame") as ons.OnsCarouselElement | null;
        if (!carousel) {
            throw new Error("Carousel element not found.");
        }

        this.carousel = carousel;

        this.templateGameTask = new TemplateGameTasks(this);

        this.newGame = await NewGame.create(this);
        this.welcome = await Welcome.create(this, this.playerService);
        this.comrades = await Comrades.create(this);
        this.loadGame = await LoadGame.create(this, this.playerService);
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
            case "caiComrades":
                await this.priorDisplayingPlayers();
                break;
            case "caiLoadGame":
                this.priorLoadGame();
                break;
        };
    }

    async onCarouselPostDisplayingItem(event: Event) {
        const activeItem = NavController.getActiveCarouselItem(event);
        switch (activeItem?.id) {
            case "caiComrades":
                this.postDisplayingComrades();
                break;
            // Add more cases here for other carousel items if needed
        }
    }

    private priorLoadGame() {
        this.loadGame.loadPlayers();
    }

    private async priorWelcome() {
        await this.welcome.updateLoadGameButtonState();
    }

    private async priorDisplayingPlayers() {
        this.playerView.renderPlayerCards(this.comrades.carouselItem, must(currentGameState.getPlayers()?.players));
    }

    private postDisplayingComrades() {
        this.cleanupCarouselItems();
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

    async onLoadGameButtonClick(email: string): Promise<void> {
        this.playerService.loadPlayers(email);
        await this.addCarouselItem(this.comrades);

        await this.carousel.next();
    }

    async onReloadButtonClick() {
        // add load-game html page
        this.loadCarouselItem([this.loadGame]);

        await this.carousel.next();
    }

    async addCarouselItem(carouselItem: CarouselItem) {
        const existingItem = this.carousel.querySelector<HTMLElement>(`ons-carousel-item#${carouselItem.carouselItem.id}`);
        if (existingItem) {
            return;
        }

        this.cleanupCarouselItems();
        this.carousel.appendChild(carouselItem.carouselItem);
    }

    loadCarouselItem(carouselItems: CarouselItem[]) {
        this.cleanupCarouselItems();

        for (const carouselItem of carouselItems) {
            this.carousel.appendChild(carouselItem.carouselItem);
        }
    }

    // instantiate the next challenge based on the current screen which is stored in LocalStorage. This is called when the user clicks on the "Start Game" button in the Comrades screen.
    async onGameStart() {
        switch (must(currentGameState.getPlayers())?.currentScreen) {
            case "DrunkenTavern":
                this.drunkenTavern = await DrunkenTavern.create(this, this.playerService, this.templateGameTask);
                await this.addCarouselItem(this.drunkenTavern);
                break;
            case "FangornForest":
                this.forest = await FangornForest.create(this, this.playerService, this.templateGameTask);
                await this.addCarouselItem(this.forest);
                break;
            case "Lake":
                const lake = await Lake.create(this, this.playerService, this.templateGameTask);
                await this.addCarouselItem(lake);
                break;
            case "Bridge":
                const bridge = await Bridge.create(this, this.playerService, this.templateGameTask);
                await this.addCarouselItem(bridge);
                break;
            case "Mountain":
                const mountain = await Mountain.create(this, this.playerService, this.templateGameTask);
                await this.addCarouselItem(mountain);
                break;
            default:
                console.error(`Unknown currentScreen: ${must(currentGameState.getPlayers())?.currentScreen}`);
                return;
        }
        await this.carousel.next();
    }

    async onDeleteGame(email: string) {
        this.playerService.deletePlayers(email);
        this.loadGame.loadPlayers();

        // if there are still players left, do not navigate back to the welcome screen
        if (this.playerService.listPlayersFromStorage().length > 0) {
            this.cleanupCarouselItems();
            return;
        }

        // if there are no players left, go back to the welcome screen
        // for preventing to swipe back, delete all items except for the welcome item
        await this.resetCarouselToWelcome();
    }

    async resetCarouselToWelcome() {
        await this.resetCarouselToCarouselItem(this.welcome);
    }

    async resetCarouselToLoadGame() {
        const loadGameItem = this.carousel.querySelector<HTMLElement>(`ons-carousel-item#${this.loadGame.carouselItem.id}`);
        if (!loadGameItem) {
            this.newGame.carouselItem.replaceWith(this.loadGame.carouselItem);
        }
        await this.resetCarouselToCarouselItem(this.loadGame);
    }

    async resetCarouselToCarouselItem(carouselItem: CarouselItem) {
        const index = must(this.getCarouselItemIndex(carouselItem));
        await this.carousel.setActiveIndex(index);
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

    private getCarouselItemIndex(carouselItem: CarouselItem): number {
        const items = (this.carousel as HTMLElement).querySelectorAll("ons-carousel-item");
        let index = 0;
        for (const item of items) {
            if (item.id === carouselItem.carouselItem.id) {
                return index;
            }
            index++;
        }
        return -1; // Return -1 if the carousel item is not found
    }

    static lbmChallenges = new ShuffleBag([Lake, Bridge, Mountain]);
    async createNextChallenge(carouselItem: CarouselItem): Promise<CarouselItem> {
        switch (carouselItem.constructor.name) {
            case FangornForest.name:
                const challengeType = NavController.lbmChallenges.draw();
                return await challengeType.create(this, this.playerService, this.templateGameTask);
            case DrunkenTavern.name:
                return await FangornForest.create(this, this.playerService, this.templateGameTask);
            default:
                throw new Error(`Unknown carousel item type: ${carouselItem.constructor.name}`);
        }
    }
}