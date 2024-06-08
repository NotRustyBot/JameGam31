import { Campfire } from "./campfire";
import { Game } from "./game";
import { Ghost } from "./ghost";
import { MagicMissile } from "./magicMissile";
import { Totem } from "./totem";

export class ExMahcina {
    cards = 0;
    campfire1Lit = false;
    ghostsSummoned = false;
    ghostsKilled = false;
    game: Game;
    summonedGhosts = new Set<Ghost>();
    campfire2Lit: any;
    campfire3Lit: any;
    constructor(game: Game) {
        this.game = game;
    }

    mouseTutorial = false;
    redTutorial = false;
    ghostMet = false;

    totemTutorial = false;
    redDustSpotted = false;
    missileTutorial = false;

    update(dt: number) {
        if (!this.mouseTutorial) {
            this.game.timeManager.schedule(100, () => this.game.splash.tutorial("tutorial_mouse", 300));
            this.mouseTutorial = true;
        }

        if (!this.campfire1Lit) {
            const campfire = this.game.tagged.get("campfire1") as Campfire;

            if(!this.redTutorial){
                if(this.game.player.target === campfire){
                    this.game.splash.tutorial("tutorial_redTriangle", 300);
                    this.redTutorial = true;
                }
            }

            if (campfire.lit) {
                this.campfire1Lit = true;
                this.game.splash.progressTime(0.5);
            }
        }

        if (!this.campfire2Lit) {
            const campfire = this.game.tagged.get("campfire2") as Campfire;
            if (campfire.lit) {
                this.campfire2Lit = true;
                this.game.splash.progressTime(0.75);
            }
        }

        
        if (!this.campfire3Lit) {
            const campfire = this.game.tagged.get("campfire3") as Campfire;
            if (campfire.lit) {
                this.campfire3Lit = true;
                this.game.splash.progressTime(1);
            }
        }

        if(!this.ghostMet){
            const ghost = this.game.tagged.get("ghost1") as Ghost;
            if(ghost.position.distance(this.game.player.position) < 900){
                this.ghostMet = true;
                this.game.player.target = ghost;
                this.game.splash.tutorial("tutorial_combat", 300);

            }
        }

        if(!this.redDustSpotted){
            const dust = this.game.redDust;
            if(dust.position.distance(this.game.player.position) < 400){
                this.redDustSpotted = true;
            }
        }

        if(!this.totemTutorial){
            const totem = this.game.tagged.get("totem1") as Totem;
            if(totem.position.distance(this.game.player.position) < 400){
                this.totemTutorial = true;
                this.game.splash.tutorial("tutorial_totems", 300);

            }
        }

        if(!this.missileTutorial){
            for (const spell of this.game.spells) {
                if (spell instanceof MagicMissile) {
                    this.missileTutorial = true;
                    this.game.splash.tutorial("tutorial_missile", 300);
                    break;
                }
                
            }
        }

        if (this.ghostsSummoned && !this.ghostsKilled) {
            for (const ghost of this.summonedGhosts) {
                if (ghost.health.length === 0) {
                    this.summonedGhosts.delete(ghost);
                }
            }

            if (this.summonedGhosts.size === 0) {
                this.ghostsKilled = true;
                this.game.splash.card("card1");
            }
        }
    }
}
