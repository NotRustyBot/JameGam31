import { Assets, Sprite } from "pixi.js";
import { Game } from "./game";
import { Vector } from "./types";

export class Player {
    position: Vector = new Vector();
    game: Game;
    speed: number = 10;
    sprite: Sprite;
    constructor(game: Game) {
        this.game = game;
        this.sprite = new Sprite(Assets.get("marker"));
        game.playerContainer.addChild(this.sprite);
        game.camera.follow(this);
    }

    update(dt: number) {
        const controlVector = new Vector();
        if (this.game.keys["a"]) {
            controlVector.x = -1;
        }

        if (this.game.keys["d"]) {
            controlVector.x = 1;
        }

        if (this.game.keys["w"]) {
            controlVector.y = -1;
        }

        if (this.game.keys["s"]) {
            controlVector.y = 1;
        }

        if(controlVector.lengthSquared() > 0){
            controlVector.normalize(this.speed);
            this.position.add(controlVector.mult(dt));
        }

        this.sprite.position.x = this.position.x;
        this.sprite.position.y = this.position.y;
    }
}
