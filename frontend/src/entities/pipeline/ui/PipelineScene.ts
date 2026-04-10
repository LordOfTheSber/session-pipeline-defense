import * as Phaser from 'phaser';

type SessionUnit = {
  lane: number;
  column: number;
  ttlSeconds: number;
  fireCooldown: number;
  sprite: Phaser.GameObjects.Rectangle;
};

type DataPacket = {
  lane: number;
  hp: number;
  speedPxPerSecond: number;
  sprite: Phaser.GameObjects.Rectangle;
};

const LANE_COUNT = 5;
const COLUMN_COUNT = 9;
const CELL_WIDTH = 84;
const LANE_HEIGHT = 78;
const BOARD_X = 84;
const BOARD_Y = 104;
const SESSION_COST = 30;
const STARTING_CREDITS = 100;
const CREDITS_REGEN_PER_SECOND = 9;
const SESSION_TTL_SECONDS = 10;
const SESSION_DAMAGE = 1;
const SESSION_FIRE_RATE_SECONDS = 0.7;
const DATA_BASE_HP = 2;
const DATA_BASE_SPEED = 44;

export class PipelineScene extends Phaser.Scene {
  private sessions = new Map<string, SessionUnit>();

  private dataPackets: DataPacket[] = [];

  private credits = STARTING_CREDITS;

  private processedCount = 0;

  private wave = 1;

  private systemHealth = 5;

  private elapsedSeconds = 0;

  private spawnAccumulator = 0;

  private spawnIntervalSeconds = 2.2;

  private creditsAccumulator = 0;

  private hudText?: Phaser.GameObjects.Text;

  private messageText?: Phaser.GameObjects.Text;

  constructor() {
    super('PipelineScene');
  }

  create() {
    this.drawBoard();
    this.registerPlacementInput();

    this.hudText = this.add.text(18, 12, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#e2e8f0',
    });

    this.messageText = this.add.text(18, 488, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#93c5fd',
    });

    this.renderHud();
    this.setMessage('Click lane cells to deploy Sessions (30 Credits).');
  }

  update(_: number, deltaMs: number) {
    if (this.systemHealth <= 0) {
      return;
    }

    const dt = deltaMs / 1000;
    this.elapsedSeconds += dt;
    this.creditsAccumulator += dt * CREDITS_REGEN_PER_SECOND;

    if (this.creditsAccumulator >= 1) {
      const wholeCredits = Math.floor(this.creditsAccumulator);
      this.credits += wholeCredits;
      this.creditsAccumulator -= wholeCredits;
    }

    this.spawnAccumulator += dt;
    if (this.spawnAccumulator >= this.spawnIntervalSeconds) {
      this.spawnAccumulator = 0;
      this.spawnDataPacket();
    }

    this.updateSessions(dt);
    this.updateDataPackets(dt);
    this.updateDifficultyScaling();
    this.renderHud();
  }

  private drawBoard() {
    this.add.text(18, 56, 'Session Pipeline Defense — Core Loop Prototype', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#8bd3ff',
    });

    for (let lane = 0; lane < LANE_COUNT; lane += 1) {
      const y = BOARD_Y + lane * LANE_HEIGHT;
      this.add
        .rectangle(BOARD_X + (COLUMN_COUNT * CELL_WIDTH) / 2, y, COLUMN_COUNT * CELL_WIDTH, LANE_HEIGHT - 8, 0x1e293b, 0.55)
        .setStrokeStyle(1, 0x334155);

      for (let col = 0; col < COLUMN_COUNT; col += 1) {
        const x = BOARD_X + col * CELL_WIDTH;
        this.add.rectangle(x, y, CELL_WIDTH - 4, LANE_HEIGHT - 12, 0x0f172a, 0.35).setStrokeStyle(1, 0x1f2937);
      }

      this.add.text(26, y - 13, `Lane ${lane + 1}`, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#a5b4fc',
      });
    }

    this.add.text(836, 467, 'Data ingress', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#fda4af',
    });
  }

  private registerPlacementInput() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.systemHealth <= 0) {
        this.scene.restart();
        return;
      }

      const lane = this.getLaneIndex(pointer.y);
      const column = this.getColumnIndex(pointer.x);

      if (lane === null || column === null) {
        return;
      }

      const key = this.cellKey(lane, column);
      if (this.sessions.has(key)) {
        this.setMessage('Session already active in this cell.');
        return;
      }

      if (this.credits < SESSION_COST) {
        this.setMessage('Not enough Credits. Wait for regeneration.');
        return;
      }

      this.credits -= SESSION_COST;
      this.deploySession(lane, column);
      this.setMessage(`Session deployed in Lane ${lane + 1}.`);
      this.renderHud();
    });
  }

  private deploySession(lane: number, column: number) {
    const x = BOARD_X + column * CELL_WIDTH;
    const y = BOARD_Y + lane * LANE_HEIGHT;

    const sprite = this.add.rectangle(x, y, 42, 42, 0x38bdf8, 1).setStrokeStyle(2, 0x0c4a6e);

    this.sessions.set(this.cellKey(lane, column), {
      lane,
      column,
      ttlSeconds: SESSION_TTL_SECONDS,
      fireCooldown: SESSION_FIRE_RATE_SECONDS,
      sprite,
    });
  }

  private updateSessions(dt: number) {
    for (const [key, session] of this.sessions) {
      session.ttlSeconds -= dt;
      session.fireCooldown -= dt;

      const ttlRatio = Phaser.Math.Clamp(session.ttlSeconds / SESSION_TTL_SECONDS, 0, 1);
      session.sprite.setFillStyle(Phaser.Display.Color.GetColor(56, Math.floor(90 + ttlRatio * 120), 248));

      if (session.fireCooldown <= 0) {
        const target = this.findFrontmostPacketInLane(session.lane);
        if (target) {
          target.hp -= SESSION_DAMAGE;
          session.fireCooldown = SESSION_FIRE_RATE_SECONDS;
          this.add
            .line(0, 0, session.sprite.x, session.sprite.y, target.sprite.x, target.sprite.y, 0x7dd3fc, 0.8)
            .setLineWidth(2, 2)
            .setDepth(3)
            .setAlpha(0.7)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setScrollFactor(1)
            .setDataEnabled()
            .setData('ttl', 80);
        }
      }

      if (session.ttlSeconds <= 0) {
        session.sprite.destroy();
        this.sessions.delete(key);
      }
    }

    for (const child of this.children.list) {
      if (child instanceof Phaser.GameObjects.Line && child.getData('ttl')) {
        const ttl = (child.getData('ttl') as number) - 1;
        child.setData('ttl', ttl);
        child.setAlpha(ttl / 80);
        if (ttl <= 0) {
          child.destroy();
        }
      }
    }
  }

  private updateDataPackets(dt: number) {
    const remaining: DataPacket[] = [];

    for (const packet of this.dataPackets) {
      packet.sprite.x -= packet.speedPxPerSecond * dt;

      if (packet.hp <= 0) {
        packet.sprite.destroy();
        this.processedCount += 1;
        this.credits += 5;
        continue;
      }

      if (packet.sprite.x <= BOARD_X - 32) {
        packet.sprite.destroy();
        this.systemHealth -= 1;
        this.setMessage(`Overload in Lane ${packet.lane + 1}! System health reduced.`);
        continue;
      }

      remaining.push(packet);
    }

    this.dataPackets = remaining;

    if (this.systemHealth <= 0) {
      this.setMessage('System failure. Click anywhere on the board to restart.');
      this.add
        .rectangle(450, 260, 760, 180, 0x020617, 0.86)
        .setStrokeStyle(2, 0xef4444)
        .setDepth(40);
      this.add
        .text(450, 238, 'SYSTEM OVERLOAD', {
          fontFamily: 'monospace',
          fontSize: '40px',
          color: '#f87171',
        })
        .setOrigin(0.5)
        .setDepth(41);
      this.add
        .text(450, 284, `Processed: ${this.processedCount} | Wave: ${this.wave}`, {
          fontFamily: 'monospace',
          fontSize: '20px',
          color: '#fecaca',
        })
        .setOrigin(0.5)
        .setDepth(41);
    }
  }

  private updateDifficultyScaling() {
    const nextWave = Math.floor(this.elapsedSeconds / 15) + 1;
    if (nextWave > this.wave) {
      this.wave = nextWave;
      this.spawnIntervalSeconds = Math.max(0.65, 2.2 - this.wave * 0.17);
      this.setMessage(`Wave ${this.wave}: ingress traffic increased.`);
    }
  }

  private spawnDataPacket() {
    const lane = Phaser.Math.Between(0, LANE_COUNT - 1);
    const laneY = BOARD_Y + lane * LANE_HEIGHT;
    const waveBonus = this.wave * 0.22;

    const sprite = this.add
      .rectangle(BOARD_X + (COLUMN_COUNT - 1) * CELL_WIDTH + 35, laneY, 34, 34, 0xfb7185, 1)
      .setStrokeStyle(2, 0x7f1d1d);

    this.dataPackets.push({
      lane,
      hp: DATA_BASE_HP + Math.floor(this.wave / 3),
      speedPxPerSecond: DATA_BASE_SPEED + waveBonus * 10,
      sprite,
    });
  }

  private findFrontmostPacketInLane(lane: number): DataPacket | undefined {
    let best: DataPacket | undefined;

    for (const packet of this.dataPackets) {
      if (packet.lane !== lane) {
        continue;
      }

      if (!best || packet.sprite.x < best.sprite.x) {
        best = packet;
      }
    }

    return best;
  }

  private getLaneIndex(pointerY: number): number | null {
    const laneFloat = (pointerY - (BOARD_Y - LANE_HEIGHT / 2)) / LANE_HEIGHT;
    const lane = Math.floor(laneFloat);

    if (lane < 0 || lane >= LANE_COUNT) {
      return null;
    }

    return lane;
  }

  private getColumnIndex(pointerX: number): number | null {
    const colFloat = (pointerX - (BOARD_X - CELL_WIDTH / 2)) / CELL_WIDTH;
    const column = Math.floor(colFloat);

    if (column < 0 || column >= COLUMN_COUNT) {
      return null;
    }

    return column;
  }

  private renderHud() {
    if (!this.hudText) {
      return;
    }

    this.hudText.setText(
      `Credits: ${Math.floor(this.credits)}   Health: ${this.systemHealth}   Processed: ${this.processedCount}   Wave: ${this.wave}   Time: ${Math.floor(this.elapsedSeconds)}s`,
    );
  }

  private setMessage(message: string) {
    this.messageText?.setText(message);
  }

  private cellKey(lane: number, column: number): string {
    return `${lane}-${column}`;
  }
}
