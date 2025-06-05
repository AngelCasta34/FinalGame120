class StartMenu extends Phaser.Scene {
    constructor() {
        super("startMenu");
    }

    create() {
        const { width, height } = this.scale;
        this.add.text(width/2, height/2 - 20, "In Bloom", {
            font: "48px Indie Flower",
            color: "#ffffff"
        }).setOrigin(0.5);

        this.add.text(width/2, height/2 + 20, "Press S to Start Game", {
            font: "24px Indie Flower",
            color: "#ffff00"
        }).setOrigin(0.5);

        this.input.keyboard.on("keydown-S", () => {
            this.scene.start("loadScene");
        });
    }
}

window.EndScene = EndScene;