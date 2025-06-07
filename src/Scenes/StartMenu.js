class StartMenu extends Phaser.Scene {
    constructor() {
        super("startMenu");
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width/2, height/2 - 140, "HIGH SCORE: " + highScore, {
            font: "96px Indie Flower",
            color: "#ffffff"
        }).setOrigin(0.5);

        this.add.text(width/2, height/2 - 20, "In Bloom", {
            font: "72px Indie Flower",
            color: "#ffffff"
        }).setOrigin(0.5);

        this.add.text(width/2, height/2 + 100, "Press S to Start Game", {
            font: "24px Indie Flower",
            color: "#ffff00"
        }).setOrigin(0.5);

        this.add.text(width/2, height/2 + 20, "Regrow your victory!", {
            font: "30px Indie Flower",
            color: "#ffff00"
        }).setOrigin(0.5);

        this.input.keyboard.on("keydown-S", () => {
            this.scene.start("platformerScene1");
        });

        if (!bgm) {
            bgm = this.sound.add("bgm", { volume: 0.5, loop: true });
            bgm.play();
        }
    }
}

window.EndScene = EndScene;