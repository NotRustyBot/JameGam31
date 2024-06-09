import { Game } from "./game";
import { Howl } from "howler";

import textLines from "./linesText.json";
import { Vector } from "./types";

export class SoundManager {
    musicTracks: Record<string, MusicTrack> = {};
    ambientTracks: Record<string, { howl: Howl; level: number }> = {};
    game: Game;
    danger = 0;
    masterVolume = 0.3;
    music = 1;
    musicTarget = 1;
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

        this.ambientTracks["spell"] = {
            howl: new Howl({
                src: ["sounds/spellSustain.wav"],
                autoplay: true,
                loop: true,
                volume: 0,
            }),
            level: 0,
        };

        this.ambientTracks["campfire"] = {
            howl: new Howl({
                src: ["sounds/campfireLoop.wav"],
                autoplay: true,
                loop: true,
                volume: 0,
            }),
            level: 0,
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

        for (const trackName in this.ambientTracks) {
            const track = this.ambientTracks[trackName];
            let currentVolume = track.howl.volume();
            track.level *= this.masterVolume;
            currentVolume = currentVolume * 0.9 + track.level * 0.1;

            track.howl.volume(currentVolume);
            track.level = 0;
        }

        this.music = this.music * 0.99 + this.musicTarget * 0.01;

        exploration.howlA.volume(this.masterVolume * this.music);
        exploration.howlB.volume(this.masterVolume * this.music);

        combat.howlA.volume(this.combatVolume * this.masterVolume * this.music);
        combat.howlB.volume(this.combatVolume * this.masterVolume * this.music);

        if (this.danger > 0.5) {
            this.combatVolume += 0.01 * dt;
        }
        if (this.danger < 0.2) {
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

    sound(name: string, volume = 1, position?: Vector, rate = 1) {
        const howl = new Howl({ src: [`sounds/${name}.wav`] });
        howl.volume(volume * this.masterVolume);
        howl.rate(rate);
        howl.play();
        if (position) {
            const h = (dt: number) => {
                //calculate pan
                let pan = position.x - this.game.player.position.x;
                pan /= this.game.camera.size.x / 2;
                pan = Math.max(-1, Math.min(1, pan));
                howl.pos(pan);
            };
            this.game.splash.happenings.add(h);
            howl.once("end", () => {
                this.game.splash.happenings.delete(h);
            });
        }
    }
}

type MusicTrack = {
    name: string;
    swap: number;
    howlA: Howl;
    howlB: Howl;
};
