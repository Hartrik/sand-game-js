# Sand Game JS

Sand Game JS is a fast, free and open-source falling-sand game for desktop & mobile browsers.
It allows players to experiment with various elements, such as sand, soil, water and fire.
With grass and trees growing on soil, and other natural processes, it offers a unique experience.

**You can play it here: https://harag.cz/app/sand-game-js**

It is primarily tested on Google Chrome and Google Chrome for Android.
WebGL 2 is utilized for fast rendering.

Sand Game JS is a browser-based successor to [Sand Game 2](https://github.com/Hartrik/Sand-Game-2), which was originally developed in Java (JavaFX) from 2014 to 2016~17.


## Preview

![Sand Game JS preview](https://files.harag.cz/www/app/sand-game-js/preview-with-gui.png)


## Development

Dev build: https://harag.cz/app/sand-game-js?stage=dev (with test tools enabled, sometimes with experimental changes)

Build:

`npm run build` builds the library to `dist`.

`npm run dev` builds the library, then keeps rebuilding it whenever the source files change using rollup-watch.

`npm test` builds the library, then tests it.

Debugging tips:
- Use `alt` + `ctrl` + `shift` + `middle mouse button` to debug an element.
- Stop processing using `ctrl` + `enter` and then press (or hold) `ctrl` + `space` for running one simulation iteration.
    - Alternatively `ctrl` + `shift` + `space` will run the specified number of iterations – at once, without rendering and delays.
- Global variables, accessible from browser console: `sandGame`, `brushes`
