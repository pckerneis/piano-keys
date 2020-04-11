declare class ResizeObserver {
  constructor(...args : any[]);
  observe(...elements: HTMLElement[]): any;
}

enum PianoKeysLayout {
  classic   = 'classic',
  linear    = 'linear',
}

enum PianoKeysMode {
  toggle    = 'toggle',
  slide     = 'slide',
  default   = 'default',
  none      = 'none',
}

interface KeyBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

class PianoKeys extends HTMLElement {
  public strokeStyle: string = '#000';
  public whiteKeyFillStyle: string = '#fff';
  public whiteKeyHoverFillStyle: string = '#eee';
  public whiteKeyOnFillStyle: string = '#ccc';
  public blackKeyFillStyle: string = '#888';
  public blackKeyHoverFillStyle: string = '#333';
  public blackKeyOnFillStyle: string = '#111';

  private static MIN_KEY_WIDTH = 5;

  private _shadowRoot: ShadowRoot;
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _whiteKeyBounds: Map<number, KeyBounds> = new Map<number, KeyBounds>();
  private _blackKeyBounds: Map<number, KeyBounds> = new Map<number, KeyBounds>();
  private _keyOns: number[] = [];
  private _hoveredKey: number = null;

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

    // Events handlers
    const resizeObserver = new ResizeObserver(() => this.resize());
    resizeObserver.observe(this);

    this._canvas.addEventListener('mousedown', (event) => this.handleMouseDown(event));
    document.addEventListener('mouseup', (event) => this.handleMouseUp(event));
    this._canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
    this._canvas.addEventListener('mouseleave', (event) => this.handleMouseLeave(event));
  }

  static get observedAttributes() { 
    return [
      'start',
      'end',
      'layout',
      'fixed',
      'mode'
    ]; 
  }

  private static isBlackKey(keyNumber: number) {
    return [1, 3, 6, 8, 10].includes(keyNumber % 12);
  }

  public get keyOns(): number[] {
    return this._keyOns;
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

  public get hoveredKey(): number {
    return this._hoveredKey;
  }

  public set mode(newValue: string) {
    if (this.mode !== newValue) {
      this.setAttribute('mode', newValue);
      this._keyOns = [];
      this._hoveredKey = null;
      this.draw();
    }
  }

  public connectedCallback() {
    this.resize();
  }
  
  public attributeChangedCallback(/* name, oldValue, newValue */) {
    this.draw();
  }

  private handleMouseDown(event: MouseEvent) {
    const mode = this.mode;

    if (mode === 'none') {
      return;
    }

    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    const keyPressed = this.getKeyAtPosition(mouseX, mouseY);

    if (keyPressed != null) {
      if (mode === 'toggle') {
        if (this._keyOns.includes(keyPressed)) {
          this._keyOns = this._keyOns.filter((v) => v !== keyPressed);
        } else {
          this._keyOns = [...this._keyOns, keyPressed];
        }

        this.notifyKeyChange();
      } else {
        this._keyOns = [keyPressed];
        this.notifyKeyChange();
      }
    }

    this.draw();
  }

  private handleMouseUp(event: MouseEvent) {
    const mode = this.mode;

    if (mode === 'none') {
      return;
    }

    if (mode !== 'toggle') {
      this._keyOns = [];
      this.notifyKeyChange();
    }

    this.draw();
  }

  private handleMouseMove(event: MouseEvent) {
    const mode = this.mode;

    if (mode === 'none') {
      return;
    }

    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    const newHoveredKey = this.getKeyAtPosition(mouseX, mouseY);

    if (this._hoveredKey != newHoveredKey) {
      this._hoveredKey = newHoveredKey;
      this.dispatchEvent(new CustomEvent('keyhover'));
    }

    if (mode === 'none') {
      this.draw();
      return;
    }

    let changed = false;

    if (event.buttons == 0 && mode != 'toggle') {
      if (this._keyOns.length > 0) {
        this._keyOns = [];
        changed = true;
      }
    } else {
      if (mode === 'slide') {
        if (this._keyOns.length !== 1 || this._keyOns[0] !== this._hoveredKey) {
          this._keyOns = [this._hoveredKey];
          changed = true;          
        }
      }
    }

    if (changed) {
      this.notifyKeyChange();
    }

    this.draw();
  }

  private handleMouseLeave(event: MouseEvent) {
    this._hoveredKey = null;
    this.dispatchEvent(new CustomEvent('keyhover'));
    
    this.draw();
  }

  private getKeyAtPosition(x: number, y: number): number {
    let result = null;

    [...this._blackKeyBounds.entries(), ...this._whiteKeyBounds.entries()].some(entry => {
      const bounds: KeyBounds = entry[1];
      if (x >= bounds.x && x < bounds.x + bounds.width
          && y >= bounds.y && y < bounds.y + bounds.height) {
        result = entry[0];
        return true;
      }
    });

    return result;
  }

  private notifyKeyChange(): void {
    this.dispatchEvent(new CustomEvent('keychange'));
  }

  private resize(): void {
    const boundingClientRect = this._canvas.getBoundingClientRect();
    this._canvas.width = boundingClientRect.width;
    this._canvas.height = boundingClientRect.height;
    this.draw();
  }

  public draw() {
    this._whiteKeyBounds.clear();
    this._blackKeyBounds.clear();

    switch(this.layout) {
      case PianoKeysLayout.classic:
        this.drawClassic(this._canvas.width, this._canvas.height);
        break;
      default:
        this.drawLinear(this._canvas.width, this._canvas.height);
    }
  }

  private drawLinear(width: number, height: number) {
    const startKey = this.start;
    const endKey = Math.max(this.end, startKey + 2);

    let range, keyWidth;

    if (this.fixed == null || this.fixed <= 0) {
      range = 1 + endKey - startKey;
      keyWidth = width / range;
    } else {
      keyWidth = Math.max(PianoKeys.MIN_KEY_WIDTH, this.fixed);
      range = Math.ceil(width / keyWidth);
    }

    let currentStep = 0;

    while (currentStep < range) {
      const currentKey = currentStep + startKey;
      const x = Math.floor(currentStep * keyWidth);

      this.drawKey(currentKey, {
        x,
        y: 0,
        width: keyWidth, 
        height
      });
      
      if (currentStep > 0) {
        this._ctx.fillStyle = this.strokeStyle;
        this._ctx.fillRect(x, 0, 1, height);
      }

      const bounds: KeyBounds = {
        x,
        y: 0, 
        width: keyWidth,
        height
      };

      if (PianoKeys.isBlackKey(currentKey)) {
        this._blackKeyBounds.set(currentKey, bounds);
      } else {
        this._whiteKeyBounds.set(currentKey, bounds);
      }

      currentStep++;
    }
  }

  private drawClassic(width: number, height: number) {
    let startKey = this.start;

    if (PianoKeys.isBlackKey(startKey)) {
      startKey--;
    }

    let endKey = Math.max(this.end, startKey + 2);

    if (PianoKeys.isBlackKey(endKey)) {
      endKey++;
    }

    let range, whiteKeyWidth, numWhiteKeys;

    if (this.fixed == null || this.fixed <= 0) {
      range = 1 + endKey - startKey;
      numWhiteKeys = Math.round(range * (7 / 12));
      whiteKeyWidth = width / numWhiteKeys;
    } else {
      whiteKeyWidth = Math.max(this.fixed, PianoKeys.MIN_KEY_WIDTH);
      numWhiteKeys = Math.ceil(width / whiteKeyWidth);
      range = Math.ceil(numWhiteKeys * (12 / 7));
    }

    const blackKeyHeight = height * 0.65;
    const blackKeyWidth = Math.round(whiteKeyWidth * 0.58);
    let whiteKeyCounter = 0;

    // Determine key bounds
    for (let i = 0; i < range; ++i) {
      const currentKey = i + startKey;

      if (PianoKeys.isBlackKey(currentKey)) {
        const nextWhiteX = whiteKeyCounter * whiteKeyWidth;
        const x = Math.round(nextWhiteX - blackKeyWidth * 0.5);
        
        this._blackKeyBounds.set(currentKey, {
          x,
          y: 0, 
          width: blackKeyWidth,
          height: blackKeyHeight
        });
      } else {
        const x = Math.round(whiteKeyCounter * whiteKeyWidth);

        this._whiteKeyBounds.set(currentKey, {
          x,
          y: 0, 
          width: whiteKeyWidth,
          height
        });

        whiteKeyCounter++;
      }

      // Draw white keys
      let first = true;

      for (const e of this._whiteKeyBounds.entries()) {
        this.drawKey(e[0], e[1]);

        if (first) {
          first = false;
        } else {
          this._ctx.fillStyle = this.strokeStyle;
          this._ctx.fillRect(e[1].x, 0, 1, height);
        }
      }

      // Draw black keys
      for (const e of this._blackKeyBounds.entries()) {
        this.drawKey(e[0], e[1]);
      };
    }
  }

  private getStringAttribute(key: string): string {
    return this.hasAttribute(key) ? this.getAttribute(key) : null;
  }

  private getNumberAttribute(key: string): number {
    return this.hasAttribute(key) ? Number(this.getAttribute(key)) : null;
  }

  protected drawKey(keyNumber: number, keyBounds: KeyBounds) {
    this._ctx.fillStyle = this.getFillStyle(keyNumber);
    this._ctx.fillRect(keyBounds.x, keyBounds.y, keyBounds.width, keyBounds.height);

    if (this.layout == 'classic' && PianoKeys.isBlackKey(keyNumber)) {
      this._ctx.fillStyle = this.strokeStyle;
      this._ctx.fillRect(Math.round(keyBounds.x), keyBounds.y, 1, keyBounds.height);
      this._ctx.fillRect(Math.round(keyBounds.x), keyBounds.y + keyBounds.height - 1, keyBounds.width, 1);
      this._ctx.fillRect(Math.round(keyBounds.x + keyBounds.width - 1), keyBounds.y, 1, keyBounds.height);
    }
  }

  protected getFillStyle(keyNumber: number): string {
    return PianoKeys.isBlackKey(keyNumber) ?
        this._keyOns.includes(keyNumber) ? 
            this.blackKeyOnFillStyle : (this._hoveredKey === keyNumber ?
                this.blackKeyHoverFillStyle : this.blackKeyFillStyle) :
        this._keyOns.includes(keyNumber) ? 
            this.whiteKeyOnFillStyle : (this._hoveredKey === keyNumber ?
                this.whiteKeyHoverFillStyle : this.whiteKeyFillStyle)
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
