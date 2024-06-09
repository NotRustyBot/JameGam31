import { Game } from "./game";
import { RuneColor, RuneSymbol, RuneType, areRuneTypesEqual } from "./gestureRecodniser";
import { HostileSpell } from "./hostileSpell";
import { ITargetable } from "./targetable";
import { Vector } from "./types";

export class MagicMissile extends HostileSpell implements ITargetable {
    range = 20;

    missileRune: RuneType = { color: RuneColor.blue, symbol: RuneSymbol.triangle };
    constructor(game: Game) {
        super(game);
        game.player.registerTarget(this);
        this.sprite.tint = 0x9999ff;
        this.life = 200;

    }

    override remove(): void {
        super.remove();
        this.game.player.unregisterTarget(this);
    }

    onSpell(rune: RuneType): void {
        if (areRuneTypesEqual(rune, this.missileRune)) {
            this.game.soundManager.sound("spellFail", 0.23, this.position);
            this.remove();
        }
    }

    showSymbols(): { runes: RuneType[]; count: number } {
        return { runes: [this.missileRune], count: 1 };
    }

    speed = 8;

    override update(dt: number): void {
        const angle = Math.atan2(this.position.y - this.game.player.position.y, this.position.x - this.game.player.position.x);
        const idealVelocity = Vector.fromAngle(angle + Math.PI).mult(this.speed);
        let speedMult = 1;
        if (this.life < 100) {
            speedMult = 1 + (1 - this.life / 100);
        }
        this.velocity.add(idealVelocity.result().mult(0.08 * dt * speedMult)).normalize(this.speed);

        if (this.game.player.position.distanceSquared(this.position) < 200 ** 2) {
            if (areRuneTypesEqual(this.game.player.preparedRune, this.missileRune)) {
                this.game.player.target = this;
            }
        }


        while (this.particleCooldown > 0) {
            this.game.splash.magicSpark(this.position.result(), 0x9999ff, this.velocity.result());
            this.particleCooldown -= 1;
        }

        super.update(dt);
    }
}
