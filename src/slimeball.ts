import { Game } from "./game";
import { RuneColor, RuneSymbol, RuneType, areRuneTypesEqual } from "./gestureRecodniser";
import { HostileSpell } from "./hostileSpell";
import { ITargetable } from "./targetable";
import { Vector } from "./types";

export class SlimeBall extends HostileSpell {
    constructor(game: Game) {
        super(game);
        this.sprite.tint = 0x9999ff;
        this.life = 200;
    }

    override remove(): void {
        super.remove();
    }

    speed = 2;

    override update(dt: number): void {
        
        while (this.particleCooldown > 0) {
            this.game.splash.magicSpark(this.position.result(), 0x55ff55, this.velocity.result(), "circle", 0.5);
            this.particleCooldown -= 1;
        }

        super.update(dt);
    }
}
