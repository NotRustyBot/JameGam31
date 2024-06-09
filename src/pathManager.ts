import { AlphaFilter, Assets, Graphics } from "pixi.js";
import { Game } from "./game";
import { Vector } from "./types";

export class PathManager {
    game: Game;
    nodes: Vector[] = [];
    allNodes: Vector[] = [];
    grapics: Graphics;
    constructor(game: Game) {
        this.game = game;
        this.grapics = new Graphics();
    }

    addPathNode(position: Vector) {
        this.nodes.push(position);
        this.allNodes.push(position);
    }

    render() {
        this.nodes.sort((a, b) => b.x - a.x);

        while (this.nodes.length > 0) {
            let node = this.nodes.pop()!;
            this.grapics.moveTo(node.x, node.y);
            let nearest = this.findNearestNode(node!);
            if (nearest) {
                const diff = nearest.diff(node!).mult(0.5);
                const controlPoint = node
                    .result()
                    .add(diff)
                    .add(new Vector(Math.random() - 0.5, Math.random() - 0.5).mult(50));
                this.grapics.bezierCurveTo(controlPoint.x, controlPoint.y, controlPoint.x, controlPoint.y, nearest.x, nearest.y);
                this.grapics.stroke({ color: 0x333333, width: 80, texture: Assets.get("pathTexture"), cap: "round", join: "round" });
                node = nearest;
            }
        }

        this.game.pathContainer.addChild(this.grapics);
        this.grapics.filters = [new AlphaFilter({ alpha: 0.8 })];
    }

    readonly maxRange = 300;

    findNearestNode(position: Vector) {
        let dist = this.maxRange;
        let nearest = null;
        for (const node of this.nodes) {
            const currentDist = node.distance(position);
            if (position.x > node.x) continue;
            if (currentDist == 0) continue;
            if (currentDist < dist) {
                dist = currentDist;
                nearest = node;
            }
        }
        return nearest;
    }
}
