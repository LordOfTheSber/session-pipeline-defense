import { PhaserGameCanvas } from '../../../widgets/phaser-game/ui/PhaserGameCanvas';

export function PlayPage() {
  return (
    <section>
      <h2>Play</h2>
      <p>
        Phase 4 vertical slice is live: deploy Sessions into lanes, process incoming Data, and maintain
        throughput before overload.
      </p>
      <PhaserGameCanvas />
    </section>
  );
}
