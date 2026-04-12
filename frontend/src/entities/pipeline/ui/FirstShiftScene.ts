import * as Phaser from 'phaser';
import {
  HUD_UPDATE_EVENT,
  PIPELINE_EVENT,
  RUN_COMPLETE_EVENT,
  type PipelineEventPayload,
  type PipelineHudPayload,
} from './PipelineScene';

const LANE_Y = 250;
const START_X = 790;
const TARGET_X = 110;
const SESSION_X = 275;
const SESSION_Y = LANE_Y;
const TUTORIAL_TTL_SECONDS = 5;
const PACKET_SPEED = 52;
const CORRUPTED_SPEED = 64;

export class FirstShiftScene extends Phaser.Scene {
  private credits = 45;

  private integrity = 100;

  private elapsedSeconds = 0;

  private sessionPlaced = false;

  private sessionTtl = TUTORIAL_TTL_SECONDS;

  private packet?: Phaser.GameObjects.Rectangle;

  private packetType: 'PACKET' | 'CORRUPTED' = 'PACKET';

  private waitingForValidator = false;

  private isComplete = false;

  private instruction?: Phaser.GameObjects.Text;

  private metrics?: Phaser.GameObjects.Text;

  private sessionSprite?: Phaser.GameObjects.Rectangle;

  private summaryProcessed = 0;

  private corruptedHandled = false;

  constructor() {
    super('FirstShiftScene');
  }

  create() {
    this.drawConsole();
    this.emitAria('run.start', 'Operator-7, first shift protocol. Click the highlighted slot to deploy Light Session.');
    this.emitAria('wave.start', 'We run one controlled cycle. Observe TTL, Capacity and Integrity.');

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isComplete) {
        return;
      }

      if (!this.sessionPlaced && Phaser.Math.Distance.Between(pointer.x, pointer.y, SESSION_X, SESSION_Y) < 38) {
        this.placeLightSession();
      } else if (this.waitingForValidator && pointer.x > 220 && pointer.x < 340 && pointer.y > 200 && pointer.y < 300) {
        this.waitingForValidator = false;
        this.emitAria('session.placed', 'Validator Session online. Corrupted signatures are now manageable.');
        this.corruptedHandled = true;
      }
    });

    this.updateHud();
  }

  update(_: number, deltaMs: number) {
    if (this.isComplete) {
      return;
    }

    const dt = deltaMs / 1000;
    this.elapsedSeconds += dt;
    this.credits += dt * 5;

    if (this.sessionPlaced && this.sessionTtl > 0) {
      this.sessionTtl -= dt;
      if (this.sessionTtl <= 0) {
        this.emitAria('session.expired', 'Light Session expired on TTL. Sessions are temporary by design.');
        this.sessionSprite?.setAlpha(0.25);
        this.spawnCorruptedPacket();
      }
    }

    if (this.packet) {
      this.packet.x -= (this.packetType === 'PACKET' ? PACKET_SPEED : CORRUPTED_SPEED) * dt;

      if (this.packet.x <= TARGET_X) {
        if (this.packetType === 'CORRUPTED' && !this.corruptedHandled) {
          this.integrity = 1;
          this.emitAria('health.critical', '// rerouting… Integrity floor engaged. Training shift cannot fail.');
          this.packet.destroy();
          this.packet = undefined;
          this.finishShift();
        } else {
          this.summaryProcessed += 1;
          this.packet.destroy();
          this.packet = undefined;

          if (this.packetType === 'PACKET') {
            this.emitAria('session.placed', 'Packet processed. Credits recycle back into compute budget.');
          } else {
            this.emitAria('session.placed', 'Corrupted Data neutralized. You are cleared for live shifts.');
            this.finishShift();
          }
        }
      }
    }

    this.updateHud();
  }

  private drawConsole() {
    this.add.rectangle(450, 260, 900, 520, 0x03101b, 1);
    this.add.rectangle(450, 260, 870, 470, 0x081a27, 0.65).setStrokeStyle(1, 0x22d3ee, 0.5);

    this.add.text(32, 34, 'DIVISION TERMINAL // FIRST SHIFT', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '20px',
      color: '#67e8f9',
    });

    this.add.rectangle(SESSION_X, SESSION_Y, 62, 62, 0x0f172a, 0.4).setStrokeStyle(2, 0x67e8f9, 0.8);
    this.add.text(236, 300, 'Deploy Slot A1', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '12px',
      color: '#a5f3fc',
    });

    this.add.rectangle(450, LANE_Y, 720, 64, 0x0f172a, 0.35).setStrokeStyle(1, 0x164e63, 0.85);
    this.add.text(96, LANE_Y - 45, 'OVERLOAD BOUNDARY', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      color: '#fca5a5',
    });
    this.add.text(730, LANE_Y - 45, 'DATA INGRESS', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '11px',
      color: '#fbcfe8',
    });

    this.instruction = this.add.text(32, 470, '', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '14px',
      color: '#bfdbfe',
      wordWrap: { width: 840 },
    });

    this.metrics = this.add.text(32, 70, '', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '13px',
      color: '#bae6fd',
    });
  }

  private placeLightSession() {
    this.sessionPlaced = true;
    this.sessionSprite = this.add.rectangle(SESSION_X, SESSION_Y, 42, 42, 0x38bdf8, 1).setStrokeStyle(2, 0x0c4a6e);
    this.credits -= 25;
    this.emitAria('session.placed', 'Light Session deployed. Fast cadence, short life.');
    this.spawnPacket();
  }

  private spawnPacket() {
    this.packetType = 'PACKET';
    this.packet = this.add.rectangle(START_X, LANE_Y, 30, 30, 0xfb7185, 1).setStrokeStyle(2, 0x7f1d1d);
    this.emitAria('wave.start', 'Incoming Packet. Watch auto-processing on lane contact.');
  }

  private spawnCorruptedPacket() {
    if (this.packet) {
      return;
    }

    this.packetType = 'CORRUPTED';
    this.packet = this.add.rectangle(START_X, LANE_Y, 34, 34, 0xef4444, 1).setStrokeStyle(2, 0x7f1d1d);
    this.waitingForValidator = true;
    this.emitAria('data.corrupted', 'Corrupted Data detected. Deploy Validator or prepare reroute.');
  }

  private finishShift() {
    if (this.isComplete) {
      return;
    }

    this.isComplete = true;
    this.emitAria('run.start', 'First shift complete. Debrief unlocked, Endless and Daily access granted.');

    this.add.rectangle(450, 258, 680, 220, 0x020617, 0.92).setStrokeStyle(2, 0x67e8f9).setDepth(20);
    this.add
      .text(450, 190, 'SHIFT BRIEFING', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '30px',
        color: '#67e8f9',
      })
      .setOrigin(0.5)
      .setDepth(21);

    this.add
      .text(450, 248, 'Operator callsign granted. Codex entry decrypted: Shift Zero Echo.', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '15px',
        color: '#cbd5e1',
      })
      .setOrigin(0.5)
      .setDepth(21);

    this.add
      .text(450, 288, 'Return to terminal to begin Endless or Daily reconstruction.', {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '13px',
        color: '#a5f3fc',
      })
      .setOrigin(0.5)
      .setDepth(21);

    window.dispatchEvent(
      new CustomEvent(RUN_COMPLETE_EVENT, {
        detail: {
          mode: 'FIRST_SHIFT',
          score: 0,
          difficulty: 'STANDARD',
          processedCount: this.summaryProcessed,
          waveReached: 1,
          survivalSeconds: Math.floor(this.elapsedSeconds),
          creditsSpent: 25,
          systemHealthEnd: 1,
          activeSessionPeak: 1,
        },
      }),
    );
  }

  private updateHud() {
    const ttlLeft = Math.max(0, Math.ceil(this.sessionTtl));
    this.metrics?.setText(
      `INTEGRITY ${this.integrity}% | COMPUTE ${Math.floor(this.credits)} ¢ | SURGE CYCLE 01 | TTL ${ttlLeft}s | SHIFT ${Math.floor(this.elapsedSeconds)}s`,
    );

    this.instruction?.setText(
      this.waitingForValidator
        ? 'Click deploy slot again to bring Validator Session online before Corrupted Data reaches boundary.'
        : 'Follow ARIA prompts. This shift cannot fail; it demonstrates pipeline fundamentals in live flow.',
    );

    window.dispatchEvent(
      new CustomEvent<PipelineHudPayload>(HUD_UPDATE_EVENT, {
        detail: {
          mode: 'FIRST_SHIFT',
          difficulty: 'STANDARD',
          credits: Math.floor(this.credits),
          processed: this.summaryProcessed,
          wave: 1,
          timeSeconds: Math.floor(this.elapsedSeconds),
          systemHealth: Math.max(1, Math.floor(this.integrity / 20)),
          maxSystemHealth: 5,
          integrityPercent: this.integrity,
          selectedSessionLabel: this.waitingForValidator ? 'Validator Session' : 'Light Session',
        },
      }),
    );
  }

  private emitAria(type: PipelineEventPayload['type'], line: string) {
    window.dispatchEvent(new CustomEvent<PipelineEventPayload>(PIPELINE_EVENT, { detail: { type } }));
    window.dispatchEvent(new CustomEvent('session-defense:aria-scripted-line', { detail: { line } }));
  }
}
