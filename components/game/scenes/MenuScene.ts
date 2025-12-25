'use client';

import * as Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add homescreen background
        const bg = this.add.image(width / 2, height / 2, 'homescreen');
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);

        // Add dark overlay for better text visibility
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.4);

        // Title
        this.add.text(width / 2, height * 0.25, 'THE UPSIDE DOWN', {
            font: 'bold 36px Arial',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.35, 'Survival of the Smartest', {
            font: '24px Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Start button
        const startButton = this.add.rectangle(width / 2, height * 0.65, 200, 60, 0x8B0000);
        startButton.setStrokeStyle(3, 0xff0000);
        startButton.setInteractive({ useHandCursor: true });

        const startText = this.add.text(width / 2, height * 0.65, 'TAP TO START', {
            font: 'bold 24px Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Button hover effects
        startButton.on('pointerover', () => {
            startButton.setFillStyle(0xb00000);
        });

        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x8B0000);
        });

        // Start game on click/tap
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Instructions
        this.add.text(width / 2, height * 0.85, 'Swipe or tap to move Dustin\nCollect items • Avoid monsters', {
            font: '16px Arial',
            color: '#cccccc',
            align: 'center'
        }).setOrigin(0.5);
    }
}
