"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    backgroundColor: ('rgb(161, 178, 255)'),
    width: 1400,
    height: 800,
    scene: [Load, StartMenu, Level1, Level2, EndScene ]
}

var cursors;
const SCALE = 2.0;
var my = {sprite: {}, text: {}, vfx: {}};

//Global Variables for player score
let playerScore = 0;
let highScore = 0;

const game = new Phaser.Game(config);