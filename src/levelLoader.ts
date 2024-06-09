import { Campfire } from "./campfire";
import { Candle } from "./candle";
import data from "./data.json";
import { Wizard } from "./wizard";
import { Game } from "./game";
import { RedDust } from "./redDust";
import { Totem } from "./totem";
import { Vector } from "./types";
import { Wall } from "./wall";
import { Ghost } from "./ghost";
import { Slime } from "./slime";
import { BigOoze } from "./bigOoze";
import { Obelisk } from "./obelisk";
import { Foliage } from "./foliage";

type ObjectTemplateData = {
    position: { x: number; y: number };
    template: { name: string; image: string } & any;
};

const loader: Record<string, (game: Game, data: ObjectTemplateData) => void> = {
    ["totem"]: (game, data) => {
        const totem = new Totem(game);
        totem.position.set(data.position.x, data.position.y);
        if (data.template.tag !== "") game.registerTagged(totem, data.template.tag);

    },
    ["obelisk"]: (game, data) => {
        const totem = new Obelisk(game);
        totem.position.set(data.position.x, data.position.y);
        totem.updatePosition();
    },
    ["bigOoze"]: (game, data) => {
        const totem = new BigOoze(game);
        totem.position.set(data.position.x, data.position.y);
    },
    ["wizard"]: (game, data) => {
        const enemy = new Wizard(game);
        enemy.maxHealth = data.template.health ?? 4;
        let family = data.template.family ?? "default";
        enemy.type = data.template.type ?? 0;
        enemy.randomHealth(family);
        enemy.position.set(data.position.x, data.position.y);
        if (data.template.tag !== "") game.registerTagged(enemy, data.template.tag);
        if(data.template.tag === "wizardBoss"){
            enemy.boss();
        }

    },
    ["ghost"]: (game, data) => {
        const enemy = new Ghost(game);
        enemy.maxHealth = data.template.health ?? 2;
        let family = data.template.family ?? "default";
        enemy.randomHealth(family);
        enemy.position.set(data.position.x, data.position.y);
        if (data.template.tag !== "") game.registerTagged(enemy, data.template.tag);

    },
    ["slime"]: (game, data) => {
        const enemy = new Slime(game);
        enemy.maxHealth = data.template.health ?? 6;
        let family = data.template.family ?? "default";
        enemy.randomHealth(family);
        enemy.position.set(data.position.x, data.position.y);
        if (data.template.tag !== "") game.registerTagged(enemy, data.template.tag);
    },
    ["campfire"]: (game, data) => {
        const totem = new Campfire(game);
        totem.position.set(data.position.x, data.position.y);
        if (data.template.tag !== "") game.registerTagged(totem, data.template.tag);
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
    ["tree"]: (game, data) => {
        const foliage = new Foliage(game, data.template.name);
        foliage.position.set(data.position.x, data.position.y);
        foliage.init();
    },
    ["bush"]: (game, data) => {
        const foliage = new Foliage(game, data.template.name);
        foliage.position.set(data.position.x, data.position.y);
        foliage.init();
    },
    ["log"]: (game, data) => {
        const foliage = new Foliage(game, data.template.name);
        foliage.position.set(data.position.x, data.position.y);
        foliage.init();
    },
    ["logFlat"]: (game, data) => {
        const foliage = new Foliage(game, data.template.name);
        foliage.position.set(data.position.x, data.position.y);
        foliage.init();
    },
};


export function loadLevel(game: Game) {
    for (const datum of data) {
        loader[datum.template.name](game, datum);
    }
}
