import PlayerService from './PlayerService.ts';
import PlayerView from './rendering/PlayerView.ts';
import AllPlayersList from './rendering/AllPlayersList.ts';

declare const ons: any;

import type { OnsCarouselElement as CarouselElement } from '../lib/onsenui';

export default class NavController{
    private carousel!: CarouselElement;

    constructor(private playerService: PlayerService = new PlayerService(),
                private playerView: PlayerView = new PlayerView()) {
    }

    init() : void {
        const carousel = document.getElementById("carouselNewGame") as CarouselElement | null;
        if (!carousel) {
            throw new Error("Carousel element not found.");
        }

        this.carousel = carousel;
    }

    static showSection(sectionId: string){
        let sections = document.querySelectorAll("section");
        if (!sections || sections.length == 0){
            console.error("No sections found in the document.");
            return;
        }

        for (let section of sections){
            if (section.id == sectionId){
                section.style.display = "block";
            } else {
                section.style.display = "none";
            }
        }
    }

    onCarouselNewGame(event: Event) {
        this.carousel.next();
    }

    onCarouselPriorDisplayingItem(event: Event) {
        const activeItem = NavController.getActiveCarouselItem(event);
        switch (activeItem?.id) {
            case "caiNewGame":
                this.carousel.swipeable = false;
                break;
            case "caiPlayers":
                this.priorDisplayingPlayers();
                break;
            case "caiLoadGame":
                this.priorDisplayingLoadGame();
                break;
        }; 
    }

    private priorDisplayingLoadGame() {
        // Implement any logic needed before displaying the load game section
        const listPlayers = document.getElementById("lstPlayers");
        if (!listPlayers) {
            console.error("Player list element not found.");
            return;
        }

        // ons-select expands to a select element, so we need to access the underlying select element
        const selectElement = listPlayers.querySelector("select");
        if (!selectElement) {
            console.error("Player select element not found.");
            return;
        }

        AllPlayersList.renderAllPlayersList(selectElement, this.playerService.listPlayersFromStorage());

        this.carousel.swipeable = false; // Allow swiping after loading players
    }

    private priorDisplayingPlayers() {
        console.log("Preparing to display players section.");

        if (this.playerService.activePlayers !== null) {
            this.playerView.renderPlayerCards(this.playerService.activePlayers);
        }
    }

    private static getActiveCarouselItem(event: Event) {
        const items = ((event as any).carousel as HTMLElement).querySelectorAll("ons-carousel-item");
        const activeItem = items[(event as any).activeIndex];
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

    async onRollButtonClick(event: Event) {
        const playerInputs = NavController.playerInputs();
        if (!playerInputs) {
            console.error("Player form fields not found.");
            return;
        }
        const isValid = this.playerService.isPlayerInfoValid(playerInputs.name.value, playerInputs.email.value);
        if (!isValid.name && !isValid.email) {


            this.playerService.savePlayers(playerInputs.name.value, playerInputs.email.value);

            this.carousel.swipeable = true;
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

    async onLoadGameButtonClick(event: Event) {
        const listPlayers = document.getElementById("lstPlayers") as any;
        if (!listPlayers) {
            console.error("Player list element not found.");
            return;
        }
        
        const selectedEmail = listPlayers.value;
        if (!selectedEmail) {
            console.error("No player selected for loading.");
            return;
        }

        // Implement the load game functionality here
        const players = this.playerService.loadPlayers(selectedEmail);
        console.log("Load Game button clicked: ", selectedEmail, players);
        this.carousel.swipeable = true;
        await this.carousel.next();
    }

    async onReloadButtonClick(event: Event) {
        await this.carousel.next(); // Move to the first item after reloading all items
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

    private async loadFile(file: string, carousel: any) {
        const response = await fetch(file);
        const html = await response.text();
        const item = ons.createElement(html.trim());

        carousel.appendChild(item);
    }
};