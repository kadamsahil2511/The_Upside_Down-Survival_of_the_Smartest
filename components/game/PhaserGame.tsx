'use client';

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';
import { BootScene, MenuScene, GameScene } from './scenes';

interface PhaserGameProps {
    width?: number;
    height?: number;
}

export default function PhaserGame({ width, height }: PhaserGameProps) {
    const gameRef = useRef<Phaser.Game | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || !containerRef.current) return;

        // Get container dimensions or use provided/default values
        const gameWidth = width || containerRef.current.clientWidth || 390;
        const gameHeight = height || containerRef.current.clientHeight || 600;

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            parent: containerRef.current,
            width: gameWidth,
            height: gameHeight,
            backgroundColor: '#1a0a0a',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                    debug: false,
                },
            },
            scene: [BootScene, MenuScene, GameScene],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            input: {
                activePointers: 3, // Support multi-touch
            },
            render: {
                pixelArt: false,
                antialias: true,
            },
        };

        // Create game instance
        gameRef.current = new Phaser.Game(config);

        // Cleanup on unmount
        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, [isClient, width, height]);

    if (!isClient) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#1a0a0a]">
                <p className="text-white text-xl">Loading game...</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full h-full"
            style={{
                minHeight: '100vh',
                backgroundColor: '#1a0a0a',
                touchAction: 'none', // Prevent browser handling of touch
            }}
        />
    );
}
