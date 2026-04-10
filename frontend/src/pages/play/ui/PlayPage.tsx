import { PhaserGameCanvas } from '../../../widgets/phaser-game/ui/PhaserGameCanvas';

export function PlayPage() {
  return (
    <section>
      <h2>Play</h2>
      <p>
        Phase 1 shell: Phaser canvas is active. Core lane defense gameplay systems start in Phase 4.
      </p>
      <PhaserGameCanvas />
    </section>
  );
}
