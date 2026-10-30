import type { Character } from './BackgroundVideo.tsx';

const OPTIONS: { value: Character; label: string }[] = [
  { value: 'woman', label: 'Nainen' },
  { value: 'man', label: 'Mies' },
];

/** Selkeä kaksiasentoinen kytkin taustahahmon valintaan. */
export function CharacterSwitch({ value, onChange, visible }: { value: Character; onChange: (c: Character) => void; visible: boolean }) {
  return <fieldset lang="fi" className={`character-switch${visible ? '' : ' is-hidden'}`} data-value={value} inert={!visible}>
    <legend className="sr-only">Taustahahmo</legend>
    <span className="character-switch__thumb" aria-hidden="true" />
    {OPTIONS.map(o => (
      <label key={o.value} className={`character-switch__option${value === o.value ? ' is-on' : ''}`}>
        <input type="radio" name="character" value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
        <span>{o.label}</span>
      </label>
    ))}
  </fieldset>;
}

const KEY = 'gettowork.character';

export function loadCharacter(): Character {
  try {
    // Oletuksena mies; nainen vain, jos kävijä on valinnut sen.
    return window.localStorage.getItem(KEY) === 'woman' ? 'woman' : 'man';
  } catch {
    return 'man';
  }
}

export function saveCharacter(c: Character) {
  try { window.localStorage.setItem(KEY, c); } catch { /* valinta toimii ilman tallennusta */ }
}
