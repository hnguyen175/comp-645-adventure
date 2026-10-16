import Player from "../Player.ts";

class PlayerDisplay {
    static createPlayerCard(player: Player, columns: string[]): string {
        let playerHtml = /*html*/`
        <ons-card class="player-card" data-player-id="${player.id}">
            <ons-list>
                <ons-list-header class="list-item__icon">
                    <div class="left">
                        <img src="${PlayerDisplay.createImgUrl(player)}" alt="Player avatar" class="avatar">
                    </div>
                    <div class="right" data-property="name">${player.name}</div>
                </ons-list-header>
        `;

        Object.entries(player).forEach(([property, value]) => {
            if (!columns.includes(property)) {
                return;
            }

            playerHtml += /*html*/`<ons-list-item class="player-stat" data-property="${property}">${property.toUpperCase()}: <span class="clsValue">${value}</span></ons-list-item>`;
        });

        playerHtml += `</ons-list></ons-card>`;
        return playerHtml;
    }

    private static createImgUrl(player: Player): string {
        return `https://api.dicebear.com/10.x/adventurer/svg?seed=${encodeURIComponent(player.id)}&size=30&earringsProbability=30`;
    }
}

export default PlayerDisplay.createPlayerCard;