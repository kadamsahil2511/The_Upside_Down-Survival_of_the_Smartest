'use client';

import * as Phaser from 'phaser';

export class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Black background for letterboxing
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000).setDepth(-1);

        // Add select character background - CONTAIN mode (show full image)
        const bg = this.add.image(width / 2, height / 2, 'selectCharacter');
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.min(scaleX, scaleY);
        bg.setScale(scale);

        // Make entire screen tappable
        const tapZone = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0);
        tapZone.setInteractive({ useHandCursor: true });

        tapZone.on('pointerdown', () => {
            this.scene.start('ArmoryScene');
        });
    }
}
