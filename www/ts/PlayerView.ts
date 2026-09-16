import Player from "./Player.ts";
import Players from "./Players.ts";

export default class PlayerView {
    renderPlayerCards(players: Players): void {
        const playerCards = document.getElementById("playerCards");
        if (!playerCards) {
            console.error("Player cards container not found.");
            return;
        }

        playerCards.innerHTML = ""; // Clear previous content
        players.players.forEach((player) => {
            playerCards.innerHTML += this.createPlayerCard(player);
        });
    };

    private createPlayerCard(player: Player) {
        let playerHtml = `<ons-card class="player-card"><ons-list><ons-list-header>${player.name}</ons-list-header>
            `;

        Object.entries(player).forEach(([property, value]) => {
            if (property === "name" || property === "email") {
                return;
            }
            playerHtml += `
                    <ons-list-item class="player-stat">${property.toUpperCase()}: ${value}</ons-list-item>
                `;
        });

        playerHtml += `
                </ons-list></ons-card>
            `;
        return playerHtml;
    }
}