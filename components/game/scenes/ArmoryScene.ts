'use client';

import * as Phaser from 'phaser';

interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
}

export class ArmoryScene extends Phaser.Scene {
    private questions: Question[] = [];
    private usedQuestions: Set<number> = new Set();
    private currentQuestion: Question | null = null;

    // HUD Elements
    private timerText!: Phaser.GameObjects.Text;
    private ammoText!: Phaser.GameObjects.Text;
    private healthIcons: Phaser.GameObjects.Image[] = [];

    // Game State
    private timeRemaining: number = 45;
    private ammo: number = 0;
    private health: number = 3;
    private timerEvent: Phaser.Time.TimerEvent | null = null;

    // Monitor area elements
    private questionText!: Phaser.GameObjects.Text;
    private optionTexts: Phaser.GameObjects.Text[] = [];
    private feedbackText!: Phaser.GameObjects.Text;

    // Monitor bounds (approximate center of the screen where monitor is)
    private monitorBounds = { x: 0, y: 0, width: 280, height: 180 };

    constructor() {
        super({ key: 'ArmoryScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Reset state
        this.timeRemaining = 45;
        this.ammo = 0;
        this.health = 3;
        this.usedQuestions.clear();

        // Load questions
        this.questions = this.cache.json.get('questions') || [];

        // Black background
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000).setDepth(-1);

        // Add question screen background (basement with monitor) - CONTAIN mode
        const bg = this.add.image(width / 2, height / 2, 'questionScreen');
        const scaleX = width / bg.width;
        const scaleY = height / bg.height;
        const scale = Math.min(scaleX, scaleY);
        bg.setScale(scale);

        // Calculate monitor position (center of screen, slightly above center)
        this.monitorBounds = {
            x: width / 2,
            y: height * 0.42,
            width: width * 0.65,
            height: height * 0.28
        };

        // Create HUD
        this.createHUD();

        // Create monitor display area
        this.createMonitorDisplay();

        // Start timer
        this.startTimer();

        // Show first question
        this.showNextQuestion();

        // Ready button at bottom
        this.createReadyButton();
    }

    private createHUD() {
        const width = this.cameras.main.width;

        // Timer (top-left) - retro style
        this.timerText = this.add.text(15, 15, `TIME: ${this.timeRemaining}s`, {
            fontFamily: 'Courier, monospace',
            fontSize: '20px',
            color: '#00ff00',
            stroke: '#003300',
            strokeThickness: 2
        }).setDepth(100);

        // Ammo counter (top-right) with icon
        const rocketIcon = this.add.image(width - 80, 25, 'rocket');
        rocketIcon.setScale(0.35).setDepth(100);

        this.ammoText = this.add.text(width - 50, 15, `x ${this.ammo}`, {
            fontFamily: 'Courier, monospace',
            fontSize: '22px',
            color: '#ffcc00',
            stroke: '#333300',
            strokeThickness: 2
        }).setDepth(100);

        // Health (top-center) - waffle icons
        this.healthIcons = [];
        for (let i = 0; i < 3; i++) {
            const waffle = this.add.image(width / 2 - 50 + (i * 50), 25, 'waffles');
            waffle.setScale(0.35).setDepth(100);
            this.healthIcons.push(waffle);
        }
    }

    private createMonitorDisplay() {
        const { x, y, width: mWidth, height: mHeight } = this.monitorBounds;

        // Question text - retro pixel style, inside monitor
        this.questionText = this.add.text(x, y - mHeight * 0.25, '', {
            fontFamily: 'Courier, monospace',
            fontSize: '14px',
            color: '#ffffff',
            wordWrap: { width: mWidth - 20 },
            align: 'center'
        }).setOrigin(0.5).setDepth(50);

        // Options (A, B, C)
        this.optionTexts = [];
        const optionLabels = ['A', 'B', 'C'];
        for (let i = 0; i < 3; i++) {
            const optY = y + 10 + (i * 35);
            const optText = this.add.text(x, optY, '', {
                fontFamily: 'Courier, monospace',
                fontSize: '13px',
                color: '#ffffff',
                wordWrap: { width: mWidth - 40 },
                align: 'center'
            }).setOrigin(0.5).setDepth(50);

            optText.setInteractive({ useHandCursor: true });

            // Hover effects
            optText.on('pointerover', () => {
                optText.setColor('#ffff00');
                optText.setScale(1.05);
            });

            optText.on('pointerout', () => {
                optText.setColor('#ffffff');
                optText.setScale(1);
            });

            // Click handler
            const index = i;
            optText.on('pointerdown', () => {
                this.checkAnswer(index);
            });

            this.optionTexts.push(optText);
        }

        // Feedback text (hidden initially)
        this.feedbackText = this.add.text(x, y + mHeight * 0.4, '', {
            fontFamily: 'Courier, monospace',
            fontSize: '18px',
            color: '#00ff00'
        }).setOrigin(0.5).setDepth(60).setAlpha(0);
    }

    private createReadyButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const btnY = height - 50;
        const btn = this.add.rectangle(width / 2, btnY, 180, 50, 0x3d2b3e);
        btn.setStrokeStyle(3, 0x00ff00);
        btn.setInteractive({ useHandCursor: true });
        btn.setDepth(100);

        const btnText = this.add.text(width / 2, btnY, 'START BATTLE', {
            fontFamily: 'Courier, monospace',
            fontSize: '16px',
            color: '#00ff00'
        }).setOrigin(0.5).setDepth(100);

        btn.on('pointerover', () => btn.setFillStyle(0x5d3b5e));
        btn.on('pointerout', () => btn.setFillStyle(0x3d2b3e));
        btn.on('pointerdown', () => {
            if (this.timerEvent) this.timerEvent.destroy();
            this.scene.start('GameScene', { ammo: this.ammo, health: this.health });
        });
    }

    private startTimer() {
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeRemaining--;
                this.timerText.setText(`TIME: ${this.timeRemaining}s`);

                if (this.timeRemaining <= 10) {
                    this.timerText.setColor('#ff0000');
                }

                if (this.timeRemaining <= 0) {
                    if (this.timerEvent) this.timerEvent.destroy();
                    this.scene.start('GameScene', { ammo: this.ammo, health: this.health });
                }
            },
            loop: true
        });
    }

    private showNextQuestion() {
        // Get unused question
        const availableQuestions = this.questions.filter(q => !this.usedQuestions.has(q.id));
        if (availableQuestions.length === 0) {
            this.usedQuestions.clear();
        }

        const questionsToUse = availableQuestions.length > 0 ? availableQuestions : this.questions;
        if (questionsToUse.length === 0) {
            this.questionText.setText('No questions available!');
            return;
        }

        this.currentQuestion = questionsToUse[Phaser.Math.Between(0, questionsToUse.length - 1)];
        this.usedQuestions.add(this.currentQuestion.id);

        // Display question
        this.questionText.setText(this.currentQuestion.question);

        // Display options
        const labels = ['A', 'B', 'C', 'D'];
        this.currentQuestion.options.forEach((option, index) => {
            if (this.optionTexts[index]) {
                this.optionTexts[index].setText(`${labels[index]}. ${option}`);
                this.optionTexts[index].setColor('#ffffff');
                this.optionTexts[index].setInteractive();
            }
        });
    }

    private checkAnswer(answerIndex: number) {
        if (!this.currentQuestion) return;

        const correct = answerIndex === this.currentQuestion.correctAnswer;

        // Disable options temporarily
        this.optionTexts.forEach(opt => opt.disableInteractive());

        if (correct) {
            // Correct answer
            this.ammo++;
            this.ammoText.setText(`x ${this.ammo}`);

            // Flash green
            this.optionTexts[answerIndex].setColor('#00ff00');
            this.feedbackText.setText('CORRECT! +1 AMMO');
            this.feedbackText.setColor('#00ff00');
            this.feedbackText.setAlpha(1);

            // Screen flash green
            this.cameras.main.flash(200, 0, 100, 0);

        } else {
            // Wrong answer
            this.timeRemaining = Math.max(0, this.timeRemaining - 5);
            this.timerText.setText(`TIME: ${this.timeRemaining}s`);

            // Flash red
            this.optionTexts[answerIndex].setColor('#ff0000');
            this.feedbackText.setText('WRONG! -5 SEC');
            this.feedbackText.setColor('#ff0000');
            this.feedbackText.setAlpha(1);

            // Camera shake
            this.cameras.main.shake(200, 0.01);
            this.cameras.main.flash(200, 100, 0, 0);
        }

        // Show next question after delay
        this.time.delayedCall(1200, () => {
            this.feedbackText.setAlpha(0);
            this.showNextQuestion();
        });
    }

    update() {
        // Game loop handled by events
    }
}
