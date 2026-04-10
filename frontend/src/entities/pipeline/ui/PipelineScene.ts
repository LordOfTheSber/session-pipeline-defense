import * as Phaser from 'phaser';

export class PipelineScene extends Phaser.Scene {
  constructor() {
    super('PipelineScene');
  }

  create() {
    this.add
      .text(30, 30, 'Gameplay Scene Scaffold', {
        fontFamily: 'Arial',
        fontSize: '30px',
        color: '#8bd3ff',
      })
      .setDepth(10);

    this.add
      .text(
        30,
        75,
        'Phase 1: Phaser integrated.\nPhase 4 adds lanes, sessions, data flow, and HUD systems.',
        {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#dbeafe',
          lineSpacing: 8,
        },
      )
      .setDepth(10);

    const lanes = 5;
    const laneHeight = 80;
    const startX = 40;
    const width = 820;

    for (let i = 0; i < lanes; i += 1) {
      const y = 150 + i * laneHeight;
      this.add.rectangle(startX + width / 2, y, width, laneHeight - 8, 0x1e293b, 0.6).setStrokeStyle(1, 0x334155);
      this.add.text(52, y - 16, `Lane ${i + 1}`, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#a5b4fc',
      });
    }

    this.add
      .text(640, 470, 'Pipeline ingress →', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#fda4af',
      })
      .setRotation(Math.PI);
  }
}
