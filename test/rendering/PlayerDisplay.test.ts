import * as Vitest from 'vitest';
import createPlayerCard from '../../www/ts/rendering/PlayerDisplay.ts';
import Player from '../../www/ts/Player.ts';
import must from '../../www/ts/utilities/RequiredField.ts';
import { playerStatsIconMap } from '../../www/ts/rendering/PlayerDisplay.ts';

Vitest.describe('createPlayerCard for regular players, and mysterious players', () => {
    Vitest.test.each([
        [["hp", "str", "spd", "mp", "luk", "wep", "cls"],
        [
            `${playerStatsIconMap.get("hp")}100`,
            `${playerStatsIconMap.get("str")}50`,
            `${playerStatsIconMap.get("spd")}30`,
            `${playerStatsIconMap.get("mp")}20`,
            `${playerStatsIconMap.get("luk")}10`,
            `${playerStatsIconMap.get("wep")}Sword`,
            `${playerStatsIconMap.get("cls")}Warrior`
        ],
        [
            "duh: whatsthis"
        ]
        ],
        [["wep", "cls"],
        [
            `${playerStatsIconMap.get("wep")}Sword`,
            `${playerStatsIconMap.get("cls")}Warrior`
        ],
        [
            `${playerStatsIconMap.get("hp")}100`,
            `${playerStatsIconMap.get("str")}50`,
            `${playerStatsIconMap.get("spd")}30`,
            `${playerStatsIconMap.get("mp")}20`,
            `${playerStatsIconMap.get("luk")}10`,
            "duh: whatsthis"
        ]
        ]
    ] as const)("createPlayerCard should return a string containing the player name and stats when showStrength is %s", (rows, present, absent) => {

        const player = new Player('John Doe', 'john.doe@example.com');
        player.hp = 100;
        player.str = 50;
        player.spd = 30;
        player.mp = 20;
        player.luk = 10;
        player.wep = 'Sword';
        player.cls = 'Warrior';

        const playerCardHtml = createPlayerCard(player, rows as unknown as string[]);

        const container = document.createElement('div');
        container.innerHTML = playerCardHtml;
        Vitest.expect(container.querySelector('ons-card.player-card')).not.toBeNull();
        const listHeader = must(container.querySelector('ons-card ons-list-header'));
        const listHeaderName = must(listHeader.querySelector('div.right[data-property="name"]'));
        Vitest.expect(listHeaderName?.textContent).toBe('John Doe');

        const result = container.querySelectorAll('ons-list ons-list-item.player-stat[data-property]');
        const stats = [...result].map(item => item.textContent.trim());
        present.forEach(stat => {
            Vitest.expect(stats).toContain(stat);
        });
        absent.forEach(stat => {
            Vitest.expect(stats).not.toContain(stat);
        });
    });
});