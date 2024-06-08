import { Boxlike } from "./collision";
import { Game } from "./game";
import { Vector, Vectorlike } from "./types";

export class Wall implements Boxlike {
    game: Game

    position = new Vector()
    size = new Vector();

    constructor(game: Game) {
        this.game = game;
        game.walls.add(this);
    }

}