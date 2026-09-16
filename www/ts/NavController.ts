import PlayerService from './PlayerService.ts';
import PlayerView from './PlayerView.ts';

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

    onCarouselPlayersPreChange(event: Event) {
        const activeItem = NavController.getActiveCarouselItem(event);
        switch (activeItem?.id) {
            case "caiNewGame":
                this.carousel.swipeable = false;
                break;
            case "caiPlayers":
                const playerInputs = NavController.playerInputs();
                if (!playerInputs) {
                    console.error("Player information not found.");
                    return;
                }
                if (!playerInputs.name.value || !playerInputs.email.value) {
                    console.error("Player name or email is empty.");
                    return;
                }
                
                const players = this.playerService.savePlayers(playerInputs.name.value, playerInputs.email.value);
                if (!players) {
                    console.error("Failed to save players.");
                    return;
                }

                this.playerView.renderPlayerCards(players);
                break;
        }; 
    }

    onCarouselNewGamePostChange(event: Event) {
        const activeItem = NavController.getActiveCarouselItem(event);

        if (activeItem?.id !== "caiNewGame") {
            return;
        }

        const player = this.playerService.loadMainPlayer();
        if (!player) {
            console.error("Failed to load main player.");
            return;
        }

        const playerInputs = NavController.playerInputs();
        if (playerInputs) {
            playerInputs.name.value = player.name;
            playerInputs.email.value = player.email;
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
        console.log("Roll button clicked");

        this.carousel.swipeable = true;
        await this.carousel.next();
    }
};