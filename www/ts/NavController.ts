import PlayerService from './PlayerService.js';
import PlayerView from './PlayerView.js';

import type { OnsCarouselElement as CarouselElement } from '../lib/onsenui';

export default class NavController{
    constructor(private playerService: PlayerService = new PlayerService(),
                private playerView: PlayerView = new PlayerView()) {
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

    // navigateCarousel(event: Event){
    //     const carousel =
    //         document.getElementById("carouselNewGame") as CarouselElement | null;
        
    //     if (!carousel){
    //         console.error("Carousel element not found.");
    //         return;
    //     }

    //     if (event instanceof KeyboardEvent && event.type === "keydown") {

    //         const target = event.target;

    //         if (event.key === "ArrowRight") {
    //             event.preventDefault();
    //             carousel.next();
    //             return;
    //         }
    //         else if (event.key === "ArrowLeft") {
    //             event.preventDefault();
    //             carousel.prev();
    //             return;
    //         }
    //         return;
    //     }

    //     if (event.type === "click" &&
    //         (event.currentTarget as HTMLElement)?.id === "btnNewGame") {
    //         carousel.next();
    //         return;
    //     }

    //     console.log("unexpected navigation event", event.currentTarget);
    // }
    onCarouselNewGame(event: Event) {
        const carousel = document.getElementById("carouselNewGame") as CarouselElement | null;
        if (!carousel) {
            console.error("Carousel element not found.");
            return;
        }

        carousel.next();
    }

    onCarouselPlayersPreChange(event: Event) {
        const activeItem = NavController.getActiveCarouselItem(event);

        if (activeItem?.id === "caiPlayers") {
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
};