import PlayerService from "../PlayerService.ts";
import must from "../utilities/RequiredField.ts";
import currentGameState from "../GameState.ts";

export default class AllPlayersList {
    static renderAllPlayersList(playerListElement: HTMLElement, playerService: PlayerService): void {
        // Remove old player options, but keep the first placeholder option
        while (playerListElement.children.length > 1) {
            playerListElement.removeChild(playerListElement.lastElementChild!);
        }

        const currentPlayerEmail = currentGameState.getPlayers()?.players[0]?.email;
        // let selectedItem: HTMLElement | null = null;
        let selectedItem: HTMLElement | undefined;

        must(playerService.listPlayersFromStorage()).forEach(playerEmail => {
            const player = playerService.loadPlayers(playerEmail);
            if (!player) {
                console.error(`Player with email ${playerEmail} not found.`);
                return;
            }

            const playerName = player.players[0].name;
            const currentScreen = player.currentScreen;

            const onsListItem = document.createElement("ons-list-item");
            onsListItem.setAttribute("tappable", "");
            onsListItem.setAttribute("data-email", playerEmail);
            if (playerEmail === currentPlayerEmail) {
                onsListItem.classList.add("selected");
                selectedItem = onsListItem;
            }

            const rowDiv = onsListItem.appendChild(document.createElement("div"));
            rowDiv.classList.add("player-row");

            const nameDiv = rowDiv.appendChild(document.createElement("div"));
            nameDiv.textContent = playerName;

            const emailDiv = rowDiv.appendChild(document.createElement("div"));
            emailDiv.textContent = playerEmail;

            const levelDiv = rowDiv.appendChild(document.createElement("div"));
            levelDiv.textContent = currentScreen; // Placeholder for level info

            const trashIconDiv = rowDiv.appendChild(document.createElement("div"));
            trashIconDiv.innerHTML = '<img src="images/trash.svg" alt="Delete" class="delete-icon">';

            playerListElement?.appendChild(onsListItem);
        });

        selectedItem?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
};