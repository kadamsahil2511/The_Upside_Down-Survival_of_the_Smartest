'use client';

import * as Phaser from 'phaser';

interface SceneData {
    ammo?: number;
    health?: number;
}

export class GameScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite;
    private monster!: Phaser.GameObjects.Sprite;
    private arena!: Phaser.GameObjects.Image;

    // Game state
    private playerHealth: number = 3;
    private ammo: number = 0;
    private monsterHealth: number = 3;
    private gameOver: boolean = false;

    // UI elements
    private healthIcons: Phaser.GameObjects.Image[] = [];
    private ammoText!: Phaser.GameObjects.Text;
    private monsterHealthBar!: Phaser.GameObjects.Rectangle;

    // Animation frames
    private playerFrame: number = 0;
    private monsterFrame: number = 0;

    // Movement
    private playerSpeed: number = 5;
    private monsterSpeed: number = 2;
    private moveDirection: { x: number; y: number } = { x: 0, y: 0 };
    private isPointerDown: boolean = false;
    private joystickBase!: Phaser.GameObjects.Arc;
    private joystickThumb!: Phaser.GameObjects.Arc;
    private joystickPointer: Phaser.Input.Pointer | null = null;

    // Combat
    private lastDamageTime: number = 0;
    private damageInterval: number = 1000; // 1 second between damage

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data: SceneData) {
        // Receive data from ArmoryScene
        this.ammo = data.ammo || 0;
        this.playerHealth = data.health || 3;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Reset state (keep ammo from init)
        this.monsterHealth = 3;
        this.gameOver = false;
        this.playerFrame = 0;
        this.monsterFrame = 0;
        this.moveDirection = { x: 0, y: 0 };
        this.isPointerDown = false;
        this.joystickPointer = null;
        this.lastDamageTime = 0;

        // Black background
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000).setDepth(-1);

        // Add arena background - CONTAIN mode
        this.arena = this.add.image(width / 2, height / 2, 'arena');
        const scaleX = width / this.arena.width;
        const scaleY = height / this.arena.height;
        this.arena.setScale(Math.min(scaleX, scaleY));

        // Dark overlay for atmosphere
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a0a, 0.3);

        // Fixed ground level - characters stay at this Y position
        const groundY = height * 0.58;

        // Create player (Dustin) - LEFT side, BIGGER
        this.player = this.add.sprite(width * 0.18, groundY, 'dustin0');
        this.player.setScale(2.0); // Much bigger sprites
        this.player.setDepth(10);
        this.player.setOrigin(0.5, 1); // Bottom-center origin so they stand on ground

        // Create monster - RIGHT side, BIGGER
        this.monster = this.add.sprite(width * 0.8, groundY, 'monster0');
        this.monster.setScale(1.8); // Much bigger sprites
        this.monster.setFlipX(true);
        this.monster.setDepth(10);
        this.monster.setOrigin(0.5, 1); // Bottom-center origin so they stand on ground

        // Setup UI
        this.createUI();

        // Create virtual joystick for touch controls
        this.createJoystick();

        // Player animation
        this.createPlayerAnimation();

        // Monster animation
        this.createMonsterAnimation();
    }

    private createUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // PokemonGB pixelated font style
        const pixelFont = 'PokemonGB, Courier New, monospace';

        // === HEALTH SECTION (Left side) ===
        // Dark themed solid block for health
        const healthBlock = this.add.rectangle(130, 45, 250, 80, 0x1a0505, 0.95);
        healthBlock.setStrokeStyle(4, 0x8B0000);
        healthBlock.setDepth(50);

        // "HEALTH" label - WHITE, BIG, PIXELATED
        this.add.text(15, 10, 'HEALTH', {
            fontFamily: pixelFont,
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setDepth(51);

        // Heart icons - BIG using new sprites
        this.healthIcons = [];
        for (let i = 0; i < 3; i++) {
            const heartTexture = i < this.playerHealth ? 'heartFull' : 'heartEmpty';
            const heart = this.add.image(50 + (i * 75), 55, heartTexture);
            heart.setScale(1.2).setDepth(51); // Big hearts!
            this.healthIcons.push(heart);
        }

        // === AMMO SECTION (Right side) ===
        // Dark themed solid block for ammo
        const ammoBlock = this.add.rectangle(width - 100, 45, 190, 80, 0x1a0505, 0.95);
        ammoBlock.setStrokeStyle(4, 0x8B0000);
        ammoBlock.setDepth(50);

        // "AMMO" label - WHITE, BIG, PIXELATED
        this.add.text(width - 185, 10, 'AMMO', {
            fontFamily: pixelFont,
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setDepth(51);

        // Ammo icon - BIG using new sprite
        const ammoIcon = this.add.image(width - 135, 55, 'ammoIcon1');
        ammoIcon.setScale(1.0).setDepth(51);

        // Ammo count text - WHITE, BIG, PIXELATED
        this.ammoText = this.add.text(width - 85, 35, `x${this.ammo}`, {
            fontFamily: pixelFont,
            fontSize: '36px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5
        }).setDepth(51);

        // === MONSTER HEALTH (Center top) ===
        const monsterHealthBlock = this.add.rectangle(width / 2, 45, 180, 80, 0x1a0505, 0.95);
        monsterHealthBlock.setStrokeStyle(4, 0x8B0000);
        monsterHealthBlock.setDepth(50);

        // "ENEMY" label - WHITE, BIG, PIXELATED
        this.add.text(width / 2 - 55, 10, 'ENEMY', {
            fontFamily: pixelFont,
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setDepth(51);

        // Monster health bar - bigger
        const monsterBarBg = this.add.rectangle(width / 2, 55, 140, 26, 0x333333);
        monsterBarBg.setStrokeStyle(2, 0x666666);
        monsterBarBg.setDepth(51);

        this.monsterHealthBar = this.add.rectangle(width / 2 - 70, 55, 140, 22, 0xcc0000);
        this.monsterHealthBar.setOrigin(0, 0.5); // Left-center origin for proper scaling
        this.monsterHealthBar.setDepth(52);

        // Attack button
        this.createAttackButton();
    }

    private createJoystick() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Joystick position (bottom left)
        const joyX = 80;
        const joyY = height - 120;

        // Joystick base (outer circle)
        this.joystickBase = this.add.circle(joyX, joyY, 50, 0x333333, 0.6);
        this.joystickBase.setStrokeStyle(3, 0x666666);
        this.joystickBase.setDepth(60);

        // Joystick thumb (inner circle)
        this.joystickThumb = this.add.circle(joyX, joyY, 25, 0x888888, 0.8);
        this.joystickThumb.setDepth(61);

        // Make the whole left side of screen interactive for joystick
        const joystickZone = this.add.rectangle(width / 3, height / 2, width * 0.66, height, 0x000000, 0);
        joystickZone.setInteractive();
        joystickZone.setDepth(55);

        joystickZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Only activate if not clicking on UI buttons
            if (pointer.y < 100) return; // Top bar area
            if (pointer.x > width - 150 && pointer.y > height - 120) return; // Attack button area

            this.isPointerDown = true;
            this.joystickPointer = pointer;

            // Move joystick base to touch position
            this.joystickBase.setPosition(pointer.x, pointer.y);
            this.joystickThumb.setPosition(pointer.x, pointer.y);
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isPointerDown && this.joystickPointer && pointer.id === this.joystickPointer.id) {
                const maxDistance = 40;
                const dx = pointer.x - this.joystickBase.x;
                const dy = pointer.y - this.joystickBase.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0) {
                    // Normalize and clamp
                    const clampedDistance = Math.min(distance, maxDistance);
                    const normalizedX = dx / distance;
                    const normalizedY = dy / distance;

                    // Update thumb position
                    this.joystickThumb.setPosition(
                        this.joystickBase.x + normalizedX * clampedDistance,
                        this.joystickBase.y + normalizedY * clampedDistance
                    );

                    // Set move direction (only if moved enough)
                    if (distance > 10) {
                        this.moveDirection.x = normalizedX;
                        this.moveDirection.y = normalizedY;
                    } else {
                        this.moveDirection.x = 0;
                        this.moveDirection.y = 0;
                    }
                }
            }
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (this.joystickPointer && pointer.id === this.joystickPointer.id) {
                this.isPointerDown = false;
                this.joystickPointer = null;
                this.moveDirection = { x: 0, y: 0 };

                // Reset joystick thumb to base
                this.joystickThumb.setPosition(this.joystickBase.x, this.joystickBase.y);
            }
        });
    }

    private createAttackButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const btn = this.add.rectangle(width - 80, height - 80, 80, 80, 0x8B0000, 0.9);
        btn.setStrokeStyle(4, 0xcc6600);
        btn.setInteractive({ useHandCursor: true });
        btn.setDepth(60);

        // Rocket icon on button
        const rocketIcon = this.add.image(width - 80, height - 85, 'rocket');
        rocketIcon.setScale(0.5).setDepth(61);

        const label = this.add.text(width - 80, height - 50, 'FIRE', {
            font: 'bold 14px Arial',
            color: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(61);

        btn.on('pointerover', () => btn.setFillStyle(0xAA2222));
        btn.on('pointerout', () => btn.setFillStyle(0x8B0000));
        btn.on('pointerdown', () => this.fireRocket());
    }

    private createPlayerAnimation() {
        this.time.addEvent({
            delay: 200,
            callback: () => {
                if (!this.gameOver) {
                    this.playerFrame = (this.playerFrame + 1) % 4;
                    this.player.setTexture(`dustin${this.playerFrame}`);
                }
            },
            loop: true
        });
    }

    private createMonsterAnimation() {
        this.time.addEvent({
            delay: 300,
            callback: () => {
                if (!this.gameOver) {
                    this.monsterFrame = (this.monsterFrame + 1) % 3;
                    this.monster.setTexture(`monster${this.monsterFrame}`);
                }
            },
            loop: true
        });
    }

    private fireRocket() {
        if (this.gameOver || this.ammo <= 0) {
            if (this.ammo <= 0) {
                this.showFeedback('No ammo!', 0xffff00);
            }
            return;
        }

        this.ammo--;
        this.ammoText.setText(`x ${this.ammo}`);

        const rocket = this.add.image(this.player.x + 60, this.player.y - 20, 'rocket');
        rocket.setScale(0.6).setDepth(15);

        this.tweens.add({
            targets: rocket,
            x: this.monster.x - 40,
            duration: 350,
            ease: 'Power2',
            onComplete: () => {
                rocket.destroy();
                this.hitMonster();
            }
        });
    }

    private hitMonster() {
        this.monsterHealth--;

        // Update monster health bar
        const healthPercent = this.monsterHealth / 3;
        this.monsterHealthBar.setScale(healthPercent, 1);

        this.monster.setTint(0xff0000);
        this.time.delayedCall(200, () => this.monster.clearTint());

        const dmgText = this.add.text(this.monster.x, this.monster.y - 60, '-1', {
            font: 'bold 48px Arial',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(20);

        this.tweens.add({
            targets: dmgText,
            y: dmgText.y - 60,
            alpha: 0,
            duration: 800,
            onComplete: () => dmgText.destroy()
        });

        // Push monster back when hit
        this.monster.x = Math.min(this.monster.x + 50, this.cameras.main.width * 0.85);

        if (this.monsterHealth <= 0) {
            this.showSuccess();
        }
    }

    private playerHit() {
        const currentTime = this.time.now;
        if (currentTime - this.lastDamageTime < this.damageInterval) return;

        this.lastDamageTime = currentTime;
        this.playerHealth--;

        // Change heart to empty texture
        if (this.healthIcons[this.playerHealth]) {
            this.healthIcons[this.playerHealth].setTexture('heartEmpty');
        }

        this.player.setTint(0xff0000);
        this.time.delayedCall(200, () => this.player.clearTint());

        // Show damage feedback
        this.showFeedback('-1', 0xff0000);

        if (this.playerHealth <= 0) {
            this.showGameOver();
        }
    }

    private showFeedback(text: string, color: number) {
        const feedback = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            text,
            {
                fontFamily: 'PokemonGB, Courier New, monospace',
                fontSize: '48px',
                color: Phaser.Display.Color.IntegerToColor(color).rgba,
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5).setDepth(150);

        this.tweens.add({
            targets: feedback,
            y: feedback.y - 60,
            alpha: 0,
            duration: 1500,
            onComplete: () => feedback.destroy()
        });
    }

    private showSuccess() {
        this.gameOver = true;
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Black background
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000).setDepth(199);

        // Success screen image - CONTAIN mode (full image)
        const successBg = this.add.image(width / 2, height / 2, 'successScreen');
        const scaleX = width / successBg.width;
        const scaleY = height / successBg.height;
        successBg.setScale(Math.min(scaleX, scaleY)).setDepth(200);

        // Hide monster
        this.monster.setAlpha(0);

        // Tap to continue - full screen tap zone
        const tapZone = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0);
        tapZone.setInteractive({ useHandCursor: true }).setDepth(201);
        tapZone.on('pointerdown', () => this.scene.start('CharacterSelectScene'));
    }

    private showGameOver() {
        this.gameOver = true;
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Black background
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000).setDepth(199);

        // Game over screen image - CONTAIN mode (full image)
        const gameoverBg = this.add.image(width / 2, height / 2, 'gameoverScreen');
        const scaleX = width / gameoverBg.width;
        const scaleY = height / gameoverBg.height;
        gameoverBg.setScale(Math.min(scaleX, scaleY)).setDepth(200);

        // Tap to continue - full screen tap zone
        const tapZone = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0);
        tapZone.setInteractive({ useHandCursor: true }).setDepth(201);
        tapZone.on('pointerdown', () => this.scene.start('CharacterSelectScene'));
    }

    update() {
        if (this.gameOver) return;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Player movement based on joystick - HORIZONTAL ONLY
        if (this.moveDirection.x !== 0) {
            const newX = this.player.x + this.moveDirection.x * this.playerSpeed;

            // Clamp to play area (horizontal only, stay on ground)
            const minX = 80;
            const maxX = width - 80;

            this.player.x = Phaser.Math.Clamp(newX, minX, maxX);

            // Flip player based on direction
            this.player.setFlipX(this.moveDirection.x < 0);
        }

        // Monster AI - chase player HORIZONTALLY ONLY
        const dx = this.player.x - this.monster.x;
        const distance = Math.abs(dx);

        if (distance > 80) {
            // Move towards player horizontally only
            const direction = dx > 0 ? 1 : -1;
            this.monster.x += direction * this.monsterSpeed;

            // Flip monster based on direction
            this.monster.setFlipX(dx > 0);
        } else {
            // Monster is close enough to attack
            this.playerHit();
        }
    }
}
