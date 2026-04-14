import * as Phaser from 'phaser';
import type { Difficulty } from '@/shared/types/api';
import type { Locale } from '@/shared/lib/i18n';

type SessionArchetype = 'LIGHT' | 'BATCH' | 'VALIDATOR';
type DataArchetype = 'PACKET' | 'HEAVY_DOCUMENT' | 'CORRUPTED_DATA' | 'BURST_TRAFFIC';

type SessionSpec = {
  label: string;
  cost: number;
  ttlSeconds: number;
  capacity: number;
  damage: number;
  fireRateSeconds: number;
  color: number;
  strokeColor: number;
  corruptedMultiplier?: number;
};

type DataSpec = {
  label: string;
  baseHp: number;
  speedPxPerSecond: number;
  rewardCredits: number;
  color: number;
  strokeColor: number;
  size: number;
};

type DifficultyTuning = {
  scoreMultiplier: number;
  spawnPressureMultiplier: number;
  creditRegenMultiplier: number;
  dataHpMultiplier: number;
  dataSpeedMultiplier: number;
  startingCredits: number;
  startingSystemHealth: number;
};

type SessionUnit = {
  id: string;
  lane: number;
  column: number;
  type: SessionArchetype;
  ttlSeconds: number;
  fireCooldown: number;
  processedCount: number;
  sprite: Phaser.GameObjects.Rectangle;
  ttlText: Phaser.GameObjects.Text;
  capText: Phaser.GameObjects.Text;
};

type DataPacket = {
  id: string;
  lane: number;
  type: DataArchetype;
  hp: number;
  maxHp: number;
  speedPxPerSecond: number;
  rewardCredits: number;
  sprite: Phaser.GameObjects.Rectangle;
  lastDamagedBySessionId?: string;
};

type RunSummaryPayload = {
  processedCount: number;
  waveReached: number;
  survivalSeconds: number;
  creditsSpent: number;
  systemHealthEnd: number;
  activeSessionPeak: number;
  score: number;
  mode: 'ENDLESS' | 'DAILY' | 'FIRST_SHIFT' | 'TIMED';
  difficulty: Difficulty;
  challengeDate?: string;
  challengeSeed?: number;
};

export type PipelineRunOptions = {
  mode: 'ENDLESS' | 'DAILY' | 'FIRST_SHIFT' | 'TIMED';
  difficulty: Difficulty;
  challengeDate?: string;
  challengeSeed?: number;
  timeLimitSeconds?: number;
  locale?: Locale;
};

export type PipelineEventType =
  | 'run.start'
  | 'session.placed'
  | 'session.expired'
  | 'data.corrupted'
  | 'data.leaked'
  | 'wave.start'
  | 'health.critical'
  | 'run.loss';

export type PipelineEventPayload = {
  type: PipelineEventType;
  lane?: number;
  wave?: number;
  integrity?: number;
};

export type PipelineHudPayload = {
  mode: PipelineRunOptions['mode'];
  difficulty: Difficulty;
  credits: number;
  processed: number;
  wave: number;
  timeSeconds: number;
  systemHealth: number;
  maxSystemHealth: number;
  integrityPercent: number;
  selectedSessionLabel: string;
};

const LANE_COUNT = 5;
const COLUMN_COUNT = 9;
const CELL_WIDTH = 84;
const LANE_HEIGHT = 78;
const BOARD_X = 84;
const BOARD_Y = 118;
const STARTING_CREDITS = 100;
const STARTING_SYSTEM_HEALTH = 5;
const CREDITS_REGEN_PER_SECOND = 10;

const SESSION_SPECS: Record<SessionArchetype, SessionSpec> = {
  LIGHT: {
    label: 'Light Session',
    cost: 25,
    ttlSeconds: 9,
    capacity: 7,
    damage: 1,
    fireRateSeconds: 0.45,
    color: 0x38bdf8,
    strokeColor: 0x0c4a6e,
  },
  BATCH: {
    label: 'Batch Session',
    cost: 45,
    ttlSeconds: 14,
    capacity: 10,
    damage: 3,
    fireRateSeconds: 1.1,
    color: 0xa78bfa,
    strokeColor: 0x4c1d95,
  },
  VALIDATOR: {
    label: 'Validator Session',
    cost: 35,
    ttlSeconds: 11,
    capacity: 8,
    damage: 1.2,
    fireRateSeconds: 0.6,
    color: 0x4ade80,
    strokeColor: 0x166534,
    corruptedMultiplier: 2.4,
  },
};

const DATA_SPECS: Record<DataArchetype, DataSpec> = {
  PACKET: {
    label: 'Packet',
    baseHp: 2,
    speedPxPerSecond: 48,
    rewardCredits: 5,
    color: 0xfb7185,
    strokeColor: 0x7f1d1d,
    size: 34,
  },
  HEAVY_DOCUMENT: {
    label: 'Heavy Document',
    baseHp: 7,
    speedPxPerSecond: 28,
    rewardCredits: 12,
    color: 0xf59e0b,
    strokeColor: 0x78350f,
    size: 42,
  },
  CORRUPTED_DATA: {
    label: 'Corrupted Data',
    baseHp: 5,
    speedPxPerSecond: 55,
    rewardCredits: 9,
    color: 0xef4444,
    strokeColor: 0x7f1d1d,
    size: 36,
  },
  BURST_TRAFFIC: {
    label: 'Burst Traffic',
    baseHp: 1,
    speedPxPerSecond: 84,
    rewardCredits: 3,
    color: 0xf472b6,
    strokeColor: 0x831843,
    size: 28,
  },
};

const DIFFICULTY_TUNING: Record<Difficulty, DifficultyTuning> = {
  STANDARD: {
    scoreMultiplier: 1,
    spawnPressureMultiplier: 1,
    creditRegenMultiplier: 1,
    dataHpMultiplier: 1,
    dataSpeedMultiplier: 1,
    startingCredits: STARTING_CREDITS,
    startingSystemHealth: STARTING_SYSTEM_HEALTH,
  },
  HARDENED: {
    scoreMultiplier: 1.25,
    spawnPressureMultiplier: 1.2,
    creditRegenMultiplier: 0.9,
    dataHpMultiplier: 1.1,
    dataSpeedMultiplier: 1.08,
    startingCredits: 90,
    startingSystemHealth: 4,
  },
  NIGHTMARE: {
    scoreMultiplier: 1.5,
    spawnPressureMultiplier: 1.4,
    creditRegenMultiplier: 0.82,
    dataHpMultiplier: 1.2,
    dataSpeedMultiplier: 1.16,
    startingCredits: 80,
    startingSystemHealth: 3,
  },
};

export const RUN_COMPLETE_EVENT = 'session-defense:run-complete';
export const PIPELINE_EVENT = 'session-defense:game-event';
export const HUD_UPDATE_EVENT = 'session-defense:hud-update';
export const PIPELINE_PAUSE_EVENT = 'session-defense:pause-toggle';
const ARIA_LINE_EVENT = 'session-defense:aria-scripted-line';
const FEEDBACK_FLASH_TTL_MS = 320;

export class PipelineScene extends Phaser.Scene {
  private sessions = new Map<string, SessionUnit>();

  private dataPackets: DataPacket[] = [];

  private credits = STARTING_CREDITS;

  private creditsSpent = 0;

  private processedCount = 0;

  private wave = 1;

  private systemHealth = STARTING_SYSTEM_HEALTH;

  private elapsedSeconds = 0;

  private spawnAccumulator = 0;

  private spawnIntervalSeconds = 2.1;

  private creditsAccumulator = 0;

  private activeSessionPeak = 0;

  private hudText?: Phaser.GameObjects.Text;

  private messageText?: Phaser.GameObjects.Text;

  private helperText?: Phaser.GameObjects.Text;

  private selectedSessionType: SessionArchetype = 'LIGHT';

  private isRunOver = false;

  private runOptions: PipelineRunOptions;

  private difficultyTuning: DifficultyTuning;

  private randomizer?: Phaser.Math.RandomDataGenerator;

  private sentCriticalHealthEvent = false;

  private sentCorruptedSeenEvent = false;

  private sentWave25Hook = false;

  private isPaused = false;

  private pauseOverlay?: Phaser.GameObjects.Text;

  constructor(runOptions?: PipelineRunOptions) {
    super('PipelineScene');
    this.runOptions = runOptions ?? { mode: 'ENDLESS', difficulty: 'STANDARD', locale: 'en' };
    this.difficultyTuning = DIFFICULTY_TUNING[this.runOptions.difficulty];
    this.credits = this.difficultyTuning.startingCredits;
    this.systemHealth = this.difficultyTuning.startingSystemHealth;
  }

  create() {
    if (this.runOptions.mode === 'DAILY' && this.runOptions.challengeSeed !== undefined) {
      this.randomizer = new Phaser.Math.RandomDataGenerator([String(this.runOptions.challengeSeed)]);
    }

    this.drawBoard();
    this.registerPlacementInput();

    this.input.keyboard?.on('keydown-ONE', () => this.selectSessionType('LIGHT'));
    this.input.keyboard?.on('keydown-TWO', () => this.selectSessionType('BATCH'));
    this.input.keyboard?.on('keydown-THREE', () => this.selectSessionType('VALIDATOR'));

    this.hudText = this.add.text(18, 12, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#e2e8f0',
    });

    this.messageText = this.add.text(18, 474, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#93c5fd',
    });
    this.helperText = this.add.text(18, 496, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#86efac',
    });

    this.renderHud();
    this.setMessage(
      this.runOptions.locale === 'ru'
        ? 'Клавиши 1-3 выбирают сессию. Кликните по ячейке для установки.'
        : 'Use keys 1-3 to pick a Session, then click a lane cell to deploy.',
    );
    this.renderSelectionHint();
    this.emitPipelineEvent({ type: 'run.start', wave: 1, integrity: this.systemHealth });
    this.emitPipelineEvent({ type: 'wave.start', wave: 1, integrity: this.systemHealth });
    window.addEventListener(PIPELINE_PAUSE_EVENT, this.onPauseEvent);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener(PIPELINE_PAUSE_EVENT, this.onPauseEvent);
    });
  }

  update(_: number, deltaMs: number) {
    if (this.isRunOver || this.isPaused) {
      return;
    }

    const dt = deltaMs / 1000;
    this.elapsedSeconds += dt;
    this.creditsAccumulator += dt * CREDITS_REGEN_PER_SECOND * this.difficultyTuning.creditRegenMultiplier;

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
    this.updateWaveScaling();

    if (this.runOptions.mode === 'TIMED' && this.runOptions.timeLimitSeconds && this.elapsedSeconds >= this.runOptions.timeLimitSeconds) {
      this.completeTimedRun();
      return;
    }

    this.activeSessionPeak = Math.max(this.activeSessionPeak, this.sessions.size);
    this.renderHud();
  }

  private drawBoard() {
    this.add.text(18, 42, this.runOptions.locale === 'ru' ? 'Session Pipeline Defense — Оперативная смена' : 'Session Pipeline Defense — Live Shift Console', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#8bd3ff',
    });

    this.add.text(18, 68, this.runOptions.locale === 'ru' ? '1 Лёгкая | 2 Пакетная | 3 Валидатор' : '1 Light | 2 Batch | 3 Validator', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#c4b5fd',
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

      this.add.text(26, y - 13, this.runOptions.locale === 'ru' ? `Линия ${lane + 1}` : `Lane ${lane + 1}`, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#a5b4fc',
      });
    }

    this.add.text(810, 458, this.runOptions.locale === 'ru' ? 'Вход данных' : 'Data ingress', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#fda4af',
    });
  }

  private registerPlacementInput() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isRunOver) {
        this.scene.restart();
        return;
      }
      if (this.isPaused) {
        return;
      }

      const lane = this.getLaneIndex(pointer.y);
      const column = this.getColumnIndex(pointer.x);
      if (lane === null || column === null) {
        return;
      }

      const key = this.cellKey(lane, column);
      if (this.sessions.has(key)) {
        this.setMessage(this.runOptions.locale === 'ru' ? 'В этой ячейке уже есть активная сессия.' : 'Session already active in this cell.');
        this.flashLane(lane, 0xf97316);
        return;
      }

      const spec = SESSION_SPECS[this.selectedSessionType];
      if (this.credits < spec.cost) {
        this.setMessage(
          this.runOptions.locale === 'ru'
            ? `${spec.label} требует ${spec.cost} кредитов.`
            : `${spec.label} requires ${spec.cost} Credits.`,
        );
        this.flashLane(lane, 0xef4444);
        return;
      }

      this.credits -= spec.cost;
      this.creditsSpent += spec.cost;
      this.deploySession(lane, column, this.selectedSessionType);
      this.setMessage(
        this.runOptions.locale === 'ru' ? `${spec.label} размещена на линии ${lane + 1}.` : `${spec.label} deployed in Lane ${lane + 1}.`,
      );
      this.emitPipelineEvent({ type: 'session.placed', lane, wave: this.wave, integrity: this.systemHealth });
      this.flashLane(lane, 0x22d3ee);
      this.renderHud();
    });
  }

  private selectSessionType(type: SessionArchetype) {
    this.selectedSessionType = type;
    const spec = SESSION_SPECS[type];
    this.setMessage(
      this.runOptions.locale === 'ru' ? `${spec.label} выбрана (${spec.cost} кредитов).` : `${spec.label} selected (${spec.cost} Credits).`,
    );
    this.renderSelectionHint();
    this.renderHud();
  }

  private deploySession(lane: number, column: number, type: SessionArchetype) {
    const spec = SESSION_SPECS[type];
    const x = BOARD_X + column * CELL_WIDTH;
    const y = BOARD_Y + lane * LANE_HEIGHT;

    const sprite = this.add.rectangle(x, y, 42, 42, spec.color, 1).setStrokeStyle(2, spec.strokeColor);
    sprite.setScale(0.72);
    this.tweens.add({
      targets: sprite,
      scaleX: 1,
      scaleY: 1,
      duration: 140,
      ease: 'Cubic.Out',
    });
    const ttlText = this.add.text(x - 18, y - 28, `${spec.ttlSeconds}s`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#bfdbfe',
    });
    const capPrefix = this.runOptions.locale === 'ru' ? 'ёмк.' : 'cap';
    const capText = this.add.text(x - 20, y + 18, `${capPrefix} ${spec.capacity}`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#bbf7d0',
    });

    this.sessions.set(this.cellKey(lane, column), {
      id: Phaser.Utils.String.UUID(),
      lane,
      column,
      type,
      ttlSeconds: spec.ttlSeconds,
      fireCooldown: spec.fireRateSeconds,
      processedCount: 0,
      sprite,
      ttlText,
      capText,
    });
  }

  private updateSessions(dt: number) {
    for (const [key, session] of this.sessions) {
      const spec = SESSION_SPECS[session.type];
      session.ttlSeconds -= dt;
      session.fireCooldown -= dt;

      const ttlRatio = Phaser.Math.Clamp(session.ttlSeconds / spec.ttlSeconds, 0, 1);
      session.sprite.setAlpha(0.5 + ttlRatio * 0.5);
      session.ttlText.setText(`${Math.max(0, Math.ceil(session.ttlSeconds))}s`);
      const capPrefix = this.runOptions.locale === 'ru' ? 'ёмк.' : 'cap';
      session.capText.setText(`${capPrefix} ${Math.max(0, spec.capacity - session.processedCount)}`);

      if (session.fireCooldown <= 0) {
        const target = this.findFrontmostPacketInLane(session.lane);
        if (target) {
          const damageMultiplier =
            target.type === 'CORRUPTED_DATA' && spec.corruptedMultiplier ? spec.corruptedMultiplier : 1;

          target.hp -= spec.damage * damageMultiplier;
          target.lastDamagedBySessionId = session.id;
          session.fireCooldown = spec.fireRateSeconds;
          this.tweens.add({
            targets: target.sprite,
            alpha: 0.55,
            duration: 90,
            yoyo: true,
          });

          this.add
            .line(0, 0, session.sprite.x, session.sprite.y, target.sprite.x, target.sprite.y, 0x7dd3fc, 0.8)
            .setLineWidth(2, 2)
            .setDepth(3)
            .setAlpha(0.7)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDataEnabled()
            .setData('ttl', 70);
        }
      }

      const capacitySpent = session.processedCount >= spec.capacity;
      const ttlExpired = session.ttlSeconds <= 0;
      if (ttlExpired || capacitySpent) {
        if (ttlExpired) {
          this.setMessage(
            this.runOptions.locale === 'ru'
              ? `${spec.label} на линии ${session.lane + 1} истекла по TTL.`
              : `${spec.label} in Lane ${session.lane + 1} expired (TTL).`,
          );
        } else {
          this.setMessage(
            this.runOptions.locale === 'ru'
              ? `${spec.label} на линии ${session.lane + 1} завершена (исчерпана ёмкость).`
              : `${spec.label} in Lane ${session.lane + 1} retired (capacity spent).`,
          );
        }
        this.destroySession(key, session);
        this.emitPipelineEvent({ type: 'session.expired', lane: session.lane, wave: this.wave, integrity: this.systemHealth });
      }
    }

    for (const child of this.children.list) {
      if (child instanceof Phaser.GameObjects.Line && child.getData('ttl')) {
        const ttl = (child.getData('ttl') as number) - 1;
        child.setData('ttl', ttl);
        child.setAlpha(ttl / 70);
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
        this.credits += packet.rewardCredits;

        if (packet.lastDamagedBySessionId) {
          const owner = [...this.sessions.values()].find((candidate) => candidate.id === packet.lastDamagedBySessionId);
          if (owner) {
            owner.processedCount += 1;
          }
        }

        continue;
      }

      if (packet.sprite.x <= BOARD_X - 32) {
        packet.sprite.destroy();
        this.systemHealth -= 1;
        this.setMessage(
          this.runOptions.locale === 'ru'
            ? `Перегрузка на линии ${packet.lane + 1}. Целостность системы снижена.`
            : `Overload in Lane ${packet.lane + 1}. System health reduced.`,
        );
        this.emitPipelineEvent({ type: 'data.leaked', lane: packet.lane, wave: this.wave, integrity: this.systemHealth });
        this.flashLane(packet.lane, 0xdc2626);
        this.flashIntegrityLoss();

        if (this.systemHealth <= Math.max(1, Math.floor(this.difficultyTuning.startingSystemHealth / 2)) && !this.sentCriticalHealthEvent) {
          this.sentCriticalHealthEvent = true;
          this.emitPipelineEvent({ type: 'health.critical', wave: this.wave, integrity: this.systemHealth });
        }

        if (this.systemHealth <= 0) {
          this.triggerSystemFailure();
          return;
        }

        continue;
      }

      remaining.push(packet);
    }

    this.dataPackets = remaining;
  }

  private triggerSystemFailure() {
    this.isRunOver = true;
    this.setMessage(
      this.runOptions.locale === 'ru'
        ? 'Сбой системы. Нажмите на поле, чтобы перезапустить попытку.'
        : 'System failure. Click the board to restart run.',
    );
    this.emitPipelineEvent({ type: 'run.loss', wave: this.wave, integrity: this.systemHealth });

    this.add.rectangle(450, 260, 760, 200, 0x020617, 0.88).setStrokeStyle(2, 0xef4444).setDepth(40);
    this.add
      .text(450, 220, this.runOptions.locale === 'ru' ? 'ПРОРЫВ СИСТЕМЫ' : 'SYSTEM BREACH', {
        fontFamily: 'monospace',
        fontSize: '40px',
        color: '#f87171',
      })
      .setOrigin(0.5)
      .setDepth(41);

    const summary = this.buildRunSummary();
    this.add
      .text(
        450,
        276,
        this.runOptions.locale === 'ru'
          ? `Обработано ${summary.processedCount} | Волна ${summary.waveReached} | Счёт ${summary.score}`
          : `Processed ${summary.processedCount} | Wave ${summary.waveReached} | Score ${summary.score}`,
        {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#fecaca',
      },
      )
      .setOrigin(0.5)
      .setDepth(41);

    this.add
      .text(
        450,
        314,
        this.runOptions.locale === 'ru'
          ? `Выживание ${summary.survivalSeconds}с | Пик сессий ${summary.activeSessionPeak}`
          : `Survived ${summary.survivalSeconds}s | Sessions peak ${summary.activeSessionPeak}`,
        {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#fbcfe8',
      },
      )
      .setOrigin(0.5)
      .setDepth(41);

    window.dispatchEvent(
      new CustomEvent<RunSummaryPayload>(RUN_COMPLETE_EVENT, {
        detail: summary,
      }),
    );
  }

  private completeTimedRun() {
    this.isRunOver = true;
    this.setMessage(this.runOptions.locale === 'ru' ? 'Лимит времени достигнут. Смена завершена.' : 'Time limit reached. Shift completed.');

    const summary = this.buildRunSummary();
    this.add.rectangle(450, 260, 760, 200, 0x020617, 0.88).setStrokeStyle(2, 0x22d3ee).setDepth(40);
    this.add
      .text(450, 220, this.runOptions.locale === 'ru' ? 'СМЕНА ЗАВЕРШЕНА' : 'SHIFT COMPLETE', {
        fontFamily: 'monospace',
        fontSize: '40px',
        color: '#67e8f9',
      })
      .setOrigin(0.5)
      .setDepth(41);

    this.add
      .text(
        450,
        276,
        this.runOptions.locale === 'ru'
          ? `Обработано ${summary.processedCount} | Волна ${summary.waveReached} | Счёт ${summary.score}`
          : `Processed ${summary.processedCount} | Wave ${summary.waveReached} | Score ${summary.score}`,
        {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#bae6fd',
      },
      )
      .setOrigin(0.5)
      .setDepth(41);

    window.dispatchEvent(
      new CustomEvent<RunSummaryPayload>(RUN_COMPLETE_EVENT, {
        detail: summary,
      }),
    );
  }


  private buildRunSummary(): RunSummaryPayload {
    const efficiencyBonus = Math.floor((this.processedCount * 100) / Math.max(1, this.creditsSpent + 20));
    const rawScore = this.processedCount * 10 + this.wave * 100 + Math.floor(this.elapsedSeconds * 2) + efficiencyBonus;
    const score = Math.floor(rawScore * this.difficultyTuning.scoreMultiplier);

    return {
      processedCount: this.processedCount,
      waveReached: this.wave,
      survivalSeconds: Math.floor(this.elapsedSeconds),
      creditsSpent: this.creditsSpent,
      systemHealthEnd: this.systemHealth,
      activeSessionPeak: this.activeSessionPeak,
      score,
      mode: this.runOptions.mode,
      difficulty: this.runOptions.difficulty,
      challengeDate: this.runOptions.challengeDate,
      challengeSeed: this.runOptions.challengeSeed,
    };
  }

  private destroySession(key: string, session: SessionUnit) {
    this.tweens.add({
      targets: [session.sprite, session.ttlText, session.capText],
      alpha: 0,
      duration: 180,
      onComplete: () => {
        session.sprite.destroy();
        session.ttlText.destroy();
        session.capText.destroy();
      },
    });
    this.sessions.delete(key);
  }

  private updateWaveScaling() {
    const nextWave = Math.floor(this.elapsedSeconds / 18) + 1;
    if (nextWave > this.wave) {
      this.wave = nextWave;
      this.spawnIntervalSeconds = Math.max(0.45, (2.1 - this.wave * 0.17) / this.difficultyTuning.spawnPressureMultiplier);
      this.setMessage(
        this.runOptions.locale === 'ru' ? `Волна ${this.wave}: входящий трафик усилился.` : `Wave ${this.wave}: ingress traffic increased.`,
      );
      this.emitPipelineEvent({ type: 'wave.start', wave: this.wave, integrity: this.systemHealth });
      if (this.runOptions.mode === 'ENDLESS' && this.wave >= 25 && !this.sentWave25Hook) {
        this.sentWave25Hook = true;
        window.dispatchEvent(
          new CustomEvent(ARIA_LINE_EVENT, {
            detail: { line: '// ARIA: wave 25 reached... you are matching patterns from Incident-9A.' },
          }),
        );
      }
    }
  }

  private spawnDataPacket() {
    const lane = this.randomBetween(0, LANE_COUNT - 1);
    const laneY = BOARD_Y + lane * LANE_HEIGHT;
    const type = this.pickDataArchetype();
    const spec = DATA_SPECS[type];

    const scale = 1 + this.wave * 0.12;
    const hp = Math.max(1, Math.floor(spec.baseHp * scale * this.difficultyTuning.dataHpMultiplier));
    const speed = (spec.speedPxPerSecond + this.wave * 2.3) * this.difficultyTuning.dataSpeedMultiplier;
    const startX = BOARD_X + (COLUMN_COUNT - 1) * CELL_WIDTH + 35;

    const sprite = this.add.rectangle(startX, laneY, spec.size, spec.size, spec.color, 1).setStrokeStyle(2, spec.strokeColor);

    this.dataPackets.push({
      id: Phaser.Utils.String.UUID(),
      lane,
      type,
      hp,
      maxHp: hp,
      speedPxPerSecond: speed,
      rewardCredits: spec.rewardCredits,
      sprite,
    });

    if (type === 'CORRUPTED_DATA' && !this.sentCorruptedSeenEvent) {
      this.sentCorruptedSeenEvent = true;
      this.emitPipelineEvent({ type: 'data.corrupted', lane, wave: this.wave, integrity: this.systemHealth });
    }
  }

  private pickDataArchetype(): DataArchetype {
    const roll = this.randomBetween(1, 100);
    const waveBias = Math.min(20, this.wave * 2);

    if (roll <= 45 - Math.floor(waveBias * 0.3)) {
      return 'PACKET';
    }

    if (roll <= 70) {
      return 'BURST_TRAFFIC';
    }

    if (roll <= 90) {
      return 'HEAVY_DOCUMENT';
    }

    return 'CORRUPTED_DATA';
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

    const spec = SESSION_SPECS[this.selectedSessionType];
    this.hudText.setText(
      this.runOptions.locale === 'ru'
        ? `Режим: ${this.runOptions.mode} | Сложность: ${this.runOptions.difficulty} | Кредиты: ${Math.floor(this.credits)} | Здоровье: ${this.systemHealth} | Обработано: ${this.processedCount} | Волна: ${this.wave} | Время: ${Math.floor(this.elapsedSeconds)}с`
        : `Mode: ${this.runOptions.mode} | Difficulty: ${this.runOptions.difficulty} | Credits: ${Math.floor(this.credits)} | Health: ${this.systemHealth} | Processed: ${this.processedCount} | Wave: ${this.wave} | Time: ${Math.floor(this.elapsedSeconds)}s`,
    );
    const maxHealth = this.difficultyTuning.startingSystemHealth;
    const integrityPercent = Math.round((Math.max(0, this.systemHealth) / maxHealth) * 100);
    window.dispatchEvent(
      new CustomEvent<PipelineHudPayload>(HUD_UPDATE_EVENT, {
        detail: {
          mode: this.runOptions.mode,
          difficulty: this.runOptions.difficulty,
          credits: Math.floor(this.credits),
          processed: this.processedCount,
          wave: this.wave,
          timeSeconds: Math.floor(this.elapsedSeconds),
          systemHealth: this.systemHealth,
          maxSystemHealth: maxHealth,
          integrityPercent,
          selectedSessionLabel: spec.label,
        },
      }),
    );
  }

  private setMessage(message: string) {
    this.messageText?.setText(message);
  }

  private renderSelectionHint() {
    const spec = SESSION_SPECS[this.selectedSessionType];
    const dps = (spec.damage / spec.fireRateSeconds).toFixed(1);
    const corruptedHint = spec.corruptedMultiplier
      ? this.runOptions.locale === 'ru'
        ? ` | x${spec.corruptedMultiplier} против повреждённых данных`
        : ` | x${spec.corruptedMultiplier} vs Corrupted Data`
      : '';
    this.helperText?.setText(
      this.runOptions.locale === 'ru'
        ? `${spec.label}: TTL ${spec.ttlSeconds}с | Ёмкость ${spec.capacity} | DPS ${dps}${corruptedHint}`
        : `${spec.label}: TTL ${spec.ttlSeconds}s | Capacity ${spec.capacity} | DPS ${dps}${corruptedHint}`,
    );
  }

  private cellKey(lane: number, column: number): string {
    return `${lane}-${column}`;
  }

  private randomBetween(min: number, max: number): number {
    if (this.randomizer) {
      return this.randomizer.between(min, max);
    }

    return Phaser.Math.Between(min, max);
  }

  private flashLane(lane: number, color: number) {
    const y = BOARD_Y + lane * LANE_HEIGHT;
    const overlay = this.add
      .rectangle(BOARD_X + (COLUMN_COUNT * CELL_WIDTH) / 2, y, COLUMN_COUNT * CELL_WIDTH, LANE_HEIGHT - 6, color, 0.22)
      .setStrokeStyle(1, color)
      .setDepth(8);

    this.time.delayedCall(FEEDBACK_FLASH_TTL_MS, () => {
      overlay.destroy();
    });
  }

  private emitPipelineEvent(payload: PipelineEventPayload) {
    window.dispatchEvent(
      new CustomEvent<PipelineEventPayload>(PIPELINE_EVENT, {
        detail: payload,
      }),
    );
  }

  private onPauseEvent = (event: Event) => {
    const customEvent = event as CustomEvent<{ paused: boolean }>;
    this.isPaused = customEvent.detail.paused;

    if (this.isPaused) {
      this.pauseOverlay = this.add
        .text(450, 260, this.runOptions.locale === 'ru' ? 'ПАУЗА' : 'PAUSED', {
          fontFamily: 'monospace',
          fontSize: '52px',
          color: '#e2e8f0',
          backgroundColor: '#020617',
          padding: { x: 18, y: 10 },
        })
        .setOrigin(0.5)
        .setDepth(50);
      return;
    }

    this.pauseOverlay?.destroy();
    this.pauseOverlay = undefined;
  };

  private flashIntegrityLoss() {
    const overlay = this.add.rectangle(450, 260, 900, 520, 0xef4444, 0).setDepth(18);
    this.tweens.add({
      targets: overlay,
      alpha: 0.16,
      duration: 90,
      yoyo: true,
      onComplete: () => overlay.destroy(),
    });
  }
}
