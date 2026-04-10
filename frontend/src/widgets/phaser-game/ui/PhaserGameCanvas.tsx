import * as Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import { PipelineScene } from '../../../entities/pipeline/ui/PipelineScene';

export function PhaserGameCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 900,
      height: 520,
      parent: containerRef.current,
      backgroundColor: '#0b1320',
      scene: [PipelineScene],
    });

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={containerRef} className="phaser-host" />;
}
