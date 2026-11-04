import Player from "../Player.ts";
import must from "../utilities/RequiredField.ts";

export const playerStatsIconMap = new Map<string, string>([
  ["hp", "❤️"],
  ["str", "💪"],
  ["spd", "🏃"],
  ["mp", "🔮"],
  ["luk", "🍀"],
  ["wep", "⚔️"],
  ["cls", "🎭"],
]);

class PlayerDisplay {
  static createPlayerCard(player: Player, columns: string[]): string {
    let playerHtml = /*html*/ `
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

      let displayValue: string = /*html*/ `<span class="clsValue">${value}</span>`;
      const icon = must(playerStatsIconMap.get(property));
      displayValue = `${icon}${displayValue}`;

      playerHtml += /*html*/ `<ons-list-item class="player-stat" data-property="${property}">${displayValue}</ons-list-item>`;
    });

    playerHtml += `</ons-list></ons-card>`;
    return playerHtml;
  }

  private static createImgUrl(player: Player): string {
    return `https://api.dicebear.com/10.x/adventurer/svg?seed=${encodeURIComponent(player.id)}&size=30&earringsProbability=30`;
  }
}

export default PlayerDisplay.createPlayerCard;
