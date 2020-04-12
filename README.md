![alt text](https://img.shields.io/github/package-json/v/pckerneis/piano-keys "package version") ![alt text](https://img.shields.io/github/languages/code-size/pckerneis/piano-keys "codebase size")

# piano-keys

> A canvas based piano keyboard.

![alt text](https://github.com/pckerneis/piano-keys/raw/master/docs/img/classic.png "piano-keys screenshot")

**piano-keys** is a lightweight piano keyboard that can be customized and interacted with the mouse. It is based on Custom Elements and Canvas APIs.

- See a [live demo](https://pckerneis.com/piano-keys-demo/)
- See the [usage guide](https://pckerneis.github.io/piano-keys/#/)

## Installation

Clone the repository and install dependencies using
```
yarn install
```

## Usage

From a HTML page, insert `piano-keys.js` into your webpage and add a `piano-keys` element to it.
```
<piano-keys></piano-keys>
```

You can also create a `PianoKeys` and add it to the DOM with Javascript.
```javascript
import { PianoKeys } from './piano-keys.js';

const pianoKeys = new PianoKeys();
document.querySelector('#my-container').append(pianoKeys);
```

You can then customize the appearance and the mouse interaction mode of the keyboard. Check out the [usage guide](https://pckerneis.github.io/piano-keys/#/) for more information.

## Contributing

Feel free to submit contributions.

## Authors

- **Pierre-Clément KERNEIS** - *Initial work*

See also the list of [contributors](https://github.com/pckerneis/piano-keys/contributors) who participated in this project.

## License

This project is licensed under the GNU GPLv3 License - see the [LICENSE.md](LICENSE.md) file for details
