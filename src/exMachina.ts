import { Campfire } from "./campfire";
import { Game } from "./game";
import { Ghost } from "./ghost";
import { MagicMissile } from "./magicMissile";
import { Totem } from "./totem";
import { Wizard } from "./wizard";

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
    wizardMet = false;

    totemTutorial = false;
    redDustSpotted = false;
    missileTutorial = false;

    campfireSpotted = false;

    update(dt: number) {
        return;
        if (!this.mouseTutorial) {
            this.game.timeManager.schedule(100, () => this.game.splash.tutorial("tutorial_mouse", 500));
            this.game.timeManager.schedule(100, () => this.game.soundManager.voiceline("1"));
            this.mouseTutorial = true;
        }

        if (!this.campfireSpotted) {
            const campfire = this.game.tagged.get("campfire1") as Campfire;
            if (campfire.position.distance(this.game.player.position) < 600) {
                this.campfireSpotted = true;
                this.game.soundManager.voiceline("2");
            }
        }

        if (!this.campfire1Lit) {
            const campfire = this.game.tagged.get("campfire1") as Campfire;

            if (!this.redTutorial) {
                if (this.game.player.target === campfire) {
                    this.game.splash.tutorial("tutorial_redTriangle", 500);
                    this.redTutorial = true;
                }
            }

            if (campfire.lit) {
                this.campfire1Lit = true;
                this.game.splash.progressTime(0.5);
                this.game.soundManager.voiceline("3");
            }
        }

        if (!this.campfire2Lit) {
            const campfire = this.game.tagged.get("campfire2") as Campfire;
            if (campfire.lit) {
                this.campfire2Lit = true;
                this.game.splash.progressTime(0.75);
                this.game.soundManager.voiceline("8");
            }
        }

        if (!this.campfire3Lit) {
            const campfire = this.game.tagged.get("campfire3") as Campfire;
            if (campfire.lit) {
                this.campfire3Lit = true;
                this.game.splash.progressTime(1);
                this.game.soundManager.voiceline("12");
            }
        }

        if (!this.ghostMet) {
            const ghost = this.game.tagged.get("ghost1") as Ghost;
            if (ghost.position.distance(this.game.player.position) < 900) {
                this.ghostMet = true;
                this.game.player.target = ghost;
                this.game.splash.tutorial("tutorial_combat", 500, 0.1);
                this.game.soundManager.voiceline("4");
            }
        }

        if (!this.wizardMet) {
            const wizard = this.game.tagged.get("wizard1") as Wizard;
            if (wizard.position.distance(this.game.player.position) < 900) {
                this.wizardMet = true;
                this.game.player.target = wizard;
                this.game.soundManager.voiceline("9");
            }
        }

        if (!this.redDustSpotted) {
            const dust = this.game.redDust;
            if (dust.position.distance(this.game.player.position) < 400) {
                this.redDustSpotted = true;
                this.game.soundManager.voiceline("6");
            }
        }

        if (!this.totemTutorial) {
            const totem = this.game.tagged.get("totem1") as Totem;
            if (totem.position.distance(this.game.player.position) < 400) {
                this.totemTutorial = true;
                this.game.timeManager.schedule(150, () => this.game.splash.tutorial("tutorial_totems", 500));
                this.game.soundManager.voiceline("5");
            }
        }

        if (!this.missileTutorial) {
            for (const spell of this.game.spells) {
                if (spell instanceof MagicMissile) {
                    this.missileTutorial = true;
                    this.game.splash.tutorial("tutorial_missile", 500, 0.01);
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
                this.game.soundManager.voiceline("7");
            }
        }
    }
}
