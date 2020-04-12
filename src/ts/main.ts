import { PianoKeys } from './piano-keys';

if (customElements.get(PianoKeys.tag) == null) {
  customElements.define(PianoKeys.tag, PianoKeys);
}