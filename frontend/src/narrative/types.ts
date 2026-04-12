export type Act = 'ACT_I_ONBOARDING' | 'ACT_II_CONTAINMENT' | 'ACT_III_REVELATION' | 'ACT_IV_CONVERGENCE';

export type NarrativeTrigger =
  | 'run.start'
  | 'session.first_placed'
  | 'session.first_expired'
  | 'wave.first_start'
  | 'wave.reached_5'
  | 'data.corrupted_first_seen'
  | 'data.first_leaked'
  | 'health.critical'
  | 'run.loss'
  | 'run.win';

export interface AriaLine {
  id: string;
  act: Act;
  beatKey: string;
  trigger: NarrativeTrigger;
  priority: number;
  cooldownMs: number;
  text: string;
}

export interface LogFragment {
  id: string;
  act: Act;
  title: string;
  excerpt: string;
}

export interface StoryBeat {
  key: string;
  act: Act;
  title: string;
  summary: string;
  triggers: NarrativeTrigger[];
}
