import PlayerService from "../PlayerService.ts";

export default class AllPlayersList {
    static renderAllPlayersList(playerListElement: ons.OnsSelectElement, players: string[]): void {
        // Remove old player options, but keep the first placeholder option
        while (playerListElement.length > 1) {
            playerListElement.removeChild(playerListElement.lastElementChild!);
        }

        players.forEach(playerEmail => {
            const optionElement = document.createElement("option");
            optionElement.value = playerEmail;
            optionElement.textContent = playerEmail;

            playerListElement?.appendChild(optionElement);
        });
    }

    static renderAllPlayersList2(playerListElement: HTMLElement, players: string[], playerService: PlayerService): void {
        // Remove old player options, but keep the first placeholder option
        while (playerListElement.children.length > 1) {
            playerListElement.removeChild(playerListElement.lastElementChild!);
        }

        players.forEach(playerEmail => {
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

            const rowDiv = onsListItem.appendChild(document.createElement("div"));
            rowDiv.classList.add("player-row");

            const nameDiv = rowDiv.appendChild(document.createElement("div"));
            nameDiv.textContent = playerName;

            const emailDiv = rowDiv.appendChild(document.createElement("div"));
            emailDiv.textContent = playerEmail;

            const levelDiv = rowDiv.appendChild(document.createElement("div"));
            levelDiv.textContent = currentScreen; // Placeholder for level info

            const trashIconDiv = rowDiv.appendChild(document.createElement("div"));
            // trashIconDiv.innerHTML = '<ons-icon icon="ion-ios-trash"></ons-icon>';
            // trashIconDiv.innerHTML = '<ion-icon name="trash-outline"></ion-icon>';
            trashIconDiv.innerHTML = '<img src="images/trash.svg" alt="Delete" class="delete-icon">';

            playerListElement?.appendChild(onsListItem);
        });
    }
};