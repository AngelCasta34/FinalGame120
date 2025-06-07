class EndScene extends Phaser.Scene {
    constructor() {
        super("endScene");
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width/2, height/2 - 20, "You Win!", {
            font: "48px Indie Flower",
            color: "#ffffff"
        }).setOrigin(0.5);

        this.add.text(width/2, height/2 + 20, "Press S to go back to the main menu", {
            font: "24px Indie Flower",
            color: "#ffff00"
        }).setOrigin(0.5);

        let finalScore = betweenScore + playerScore + 500;
        //Set highscore
        highScore = finalScore;
        
        this.add.text(width/2, height/2 - 140, "FINAL SCORE: " + highScore, {
            font: "72px Indie Flower",
            color: "#ffffff"
        }).setOrigin(0.5);

        this.input.keyboard.on("keydown-S", () => {
            //Reset player scores
            betweenScore = 0;
            playerScore = 0;
            this.scene.start("startMenu");
        });
    }
}

window.EndScene = EndScene;