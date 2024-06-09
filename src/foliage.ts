import { Assets, Sprite } from "pixi.js";
import { Game, getRandom } from "./game";
import { Vector } from "./types";
import { OutlineFilter } from "pixi-filters";

export class Foliage {
    game: Game;
    sprite: Sprite;
    shadow: Sprite;
    position = new Vector();
    constructor(game: Game, kind: string) {
        this.game = game;
        this.windability = 0.02;
        if (kind == "tree") {
            kind = getRandom(["tree1", "tree1"]);
            this.windability = 0.03;
        }
        this.sprite = new Sprite(Assets.get(kind));
        this.sprite.anchor.set(0.5, 1);
        this.sprite.scale.set(0.25);
        game.foliageContainer.addChild(this.sprite);
        game.genericUpdatables.add(this);
        this.sprite.filters = [
            new OutlineFilter({
                color: 0xffffff,
                thickness: 10,
            }),
        ];

        this.shadow = new Sprite(Assets.get("shadow"));
        this.shadow.anchor.set(0.5);
        this.shadow.scale.set(2);
        this.shadow.tint = 0x000000;
        this.shadow.alpha = 0.2;

        if (kind == "logFlat") {
            this.shadow.scale.set(2.5, 1);
            this.shadow.rotation = 0;
        }

        game.shadowContainer.addChild(this.shadow);
    }

    init() {
        this.sprite.position.set(this.position.x, this.position.y + this.sprite.height / 2);
        this.shadow.position.set(this.position.x, this.position.y);
    }

    windability = 0;

    update(dt: number) {
        if (this.game.camera.position.distanceSquared(this.position) < (this.game.camera.size.x + 600) ** 2) {
            this.sprite.skew.x = Math.sin((this.game.timeManager.timeElapsed + this.position.x) * 0.05) * this.windability + this.windability/2;
            this.sprite.visible = true;
        } else {
            this.sprite.visible = false;
        }
    }
}
