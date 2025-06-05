class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");                        
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");     

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 9,
            frameHeight: 9
        });

        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        // Sound effects
        this.load.audio("sfx-key", "forceField_000.ogg");

        // Background music
        this.load.audio("bgm", "ominous-8-bit-arcade-drums.mp3");

        // Bullet image for mouse shooting
        this.load.image("bullet", "shot_grey_large.png");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

        this.anims.create({
            key: 'beeFly',
            frames: [
                { key: 'platformer_characters', frame: 'tile_0024.png' },
                { key: 'platformer_characters', frame: 'tile_0025.png' },
                { key: 'platformer_characters', frame: 'tile_0026.png' }
            ],
            frameRate: 8,
            repeat: -1
        });

        this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {}
}

window.Load = Load;
