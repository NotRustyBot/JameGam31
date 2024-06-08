import { Game } from "./game";
import { Howl } from "howler";

import textLines from "./linesText.json";

export class SoundManager {
    musicTracks: Record<string, MusicTrack> = {};
    game: Game;
    danger = 0;
    masterVolume = 0.3;
    music = 1;
    musicTarget = 0;
    constructor(game: Game) {
        this.game = game;

        this.musicTracks["exploration"] = {
            name: "exploration",
            swap: 60 + 14.6,
            howlA: new Howl({
                src: ["sounds/exploration.wav"],
            }),
            howlB: new Howl({
                src: ["sounds/exploration.wav"],
            }),
        };

        this.musicTracks["exploration"].howlA.play();

        this.musicTracks["combat"] = {
            name: "combat",
            swap: 0,
            howlA: new Howl({
                src: ["sounds/combat.wav"],
            }),
            howlB: new Howl({
                src: ["sounds/combat.wav"],
            }),
        };

        this.musicTracks["combat"].howlA.play();
    }

    combatVolume = 0;

    update(dt: number) {
        const exploration = this.musicTracks["exploration"];
        const combat = this.musicTracks["combat"];
        let t = exploration.howlA.seek();

        if (t > exploration.swap) {
            exploration.howlB.play();
            combat.howlB.play();

            exploration.howlB.seek(t);
            combat.howlB.seek(t);

            exploration.howlA.seek(0);
            combat.howlA.seek(0);
        }

        this.music = this.music * 0.99 + this.musicTarget * 0.01;

        exploration.howlA.volume(this.masterVolume * this.music);
        exploration.howlB.volume(this.masterVolume * this.music);

        combat.howlA.volume(this.combatVolume * this.masterVolume * this.music);
        combat.howlB.volume(this.combatVolume * this.masterVolume * this.music);

        if (this.danger > 0.5) {
            this.combatVolume += 0.01 * dt;
        } else {
            this.combatVolume -= 0.005 * dt;
        }

        this.combatVolume = Math.min(1, Math.max(0, this.combatVolume));

        this.danger /= 1.1;
    }

    voiceQueue: string[] = [];
    voicePlaying = false;
    voiceline(name: string) {
        if (this.voicePlaying) {
            this.voiceQueue.push(name);
            return;
        }
        this.voicePlaying = true;
        this.musicTarget = 0.3;
        const howl = new Howl({ src: [`sounds/voice/${name}.wav`] });
        this.game.splash.monologue(textLines[name as keyof typeof textLines], howl.duration() * 60);
        howl.play();
        howl.on("end", () => {
            this.musicTarget = 1;
            this.voicePlaying = false;
            if (this.voiceQueue.length > 0) {
                this.voiceline(this.voiceQueue.shift()!);
            }
        });
    }
}

type MusicTrack = {
    name: string;
    swap: number;
    howlA: Howl;
    howlB: Howl;
};
