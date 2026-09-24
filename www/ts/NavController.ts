import PlayerService from './PlayerService.ts';
import PlayerView from './rendering/PlayerView.ts';
import NewGame from './carousel-items/NewGame.ts';
import CarouselItem from './carousel-items/CarouselItem.ts';
import must from './utilities/RequiredField.ts';

import type { OnsCarouselElement as CarouselElement } from '../lib/onsenui';
import loggingProxy from './utilities/LoggingProxy.ts';
import LoadGame from './carousel-items/LoadGame.ts';

interface CarouselChangeEvent extends Event {
    carousel: ons.OnsCarouselElement;
    activeIndex: number;
}

export default class NavController{
    private carousel!: ons.OnsCarouselElement;
    newGame!: NewGame;
    loadGame!: LoadGame;

    constructor(private playerService: PlayerService = loggingProxy(new PlayerService()),
                private playerView: PlayerView = loggingProxy(new PlayerView())
                ) {
    }

    async init() : Promise<void> {
        const carousel = document.getElementById("carouselNewGame") as CarouselElement | null;
        if (!carousel) {
            throw new Error("Carousel element not found.");
        }

        this.carousel = carousel;

        this.newGame = await NewGame.create(this);
        this.loadGame= await LoadGame.create(this, this.playerService);
    }

    static showSection(sectionId: string){
        const sections = document.querySelectorAll("section");
        if (!sections || sections.length == 0){
            console.error("No sections found in the document.");
            return;
        }

        for (const section of sections){
            if (section.id == sectionId){
                section.style.display = "block";
            } else {
                section.style.display = "none";
            }
        }
    }

    async onCarouselNewGame() {
        await this.loadCarouselItem([this.newGame]);
        await this.carousel.next();
    }

    onCarouselPriorDisplayingItem(event: Event) {
        const activeItem = NavController.getActiveCarouselItem(event);
        switch (activeItem?.id) {
            case "caiNewGame":
                break;
            case "caiPlayers":
                this.priorDisplayingPlayers();
                break;
            case "caiLoadGame":
                break;
        }; 
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

    private static playerInputs() : { name: HTMLInputElement; email: HTMLInputElement } | null {
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
            this.loadGame.loadPlayers();
            await this.addCarouselItem("views/players.html");

            await this.carousel.next();

            return;
        }

        if (isValid.name) {
            await this.playerView.showValidationToast(playerInputs.name, isValid.name);
        }
        if (isValid.email) {
            await this.playerView.showValidationToast(playerInputs.email, isValid.email);
        }
    }

    async onLoadGameButtonClick() {
        const listPlayers = must(document.getElementById("lstPlayers") as HTMLSelectElement | null);
        
        const selectedEmail = listPlayers.value;
        if (!selectedEmail) {
            console.error("No player selected for loading.");
            return;
        }

        // Implement the load game functionality here
        const players = this.playerService.loadPlayers(selectedEmail);
        console.log("Load Game button clicked: ", selectedEmail, players);
        await this.addCarouselItem("views/players.html");

        await this.carousel.next();
    }

    async onReloadButtonClick() {
        // add load-game html page
        await this.loadCarouselItem([this.loadGame]);

        await this.carousel.next();
    }

    async loadCarouselItems(files: string[]) {
        const allCarouselItems = this.carousel.querySelectorAll("ons-carousel-item") as NodeListOf<HTMLElement>;

        for (const item of allCarouselItems) {
            if (item.id !== "caiWelcome") { // Keep the welcome item
                item.remove();
            }
        }

        for (const file of files) {
            await this.loadFile(file, this.carousel);
        }
    }

    async addCarouselItem(file: string) {
        await this.loadFile(file, this.carousel);
    }

    private async loadFile(file: string, carousel: CarouselElement) {
        const response = await fetch(file);
        const html = await response.text();
        const item = ons.createElement(html.trim()) as Node;

        carousel.appendChild(item);
    }

    async loadCarouselItem(carouselItems: CarouselItem[]){
        const allCarouselItems = this.carousel.querySelectorAll("ons-carousel-item") as NodeListOf<HTMLElement>;

        for (const item of allCarouselItems) {
            if (item.id !== "caiWelcome") { // Keep the welcome item
                item.remove();
            }
        }

        for (const carouselItem of carouselItems) {
            this.carousel.appendChild(carouselItem.getCarouselItem());
        }
    }
};