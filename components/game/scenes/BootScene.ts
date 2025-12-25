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

        // Add more horizontal margin to fit inside the monitor screen
        const marginX = width * 0.15; // 15% margin on each side
        const barWidth = width - (marginX * 2); // remaining width for progress bar

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(marginX, height / 2 - 30, barWidth, 50);

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            font: '20px Arial',
            color: '#000000' // Black font for white background
        }).setOrigin(0.5);

        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0x8B0000, 1);
            progressBar.fillRect(marginX + 10, height / 2 - 20, (barWidth - 20) * value, 30);
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

        // Load Stats UI sprites
        this.load.image('heartFull', '/assets/Stats/heart/full.png');
        this.load.image('heartHalf', '/assets/Stats/heart/half.png');
        this.load.image('heartEmpty', '/assets/Stats/heart/empty.png');
        this.load.image('ammoIcon0', '/assets/Stats/ammo/0.png');
        this.load.image('ammoIcon1', '/assets/Stats/ammo/1.png');

        // Load screens
        this.load.image('homescreen', '/assets/Screens/homescreen.png');
        this.load.image('questionScreen', '/assets/Screens/question_screen.png');
        this.load.image('successScreen', '/assets/Screens/success_screen.png');
        this.load.image('gameoverScreen', '/assets/Screens/gameocer.png');
        this.load.image('selectCharacter', '/assets/Screens/select_character.png');

        // Load questions data
        this.load.json('questions', '/data/questions.json');
    }

    create() {
        this.scene.start('MenuScene');
    }
}
