'use client';

import * as Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            font: '20px Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0x8B0000, 1);
            progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // Load player sprites (Dustin)
        this.load.image('dustin0', '/assets/Dustin/0.png');
        this.load.image('dustin1', '/assets/Dustin/1.png');
        this.load.image('dustin2', '/assets/Dustin/2.png');
        this.load.image('dustin3', '/assets/Dustin/3.png');

        // Load environment
        this.load.image('arena', '/assets/Environment/arena.png');
        this.load.image('rock', '/assets/Environment/rock.png');
        this.load.image('gate', '/assets/Environment/gate.png');
        this.load.image('tree', '/assets/Environment/tree.png');

        // Load monsters
        this.load.image('monster0', '/assets/Monstser/0.png');
        this.load.image('monster1', '/assets/Monstser/1.png');
        this.load.image('monster2', '/assets/Monstser/2.png');

        // Load tools
        this.load.image('radio', '/assets/tools/radio.png');
        this.load.image('rocket', '/assets/tools/rocket.png');
        this.load.image('torch', '/assets/tools/torch.png');
        this.load.image('waffles', '/assets/tools/waffles.png');

        // Load screens
        this.load.image('homescreen', '/assets/Screens/homescreen.png');
    }

    create() {
        this.scene.start('MenuScene');
    }
}
