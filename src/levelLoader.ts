import { Campfire } from "./campfire";
import { Candle } from "./candle";
import data from "./data.json";
import { Enemy } from "./enemy";
import { Game } from "./game";
import { RedDust } from "./redDust";
import { Totem } from "./totem";
import { Vector } from "./types";
import { Wall } from "./wall";

type ObjectTemplateData = {
    position: { x: number; y: number };
    template: { name: string; image: string } & any;
};

const loader: Record<string, (game: Game, data: ObjectTemplateData) => void> = {
    ["totem"]: (game, data) => {
        const totem = new Totem(game);
        totem.position.set(data.position.x, data.position.y);
    },
    ["enemy"]: (game, data) => {
        const enemy = new Enemy(game);
        enemy.maxHealth = data.template.maxHealth ?? 5;
        let family = data.template.family ?? "default";
        enemy.randomHealth(family);
        enemy.position.set(data.position.x, data.position.y);
    },
    ["campfire"]: (game, data) => {
        const totem = new Campfire(game);
        totem.position.set(data.position.x, data.position.y);
    },
    ["wall"]: (game, data) => {
        const totem = new Wall(game);
        totem.position.set(data.position.x, data.position.y);
        totem.size.set(data.template.size.x, data.template.size.y);
    },
    ["path"]: (game, data) => {
        game.pathManager.addPathNode(new Vector(data.position.x, data.position.y));
    },
    ["candle"]: (game, data) => {
        const totem = new Candle(game);
        totem.position.set(data.position.x, data.position.y);
    },
    ["redDust"]: (game, data) => {
        const totem = new RedDust(game);
        game.redDust = totem;
        totem.position.set(data.position.x, data.position.y);
    },
};

export function loadLevel(game: Game) {
    for (const datum of data) {
        loader[datum.template.name](game, datum);
    }
}
