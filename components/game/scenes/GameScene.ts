'use client';

import * as Phaser from 'phaser';

interface Tool extends Phaser.Physics.Arcade.Sprite {
    toolType: string;
}

interface Monster extends Phaser.Physics.Arcade.Sprite {
    speed: number;
}

export class GameScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private monsters!: Phaser.Physics.Arcade.Group;
    private tools!: Phaser.Physics.Arcade.Group;
    private score: number = 0;
    private survivalTime: number = 0;
    private scoreText!: Phaser.GameObjects.Text;
    private timeText!: Phaser.GameObjects.Text;
    private gameOver: boolean = false;
    private playerSpeed: number = 300;
    private touchStartX: number = 0;
    private touchStartY: number = 0;
    private movementVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);

    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Reset game state
        this.score = 0;
        this.survivalTime = 0;
        this.gameOver = false;
        this.movementVector.set(0, 0);

        // Add arena background
        const arena = this.add.image(width / 2, height / 2, 'arena');
        const scaleX = width / arena.width;
        const scaleY = height / arena.height;
        const scale = Math.max(scaleX, scaleY);
        arena.setScale(scale);

        // Add dark overlay for atmosphere
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a0a, 0.3);

        // Create player
        this.player = this.physics.add.sprite(width / 2, height / 2, 'dustin0');
        this.player.setScale(0.15);
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(10);

        // Create monsters group
        this.monsters = this.physics.add.group();

        // Create tools group
        this.tools = this.physics.add.group();

        // Spawn initial monsters
        this.spawnMonster();
        this.spawnMonster();

        // Spawn initial tools
        this.spawnTool();
        this.spawnTool();

        // Set up collisions
        this.physics.add.overlap(this.player, this.tools, this.collectTool, undefined, this);
        this.physics.add.overlap(this.player, this.monsters, this.hitMonster, undefined, this);

        // UI
        this.add.rectangle(width / 2, 30, width, 60, 0x000000, 0.7);

        this.scoreText = this.add.text(20, 15, 'Score: 0', {
            font: 'bold 20px Arial',
            color: '#ffffff'
        });

        this.timeText = this.add.text(width - 20, 15, 'Time: 0s', {
            font: 'bold 20px Arial',
            color: '#ffffff'
        }).setOrigin(1, 0);

        // Survival timer
        this.time.addEvent({
            delay: 1000,
            callback: this.updateSurvivalTime,
            callbackScope: this,
            loop: true
        });

        // Spawn more monsters over time
        this.time.addEvent({
            delay: 5000,
            callback: this.spawnMonster,
            callbackScope: this,
            loop: true
        });

        // Spawn tools periodically
        this.time.addEvent({
            delay: 4000,
            callback: this.spawnTool,
            callbackScope: this,
            loop: true
        });

        // Touch controls
        this.setupTouchControls();

        // Player animation
        this.createPlayerAnimation();
    }

    private setupTouchControls() {
        // Track touch/pointer for movement direction
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.touchStartX = pointer.x;
            this.touchStartY = pointer.y;
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.isDown && !this.gameOver) {
                const dx = pointer.x - this.touchStartX;
                const dy = pointer.y - this.touchStartY;

                // Update movement vector based on swipe direction
                if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                    this.movementVector.set(dx, dy).normalize();
                }
            }
        });

        this.input.on('pointerup', () => {
            // Keep last direction for a moment, then stop
            this.time.delayedCall(100, () => {
                this.movementVector.set(0, 0);
            });
        });

        // Alternative: tap to move towards position
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (!this.gameOver) {
                const dx = pointer.x - this.player.x;
                const dy = pointer.y - this.player.y;
                this.movementVector.set(dx, dy).normalize();

                // Auto-stop when near target
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 50) {
                    this.movementVector.set(0, 0);
                }
            }
        });
    }

    private createPlayerAnimation() {
        // Simple frame cycling for player
        let frame = 0;
        this.time.addEvent({
            delay: 200,
            callback: () => {
                if (!this.gameOver && (this.movementVector.x !== 0 || this.movementVector.y !== 0)) {
                    frame = (frame + 1) % 4;
                    this.player.setTexture(`dustin${frame}`);
                }
            },
            loop: true
        });
    }

    private spawnMonster() {
        if (this.gameOver) return;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Spawn from edges
        const side = Phaser.Math.Between(0, 3);
        let x: number, y: number;

        switch (side) {
            case 0: x = 0; y = Phaser.Math.Between(0, height); break;
            case 1: x = width; y = Phaser.Math.Between(0, height); break;
            case 2: x = Phaser.Math.Between(0, width); y = 0; break;
            default: x = Phaser.Math.Between(0, width); y = height; break;
        }

        const monsterType = Phaser.Math.Between(0, 2);
        const monster = this.monsters.create(x, y, `monster${monsterType}`) as Monster;
        monster.setScale(0.12);
        monster.speed = 50 + (this.survivalTime * 2); // Increase speed over time
        monster.speed = Math.min(monster.speed, 200); // Cap speed
    }

    private spawnTool() {
        if (this.gameOver) return;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const toolTypes = ['radio', 'rocket', 'torch', 'waffles'];
        const toolType = toolTypes[Phaser.Math.Between(0, toolTypes.length - 1)];

        const x = Phaser.Math.Between(50, width - 50);
        const y = Phaser.Math.Between(80, height - 50);

        const tool = this.tools.create(x, y, toolType) as Tool;
        tool.setScale(0.1);
        tool.toolType = toolType;

        // Add floating animation
        this.tweens.add({
            targets: tool,
            y: tool.y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Remove tool after some time
        this.time.delayedCall(8000, () => {
            if (tool.active) {
                tool.destroy();
            }
        });
    }

    private collectTool(player: unknown, tool: unknown) {
        const t = tool as Tool;

        // Score based on tool type
        const scores: Record<string, number> = {
            waffles: 50,
            radio: 30,
            torch: 20,
            rocket: 100
        };

        this.score += scores[t.toolType] || 10;
        this.scoreText.setText(`Score: ${this.score}`);

        // Visual feedback
        const scorePopup = this.add.text(t.x, t.y, `+${scores[t.toolType]}`, {
            font: 'bold 24px Arial',
            color: '#00ff00'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: scorePopup,
            y: scorePopup.y - 50,
            alpha: 0,
            duration: 800,
            onComplete: () => scorePopup.destroy()
        });

        t.destroy();
    }

    private hitMonster() {
        if (this.gameOver) return;

        this.gameOver = true;
        this.player.setTint(0xff0000);

        // Stop all movement
        this.movementVector.set(0, 0);
        this.player.setVelocity(0, 0);

        // Game over screen
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setDepth(20);

        this.add.text(width / 2, height * 0.3, 'GAME OVER', {
            font: 'bold 48px Arial',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(21);

        this.add.text(width / 2, height * 0.45, `Score: ${this.score}`, {
            font: 'bold 32px Arial',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(21);

        this.add.text(width / 2, height * 0.55, `Survived: ${this.survivalTime}s`, {
            font: 'bold 32px Arial',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(21);

        // Restart button
        const restartBtn = this.add.rectangle(width / 2, height * 0.75, 200, 60, 0x8B0000).setDepth(21);
        restartBtn.setStrokeStyle(3, 0xff0000);
        restartBtn.setInteractive({ useHandCursor: true });

        this.add.text(width / 2, height * 0.75, 'PLAY AGAIN', {
            font: 'bold 24px Arial',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(21);

        restartBtn.on('pointerdown', () => {
            this.scene.restart();
        });
    }

    private updateSurvivalTime() {
        if (!this.gameOver) {
            this.survivalTime++;
            this.timeText.setText(`Time: ${this.survivalTime}s`);
        }
    }

    update() {
        if (this.gameOver) return;

        // Apply movement
        this.player.setVelocity(
            this.movementVector.x * this.playerSpeed,
            this.movementVector.y * this.playerSpeed
        );

        // Flip player based on movement direction
        if (this.movementVector.x < 0) {
            this.player.setFlipX(true);
        } else if (this.movementVector.x > 0) {
            this.player.setFlipX(false);
        }

        // Move monsters towards player
        this.monsters.getChildren().forEach((monster) => {
            const m = monster as Monster;
            const angle = Phaser.Math.Angle.Between(m.x, m.y, this.player.x, this.player.y);
            const velocityX = Math.cos(angle) * m.speed;
            const velocityY = Math.sin(angle) * m.speed;
            m.setVelocity(velocityX, velocityY);

            // Face the player
            m.setFlipX(this.player.x < m.x);
        });
    }
}
