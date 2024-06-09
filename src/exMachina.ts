import { BigOoze } from "./bigOoze";
import { Campfire } from "./campfire";
import { Game } from "./game";
import { Ghost } from "./ghost";
import { MagicMissile } from "./magicMissile";
import { Slime } from "./slime";
import { Totem } from "./totem";
import { Wizard } from "./wizard";

export class ExMahcina {
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
    slimeMet = false;

    lastCharge = false;

    totemTutorial = false;
    redDustSpotted = false;
    missileTutorial = false;

    campfireSpotted = false;

    wizardDefeated = false;
    wizardBossSpotted = false;

    enableWeather = false;
    weatherCooldown = 0;

    bigOozeSpotted = false;
    obeliskSpotted = false;

    update(dt: number) {
        if(this.game.obelisk.charge == 3) return;

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

                this.enableWeather = true;
                this.weatherCooldown = 1000;
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

        if (!this.slimeMet) {
            const wizard = this.game.tagged.get("slime1") as Slime;
            if (wizard.position.distance(this.game.player.position) < 600) {
                this.slimeMet = true;
                this.game.player.target = wizard;
                this.game.soundManager.voiceline("13");
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

        if (!this.wizardBossSpotted) {
            const boss = this.game.tagged.get("wizardBoss") as Wizard;
            if (boss.position.distance(this.game.player.position) < 900) {
                this.wizardBossSpotted = true;
                this.game.soundManager.voiceline("10");
            }
        }
        if (!this.wizardDefeated) {
            const boss = this.game.tagged.get("wizardBoss") as Wizard;
            if (boss.health.length === 0) {
                this.wizardDefeated = true;
                this.game.splash.card("card1");
                this.game.soundManager.voiceline("11");
        }
        }

        if (!this.lastCharge) {
            if (this.game.obelisk.charge == 2) {
                this.lastCharge = true;
                this.game.soundManager.voiceline("16");
            }
        }

        if (this.enableWeather) {
            this.game.soundManager.ambientTracks["rain"].level = Math.max(this.game.soundManager.ambientTracks["rain"].level, (1000 / (this.weatherCooldown + 1) - 1) * 2);
            this.game.soundManager.ambientTracks["rain"].level = Math.min(this.game.soundManager.ambientTracks["rain"].level, 2);
            
            if (this.weatherCooldown > 0) {
                this.weatherCooldown -= dt;
            } else {
                this.game.splash.lightning();
                this.weatherCooldown = 100 + 500 * Math.random();
            }
        }

        if (!this.bigOozeSpotted) {
            const boss = this.game.bigOoze;
            if (boss.position.distance(this.game.player.position) < 800) {
                this.bigOozeSpotted = true;
                this.game.soundManager.voiceline("14");
            }
        }

        if (!this.obeliskSpotted) {
            const boss = this.game.obelisk;
            if (boss.position.distance(this.game.player.position) < 600) {
                this.obeliskSpotted = true;
                this.game.soundManager.voiceline("15");
            }
        }
    }
}
