import audit from './utils/audit';

enum PianoKeysLayout {
  classic   = 'classic',
  linear    = 'linear',
}

enum PianoKeysMode {
  toggle    = 'toggle',
  slide     = 'slide',
  default   = 'default',
}

class PianoKeys extends HTMLElement {

  static get observedAttributes() { 
    return [
      'start',
      'end',
      'layout',
      'fixed',
      'mode'
    ]; 
  }

  public get start(): number {
    return this.getNumberAttribute('start');
  }

  public set start(newValue: number) {
    this.setAttribute('start', '' + newValue);
  }

  public get end(): number {
    return this.getNumberAttribute('end');
  }

  public set end(newValue: number) {
    this.setAttribute('end', '' + newValue);
  }

  public get fixed(): number {
    return this.getNumberAttribute('fixed');
  }

  public set fixed(newValue: number) {
    this.setAttribute('fixed', '' + newValue);
  }

  public get layout(): PianoKeysLayout | string {
    return this.getStringAttribute('layout');
  }

  public set layout(newValue: string) {
    this.setAttribute('layout', newValue);
  }

  public get mode(): PianoKeysMode | string {
    return this.getStringAttribute('mode');
  }

  public set mode(newValue: string) {
    this.setAttribute('mode', newValue);
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
  
  attributeChangedCallback(/* name, oldValue, newValue */) {
    this.draw();
  }

  private draw() {
    switch(this.layout) {
      case PianoKeysLayout.classic:
        this.drawClassic(this._canvas.width, this._canvas.height);
        break;
      default:
        this.drawLinear(this._canvas.width, this._canvas.height);
    }
  }

  private drawLinear(width: number, height: number) {
    const startNote = this.start;
    const endNote = Math.max(this.end, startNote + 2);

    let range, keyWidth;

    if (this.fixed == null || this.fixed <= 0) {
      range = endNote - startNote;
      keyWidth = width / range;
    } else {
      keyWidth = Math.max(PianoKeys.MIN_KEY_WIDTH, this.fixed);
      range = Math.ceil(width / keyWidth);
    }

    let currentStep = 0;

    while (currentStep < range) {
      const currentNote = currentStep + startNote;
      this._ctx.fillStyle = PianoKeys.isBlackKey(currentNote) ? this._blackKeyColor : this._whiteKeyColor;
      this._ctx.fillRect(Math.floor(currentStep * keyWidth), 0, keyWidth + 1, height);
      
      if (currentStep > 0) {
        this._ctx.fillStyle = this._strokeColor;
        this._ctx.fillRect(Math.floor(currentStep * keyWidth), 0, 1, height);
      }

      currentStep++;
    }
  }

  private drawClassic(width: number, height: number) {
    let startNote = this.start;

    if (PianoKeys.isBlackKey(startNote)) {
      startNote--;
    }

    let endNote = Math.max(this.end, startNote + 2);

    if (PianoKeys.isBlackKey(endNote)) {
      endNote++;
    }

    let range, whiteKeyWidth, numWhiteKeys;

    if (this.fixed == null || this.fixed <= 0) {
      range = endNote - startNote;
      numWhiteKeys = Math.round(range * (7 / 12));
      whiteKeyWidth = width / numWhiteKeys;
    } else {
      whiteKeyWidth = Math.max(this.fixed, PianoKeys.MIN_KEY_WIDTH);
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
    const blackKeyHeight = height * 0.65;
    const blackKeyWidth = Math.round(whiteKeyWidth * 0.58);
    this._ctx.fillStyle = this._blackKeyColor;
    let whiteKeyCounter = 0;

    for (let i = 0; i < range; ++i) {
      if (PianoKeys.isBlackKey(i + startNote)) {
        const nextWhiteX = whiteKeyCounter * whiteKeyWidth;
        const x = nextWhiteX - blackKeyWidth * 0.5;
        this._ctx.fillRect(x, 0, blackKeyWidth, blackKeyHeight);
      } else {
        whiteKeyCounter++;
      }
    }
  }

  private static isBlackKey(noteNumber: number) {
    return [1, 3, 6, 8, 10].includes(noteNumber % 12);
  }

  private getStringAttribute(key: string): string {
    return this.hasAttribute(key) ? this.getAttribute(key) : null;
  }

  private getNumberAttribute(key: string): number {
    return this.hasAttribute(key) ? Number(this.getAttribute(key)) : null;
  }
}

customElements.define('piano-keys', PianoKeys);

const CSS_STYLE = `
:host {
  display: block;
}

.piano-keyboard-canvas {
  width: 100%;
  height: 100%;
}
`;
