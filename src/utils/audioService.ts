export type SoundEffect = 
  | 'sfx_quest_complete.mp3'
  | 'sfx_level_up.mp3'
  | 'sfx_warning_alert.mp3'
  | 'sfx_ui_click.mp3'
  | 'sfx_rebirth_sequence.mp3';

export const playSystemSFX = (fileName: SoundEffect, enabled: boolean = true) => {
  if (!enabled) return;
  
  try {
    const audio = new Audio(`/audio/${fileName}`);
    audio.volume = 0.5;
    audio.play().catch((e) => {
      // Browsers often block audio until user interaction
      console.warn("System Audio Node: User interaction required or file missing.", e);
    });
  } catch (e) {
    console.error("System: Failed to play sound effect", e);
  }
};
