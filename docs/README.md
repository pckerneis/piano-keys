# piano-keys

> A canvas based piano keyboard.

**piano-keys** is a lightweight piano keyboard that can be customized and interacted with the mouse.
Check out the [live demo](https://pckerneis.com/piano-keys-demo/).

## Basic usage

Simply insert `piano-keys.js` into your webpage and add a `piano-keys` element to it.
```
<piano-keys></piano-keys>
```

![alt text](https://github.com/pckerneis/piano-keys/raw/master/docs/img/classic.png "piano-keys screenshot")

Further customization can be done using either HTML attributes or the reflected Javascript properties. All the options described on this page come in both flavors :

```
<piano-keys start="0" end="12" layout="linear" mode="slide"></piano-keys>
```
is equivalent to :

```javascript
const pianoKeys = new PianoKeys();
pianoKeys.start = 0;
pianoKeys.end = 12;
pianoKeys.layout = "linear";
pianoKeys.mode = "slide";
domContainer.append(pianoKeys);
```

## Layouts

**piano-keys** comes with two layouts : `classic` and `linear`. While the `classic` layout tries to mimic the classical piano keys layout, the `linear` layout gives the same size to black and white keys. This can make mouse interaction easier.
```
<piano-keys layout="linear"></piano-keys>
```

![alt text](https://github.com/pckerneis/piano-keys/raw/master/docs/img/linear.png "piano-keys with linear layout")

## Range and keys size

A first approach for setting the range of the keyboard is to specify both `start` and `end` attributes which define the first and the last key to be shown. Using this approach, the keys will be resized so that they fit the available space within the component.
```
<piano-keys start="60" end="84"></piano-keys>
```

![alt text](https://github.com/pckerneis/piano-keys/raw/master/docs/img/resize-end.gif "Resize behavior with start/end attributes")

You can only specify a fixed width in pixels for the keys with `fixed`. If `fixed` has a strictly positive value, then the `end` attribute will be ignored and the component will show as many keys as possible within the available space. 
```
<piano-keys start="60" fixed="50"></piano-keys>
```
![alt text](https://github.com/pckerneis/piano-keys/raw/master/docs/img/resize-fixed.gif "Resize behavior with fixed key size")

The key numbers match the standard MIDI note numbers, where `0` is `C-2`. Although MIDI notes range from `0` to `127`, there are no upper limit for the `end` value and the visible range won't be clipped when `fixed` is set.

## Mouse interaction modes

You can choose between these mouse interaction modes :
- `default`: press the mouse to press a key, release the mouse to release the key.
- `slide`: same as default but you can also slide from a note to another with a mouse drag.
- `toggle`: press the mouse to toggle a key.
- `none`: the mouse is simply ignored.

## Customize appearence

Out of the box, **piano-keys** allow you to specify colors for the keys, accordingly to their state (normal, hovered or pressed). The available attributes are :
- `stroke`
- `whiteKey`
- `whiteKeyHover`
- `whiteKeyOn`
- `blackKey`
- `blackKeyHover`
- `blackKeyOn`

These attributes can be either a color, a gradient or a pattern, as defined in the [Canvas API](https://developer.mozilla.org/fr/docs/Web/API/CanvasRenderingContext2D/fillStyle).

```
<piano-keys start="60" end="84" mode="toggle"
  whitekey="#dee8ef" whitekeyhover="#aaccd9" whitekeyon="#ff8080"
  blackkey="#97b6d5" blackkeyhover="#517a99" blackkeyon="#ff8080">
</piano-keys>
```
![alt text](https://github.com/pckerneis/piano-keys/raw/master/docs/img/colors.png "piano-keys with custom colors")

For more control over the look, you can also inherit from `PianoKeys` to run your custom drawing code.

## Accessing the pressed keys

Each key is associated to a key number value. The minimal value `0` corresponds to a `C` note like in the MIDI standard. Unlike MIDI, there is no specified upper bound for the key number values.

The `PianoKeys` objects exposes its state via the following properties:
- `pressedKeys`: an array of pressed key values.
- `hoveredKey`: the value of the key being hovered (or null if there isn't).

## Listening to key events

You can react to key events using standard DOM events. The available events are :
- `keydown`: fired whenever a key is pressed.
- `keyup`: fired whenever a key is released.
- `keychange`: fired whenever the pressed keys change.
- `keyhover`: fired whenever the hovered key changes.

```javascript
  const pianoKeys = document.querySelector('#piano-key');

  pianoKeys.addEventListener('keydown', (event) => {
    console.log("Key pressed", event.keyNumber);
  });

  pianoKeys.addEventListener('keyup', (event) => {
    console.log("Key released", event.keyNumber);
  });

  pianoKeys.addEventListener('keyhover', () => {
    console.log("Mouse is over key", pianoKeys.hoveredKey);
  });

  pianoKeys.addEventListener('keychange', () => {
    console.log("Keys being pressed", pianoKeys.pressedKeys.join(', '));
  });
```
