import audit from './utils/audit';

class PianoKeys extends HTMLElement {

  static get observedAttributes() { 
    return [
      'min',
      'max',
      'layout',
      'fixed'
    ]; 
  }

  private _shadowRoot: ShadowRoot;

  private _canvas: HTMLCanvasElement;

  private _ctx: CanvasRenderingContext2D;

  private _whiteKeyColor: string  = '#fff';
  private _whiteKeyOnColor: string  = '#eee';

  private _blackKeyColor: string  = '#444';
  private _blackKeyOnColor: string  = '#000';
  private _strokeColor: string    = '#000';
  
  private static MIN_KEY_WIDTH = 5;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({mode: 'closed'});

    this._canvas = document.createElement('canvas');
    this._canvas.classList.add('piano-keyboard-canvas');

    this._ctx = this._canvas.getContext('2d');

    const style = document.createElement('style');
    style.textContent = CSS_STYLE;

    this._shadowRoot.append(style);
    this._shadowRoot.append(this._canvas);

    window.addEventListener('resize', audit(() => this.resize()));
  }

  private resize(): void {
    const boundingClientRect = this._canvas.getBoundingClientRect();
    this._canvas.width = boundingClientRect.width;
    this._canvas.height = boundingClientRect.height;
    this.draw();
  }

  connectedCallback() {
    this.resize();
  }

  private draw() {
    const layout = this.getAttribute('layout');

    switch(layout) {
      case 'classic':
        this.drawClassic(this._canvas.width, this._canvas.height);
        break;
      default:
        this.drawLinear(this._canvas.width, this._canvas.height);
    }
  }

  private drawLinear(width: number, height: number) {
    const fixed = this.getAttribute('fixed');
    const startNote = Number(this.getAttribute('min'));
    const endNote = Math.max(Number(this.getAttribute('max')), startNote + 2);

    let range, keyWidth;

    if (nullOrEmpty(fixed)) {
      range = endNote - startNote;
      keyWidth = width / range;
    } else {
      keyWidth = Number(fixed);
      range = Math.ceil(width / keyWidth);
    }

    let currentStep = 0;

    while (currentStep < range) {
      const currentNote = currentStep + startNote;
      this._ctx.fillStyle = PianoKeys.isBlackKey(currentNote) ? this._blackKeyColor : this._whiteKeyColor;
      this._ctx.fillRect(Math.round(currentStep * keyWidth), 0, keyWidth, height);
      
      if (currentStep > 0) {
        this._ctx.fillStyle = this._strokeColor;
        this._ctx.fillRect(Math.round(currentStep * keyWidth), 0, 1, height);
      }

      currentStep++;
    }
  }

  private drawClassic(width: number, height: number) {
    const fixed = this.getAttribute('fixed');
    let startNote = Number(this.getAttribute('min'));

    if (PianoKeys.isBlackKey(startNote)) {
      startNote--;
    }

    let endNote = Math.max(Number(this.getAttribute('max')), startNote + 2);

    if (PianoKeys.isBlackKey(startNote)) {
      endNote++;
    }

    let range, whiteKeyWidth, numWhiteKeys;

    if (nullOrEmpty(fixed)) {
      range = endNote - startNote;
      numWhiteKeys = Math.floor(range * (7 / 12));
      whiteKeyWidth = width / numWhiteKeys;
    } else {
      whiteKeyWidth = Math.max(Number(fixed), PianoKeys.MIN_KEY_WIDTH);
      numWhiteKeys = Math.ceil(width / whiteKeyWidth);
      range = Math.ceil(numWhiteKeys * (12 / 7));
    }

    // Background
    this._ctx.fillStyle = this._whiteKeyColor;
    this._ctx.fillRect(0, 0, width, height);

    // White key separations
    this._ctx.fillStyle = this._strokeColor;

    for (let i = 1; i < numWhiteKeys; ++i) {
      const x = Math.floor(i * whiteKeyWidth);
      this._ctx.fillRect(x, 0, 1, height);
    }

    // Black keys
    const blackKeyHeight = height * 0.71;
    const blackKeyWidth = Math.round(whiteKeyWidth * 0.85);

    this._ctx.fillStyle = this._blackKeyColor;

    for (let i = 0; i < range; ++i) {
      if (PianoKeys.isBlackKey(i + startNote)) {
        const x = Math.floor(i * whiteKeyWidth - blackKeyWidth * 0.5);
        this._ctx.fillRect(x, 0, blackKeyWidth, blackKeyHeight);
      }
    }
  }

  private static isBlackKey(noteNumber: number) {
    return [1, 3, 6, 8, 10].includes(noteNumber % 12);
  }
}

customElements.define('piano-keys', PianoKeys);

const CSS_STYLE = `
:host {
  width: 80%;
  height: 130px;
  margin: auto;
}

.piano-keyboard-canvas {
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
  background-color: grey;
}
`;

function nullOrEmpty(value: string): boolean {
  return value == null || value === '';
}
