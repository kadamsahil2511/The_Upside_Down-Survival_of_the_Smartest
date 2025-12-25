'use client';

import * as Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add homescreen background - CONTAIN mode (show full image)
        const bg = this.add.image(width / 2, height / 2, 'homescreen');
        // Use Math.min to contain the image (show full, may have letterboxing)
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.min(scaleX, scaleY);
        bg.setScale(scale);

        // Add black bars for letterboxing if needed
        this.add.rectangle(width / 2, 0, width, height, 0x000000).setOrigin(0.5, 0).setDepth(-1);

        // Make entire screen tappable
        const tapZone = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0);
        tapZone.setInteractive({ useHandCursor: true });

        tapZone.on('pointerdown', () => {
            this.scene.start('CharacterSelectScene');
        });
    }
}
