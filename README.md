# better-wordle

Coursework for Web Programming module (M30237) at University of Portsmouth

## Install and run

```sh
npm install
npm run setup
npm start
```

## Core functionalities

### Basic five-letter game

- Underline
- Red word on fail

### Different word each day

- Resets at 12am UTC
- Selected randomly (how?)

### Non discoverable word

> See [cheating](#cheating)

### Stats

### Keyboard

Since we have multiple components using and talking to the keyboard, a keyboard service was created to be injected in the components.

## Non-core functionalities

### Play with random word

### Word meaning search

### Share game result (emoji format)

**Mobile only:**

- `Navigator.clipboard()` is not available in mobile devices.
- `Document.execCommand()` is deprecated.
- `Navigator.share` only available through HTTPS (out of scope for this project)

### Settings / Menu

- Edit app settings
- Open using Escape key

- How to play

- Light/dark mode switch
- Tile selection
- Validate word
- Haptic feedback (mobile only)
- Custom game
  - Word length
  - Word difficulty
- Game modes
  - Icons

### Multiplayer

- `uuid` package
- Current settings (difficulty & word length)

### PWA

### Share game

When playing with random words (i.e. not today's word), the URL gets updated with an `id` that identifies the word.
Users can copy and share the URL with other users to see how many attempts it takes them.  
By default, the URL will not specify the word length, allowing a minimalist approach; however, if the word length is different from the default (5), it will be specified in the URL parameters.

## Considerations

### Words

**Notes**: originally going for different languages ([gwicks.net](http://www.gwicks.net/dictionaries.htm)), but focus on words instead

- Regex: any word containing latin letters and word length between 4 and 8 characters (`/^[a-z]{4,8}$/`)
- Words source: [http://wordlist.aspell.net/12dicts/](http://wordlist.aspell.net/12dicts/)
  - easy (from 2of5core): easy (British and American English, ordinary words)
  - medium (from 2of12): medium (American English, less common words)
  - hard (from 5d+2a): hard (British and American English, uncommon words, Names, Acronyms)
- Words from one level are not included in the higher difficulty level

### Classes

<!-- TODO: discuss classes being used -->

### Mobile

- Elements that had an `hover` effect have been wrapped with `@media (hover: hover) {}` media selector to prevent sticky statuses on mobile.

### SVG icons

SVGs are loaded in three different ways:

- `<svg>` tag (i.e. [`result.component.html`](client/js/components/game/result/result.component.html))  
This is done when the icon is static and does not need to change
- `<img>` tag (i.e. [`index.html`](client/index.html))  
This is done when basic transitions need to be applied (e.g. `scale` or `translate`) or when the icon needs to change (done by swapping the `src` attribute)
- Created in JS (i.e. [`enter.js`](client/js/svg/enter.js))  
This is done when the image needs to be added dynamically within a component for better code readability. All these images are referenced by an [index file](client/js/svg/index.js) that can be imported.

## Acknowledgments

### Overkill

Many elements of the projects are way more complicated of what this kind of project (i.e. components, split all files, validation, etc.), however, since this project has to be a testament of our knowledge of Javascript, HTML and CSS, I believe that it is appropriate to include them.

### Cheating

Cheating by checking the word has been reduced to the minium.
During testing, the only way to cheat that was found was by manually calling the `words/by-code` endpoint that is needed to provide the word to the user in case they cannot find the correct word. However, this would require the user to first acquire the `code` of the word, which can be done by setting breakpoints in the browser developer tools.

## References

- Icons: all icons used are under CC0 or PD licensing:  
SVG Repo - Free SVG Vectors and Icons. (n.d.). www.svgrepo.com. <https://www.svgrepo.com/>
