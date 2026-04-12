import * as Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import { PipelineScene, type PipelineRunOptions } from '../../../entities/pipeline/ui/PipelineScene';

type PhaserGameCanvasProps = {
  runOptions: PipelineRunOptions;
};

export function PhaserGameCanvas({ runOptions }: PhaserGameCanvasProps) {
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
      scene: [new PipelineScene(runOptions)],
    });

    return () => {
      game.destroy(true);
    };
  }, [runOptions]);

  return <div ref={containerRef} className="phaser-host" />;
}
