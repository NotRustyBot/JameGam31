import { Game } from "./game";
import { Player } from "./player";
import { Vector, Vectorlike } from "./types";

export interface ITrackable {
    position: Vector;
}

export class Camera {
    game: Game;
    position: Vector;
    targets: ITrackable[] = [];

    
    public get size() : Vector {
        return new Vector( this.game.app.canvas.width, this.game.app.canvas.height);
    }
    

    constructor(game: Game) {
        this.game = game;
        this.position = new Vector(0, 0);
    }

    follow(target: ITrackable) {
        this.targets.push(target);
    }

    unfollow(target: ITrackable) {
        const index = this.targets.indexOf(target);
        if (index > -1) {
            this.targets.splice(index, 1);
        }
    }

    update(dt: number) {
        if (this.targets.length > 0) {
            const last = this.targets[this.targets.length - 1];
            this.moveTo(last.position);
        }
    }

    moveTo(targetPosition: Vector) {
        const usePosition = targetPosition.result().add(this.size.mult(-0.5));
        const diff = usePosition.diff(this.position);
        this.position.add(diff.mult(0.1));
        this.game.worldContainer.position.set(-this.position.x, -this.position.y);
    }
}
