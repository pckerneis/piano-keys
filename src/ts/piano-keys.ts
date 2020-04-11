declare class ResizeObserver {
  constructor(...args : any[]);
  public observe(...elements: HTMLElement[]): any;
}

/**
 * The layout for the keys. See {@link PianoKeys.layout}.
 */
export enum PianoKeysLayout {
  classic   = 'classic',
  linear    = 'linear',
}

/**
 * The layout for the keys. See {@link PianoKeys.mode}.
 */
export enum PianoKeysMode {
  toggle    = 'toggle',
  slide     = 'slide',
  default   = 'default',
  none      = 'none',
}

/**
 * Describes the position and the size of a key relative to the canvas origin.
 */
export interface KeyBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * A canvas-based piano keyboard.
 *
 * ```
 * <piano-keys min="60" max="84" mode="slide"></piano-keys>
 * ```
 */
export class PianoKeys extends HTMLElement {

  private static MIN_KEY_WIDTH: number = 5;

  private _shadowRoot: ShadowRoot;
  private readonly _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _whiteKeyBounds: Map<number, KeyBounds> = new Map<number, KeyBounds>();
  private _blackKeyBounds: Map<number, KeyBounds> = new Map<number, KeyBounds>();
  private _keys: number[] = [];
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
    document.addEventListener('mouseup', () => this.handleMouseUp());
    this._canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
    this._canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
  }

  /**
   * HTML tag name used for this element.
   */
  public static get tag(): string {
    return "piano-keys";
  }

  /**
   * Observed HTML attributes (custom element implementation).
   */
  public static get observedAttributes(): string[] {
    return [
      'start',
      'end',
      'layout',
      'fixed',
      'mode',
      'stroke',
      'whiteKey',
      'whiteKeyHover',
      'whiteKeyOn',
      'blackKey',
      'blackKeyHover',
      'blackKeyOn',
    ]; 
  }

  /**
   * Does the provided key value correspond to a black key ?
   * @remark This method will always return false for negative values.
   * @param keyNumber the value to test. A key number of 0 corresponds to a `C-2` note.
   */
  public static isBlackKey(keyNumber: number): boolean {
    return [1, 3, 6, 8, 10].includes(keyNumber % 12);
  }

  /**
   * An array of keys that are currently pressed.
   *
   * @remark this returns the actual array used internally to render the keys. You shouldn't mutate it yourself unless you
   * know what you're doing in order to avoid weird mouse logic behaviours. Altering the array won't trigger a redraw.
   */
  public get keys(): number[] {
    return this._keys;
  }

  // Attributes/properties reflection

  /**
   * First key value to show.
   */
  public get start(): number {
    return this.getNumberAttribute('start');
  }

  public set start(newValue: number) {
    this.setAttribute('start', '' + newValue);
  }

  /**
   * Last key value to show.
   *
   * @remark When `fixed` is set to a strictly positive number, the `end` value is ignored. See {@link fixed}.
   * @remark The computed range that is actually shown is restricted to be at least `2`.
   */
  public get end(): number {
    return this.getNumberAttribute('end');
  }

  public set end(newValue: number) {
    this.setAttribute('end', '' + newValue);
  }

  /**
   * A fixed pixel size for a key.
   *
   * If `layout` is set to `linear` then it is the width of any key. If `layout` is set to `classic` then it is the width
   * of a white key.
   * @remark when `fixed` is set to a strictly positive value, the `end` parameter is ignored and the keyboard won't adapt
   * the size of the keys when it is externally resized. It will instead draw as many keys as possible in the available space
   */
  public get fixed(): number {
    return this.getNumberAttribute('fixed');
  }

  public set fixed(newValue: number) {
    this.setAttribute('fixed', '' + newValue);
  }

  /**
   * The keys layout, either `classic` or `linear`. Defaults to `classic`.
   *
   * In `linear` mode, each key has the same width. In `classic` mode, the white keys are placed at regular interval and
   * the black keys are shorter, just like in a real-life classical piano.
   */
  public get layout(): PianoKeysLayout | string {
    return this.getStringAttribute('layout');
  }

  public set layout(newValue: string) {
    this.setAttribute('layout', newValue);
  }

  /**
   * The mouse interaction mode either `default`, `slide`, `toggle` or `none`.
   *
   * In `default` mode, a mouse press activates a key until the the mouse button is released. Mouse drags are ignored.
   * In `slide` mode, mouse drags also activate keys. Only one key stays activate at the same time.
   * In `toggle` mode, a mouse press toggles the state of a key.
   * In `none` mode, keys events are ignored. The hovered key doesn't get styled and pressing keys won't do anything.
   * @remark Previously pressed keys are lost when changing the mode.
   */
  public get mode(): PianoKeysMode | string {
    return this.getStringAttribute('mode');
  }

  public set mode(newValue: string) {
    if (this.mode !== newValue) {
      this.setAttribute('mode', newValue);
      this._keys = [];
      this._hoveredKey = null;
      this.draw();
    }
  }

  /**
   * The key value that is currently under the mouse, or null if there isn't.
   */
  public get hoveredKey(): number {
    return this._hoveredKey;
  }

  // Colors attributes/properties reflection

  /**
   * Fill style used for strokes.
   *
   * It can be either a color, a gradient or a pattern as defined in the Canvas API.
   */
  public get stroke(): string {
    return this.getStringAttribute('stroke');
  }

  /**
   * Fill style used for white keys in normal state.
   *
   * It can be either a color, a gradient or a pattern as defined in the Canvas API.
   */
  public get whiteKey(): string {
    return this.getStringAttribute('whiteKey');
  }

  /**
   * Fill style used for white keys when hovered.
   *
   * It can be either a color, a gradient or a pattern as defined in the Canvas API.
   */
  public get whiteKeyHover(): string {
    return this.getStringAttribute('whiteKeyHover');
  }

  /**
   * Fill style used for white keys when pressed.
   *
   * It can be either a color, a gradient or a pattern as defined in the Canvas API.
   */
  public get whiteKeyOn(): string {
    return this.getStringAttribute('whiteKeyOn');
  }
  /**
   * Fill style used for black keys in normal state.
   *
   * It can be either a color, a gradient or a pattern as defined in the Canvas API.
   */
  public get blackKey(): string {
    return this.getStringAttribute('blackKey');
  }

  /**
   * Fill style used for black keys when hovered.
   *
   * It can be either a color, a gradient or a pattern as defined in the Canvas API.
   */
  public get blackKeyHover(): string {
    return this.getStringAttribute('blackKeyHover');
  }

  /**
   * Fill style used for black keys when hovered.
   *
   * It can be either a color, a gradient or a pattern as defined in the Canvas API.
   */
  public get blackKeyOn(): string {
    return this.getStringAttribute('blackKeyOn');
  }

  public set stroke(newValue: string) {
    this.setAttribute('stroke', newValue);
    this.draw();
  }

  public set whiteKey(newValue: string) {
    this.setAttribute('whiteKey', newValue);
    this.draw();
  }

  public set whiteKeyHover(newValue: string) {
    this.setAttribute('whiteKeyHover', newValue);
    this.draw();
  }

  public set whiteKeyOn(newValue: string) {
    this.setAttribute('whiteKeyOn', newValue);
    this.draw();
  }

  public set blackKey(newValue: string) {
    this.setAttribute('blackKey', newValue);
    this.draw();
  }

  public set blackKeyHover(newValue: string) {
    this.setAttribute('blackKeyHover', newValue);
    this.draw();
  }

  public set blackKeyOn(newValue: string) {
    this.setAttribute('blackKeyOn', newValue);
    this.draw();
  }

  /**
   * Called when the HTML node is first connected to the DOM (custom element implementation).
   */
  public connectedCallback(): void {
    // Default colors
    this.start = this.start                 || 60;
    this.end = this.end                     || 84;
    this.whiteKey = this.whiteKey           || '#fff';
    this.whiteKeyHover = this.whiteKeyHover || '#eee';
    this.whiteKeyOn = this.whiteKeyOn       || '#ccc';
    this.blackKey = this.blackKey           || '#888';
    this.blackKeyHover = this.blackKeyHover || '#333';
    this.blackKeyOn = this.blackKeyOn       || '#111';
    this.stroke = this.stroke               || '#000';

    this.resize();
  }

  /**
   * Called whenever an observed HTML attribute changes (custom element implementation). Redraws the component.
   */
  public attributeChangedCallback(/* name, oldValue, newValue */): void {
    this.draw();
  }

  /**
   * Draws the keys.
   */
  public draw(): void {
    this._whiteKeyBounds.clear();
    this._blackKeyBounds.clear();

    if (this.layout === PianoKeysLayout.linear) {
      this.drawLinear(this._canvas.width, this._canvas.height);
    } else {
      this.drawClassic(this._canvas.width, this._canvas.height);
    }
  }

  /**
   * Draws a single key. This method can be redefined
   */
  protected drawKey(keyNumber: number, keyBounds: KeyBounds): void {
    this._ctx.fillStyle = this.getFillStyle(keyNumber);
    this._ctx.fillRect(keyBounds.x, keyBounds.y, keyBounds.width, keyBounds.height);

    if (this.layout == 'classic' && PianoKeys.isBlackKey(keyNumber)) {
      this._ctx.fillStyle = this.stroke;
      this._ctx.fillRect(Math.round(keyBounds.x), keyBounds.y, 1, keyBounds.height);
      this._ctx.fillRect(Math.round(keyBounds.x), keyBounds.y + keyBounds.height - 1, keyBounds.width, 1);
      this._ctx.fillRect(Math.round(keyBounds.x + keyBounds.width - 1), keyBounds.y, 1, keyBounds.height);
    }
  }

  /**
   * Returns the fill style to use based on the state of the provided key.
   */
  protected getFillStyle(keyNumber: number): string {
    return PianoKeys.isBlackKey(keyNumber) ?
        this._keys.includes(keyNumber) ?
            this.blackKeyOn : (this._hoveredKey === keyNumber ?
                this.blackKeyHover : this.blackKey) :
        this._keys.includes(keyNumber) ?
            this.whiteKeyOn : (this._hoveredKey === keyNumber ?
                this.whiteKeyHover : this.whiteKey)
  }

  private handleMouseDown(event: MouseEvent): void {
    const mode = this.mode;

    if (mode === 'none') {
      return;
    }

    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    const keyPressed = this.getKeyAtPosition(mouseX, mouseY);

    if (keyPressed != null) {
      if (mode === 'toggle') {
        if (this._keys.includes(keyPressed)) {
          this._keys = this._keys.filter((v) => v !== keyPressed);
        } else {
          this._keys = [...this._keys, keyPressed];
        }

        this.notifyKeyChange();
      } else {
        this._keys = [keyPressed];
        this.notifyKeyChange();
      }
    }

    this.draw();
  }

  private handleMouseUp(/* event: MouseEvent */): void {
    const mode = this.mode;

    if (mode === 'none') {
      return;
    }

    if (mode !== 'toggle') {
      this._keys = [];
      this.notifyKeyChange();
    }

    this.draw();
  }

  private handleMouseMove(event: MouseEvent): void {
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
      if (this._keys.length > 0) {
        this._keys = [];
        changed = true;
      }
    } else {
      if (mode === 'slide') {
        if (this._keys.length !== 1 || this._keys[0] !== this._hoveredKey) {
          this._keys = [this._hoveredKey];
          changed = true;          
        }
      }
    }

    if (changed) {
      this.notifyKeyChange();
    }

    this.draw();
  }

  private handleMouseLeave(/* event: MouseEvent */): void {
    this._hoveredKey = null;
    this.dispatchEvent(new CustomEvent('keyhover'));
    
    this.draw();
  }

  private getKeyAtPosition(x: number, y: number): number {
    let result = null;

    [
      ...Array.from(this._blackKeyBounds.entries()),
      ...Array.from(this._whiteKeyBounds.entries()),
    ].some(entry => {
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

  private drawLinear(width: number, height: number): void {
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
        height,
      });
      
      if (currentStep > 0) {
        this._ctx.fillStyle = this.stroke;
        this._ctx.fillRect(x, 0, 1, height);
      }

      const bounds: KeyBounds = {
        x,
        y: 0, 
        width: keyWidth,
        height,
      };

      if (PianoKeys.isBlackKey(currentKey)) {
        this._blackKeyBounds.set(currentKey, bounds);
      } else {
        this._whiteKeyBounds.set(currentKey, bounds);
      }

      currentStep++;
    }
  }

  private drawClassic(width: number, height: number): void {
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
          height: blackKeyHeight,
        });
      } else {
        const x = Math.round(whiteKeyCounter * whiteKeyWidth);

        this._whiteKeyBounds.set(currentKey, {
          x,
          y: 0, 
          width: whiteKeyWidth,
          height,
        });

        whiteKeyCounter++;
      }

      // Draw white keys
      let first = true;

      for (const e of Array.from(this._whiteKeyBounds.entries())) {
        this.drawKey(e[0], e[1]);

        if (first) {
          first = false;
        } else {
          this._ctx.fillStyle = this.stroke;
          this._ctx.fillRect(e[1].x, 0, 1, height);
        }
      }

      // Draw black keys
      for (const e of Array.from(this._blackKeyBounds.entries())) {
        this.drawKey(e[0], e[1]);
      }
    }
  }

  private getStringAttribute(key: string): string {
    return this.hasAttribute(key) ? this.getAttribute(key) : null;
  }

  private getNumberAttribute(key: string): number {
    return this.hasAttribute(key) ? Number(this.getAttribute(key)) : null;
  }
}

const CSS_STYLE = `
:host {
  display: block;
}

.piano-keyboard-canvas {
  width: 100%;
  height: 100%;
}
`;

customElements.define('piano-keys', PianoKeys);