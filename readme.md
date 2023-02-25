# Sand Game JS

Sand Game JS is a falling-sand game where you can play with various elements.
Browser-based successor to [Sand Game 2](https://github.com/Hartrik/Sand-Game-2), which was originally developed in Java (JavaFX).
Sand Game JS can be played using mouse or touch screen.
It was primarily tested on Google Chrome and Google Chrome for Android.

You can play it here: https://harag.cz/app/sand-game-js


## Development

`npm run build` builds the library to `dist`.

`npm run dev` builds the library, then keeps rebuilding it whenever the source files change using rollup-watch.

`npm test` builds the library, then tests it.

Debugging tips:
- Use `alt key` + `middle mouse button` to debug an element.
- Stop processing using `ctrl` + `enter` and then press (or hold) `ctrl` + `space` for running one simulation iteration.
    - Alternatively `ctrl` + `shift` + `space` will run the specified number of iterations – at once, without rendering and delays.
- Global variables, accessible from browser console: `sandGame`, `brushes`
