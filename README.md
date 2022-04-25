# better-wordle

Coursework for Web Programming module (M30237) at University of Portsmouth

## Layout

[Figma Prototype](https://www.figma.com/file/u0nTlcMm0l8TFa9kjbFQUP/Untitled?node-id=0%3A1)

## Core functionalities

### Basic five-letter game

- Underline
- Red word on fail

### Different word each day

- Resets at 12am UTC
- Selected randomly (how?)

### Non discoverable word

> See [cheating](#cheating)

### Statistics

### Keyboard

## Non-core functionalities

### Light / dark mode switch

### Play with random word

### Word meaning search

### Validate word on completion

### Settings

### Share game

When playing with random words (i.e. not today's word), the URL gets updated with a `hash` code that identifies the word.
Users can copy and share the URL with other users to see how many attempts it takes them. The `hash` of a word is a base64 representation of the row index in the database.  
By default, the URL will not specify the word length, allowing a minimalist approach; however, if the word length is different from the default (5), it will be specified in the URL parameters.

## Considerations

### Words

**Notes**: originally going for different languages ([gwicks.net](http://www.gwicks.net/dictionaries.htm)), but focus on words instead

- Regex: any word containing latin letters and word length between 4 and 8 characters (`/^[a-z]{4,8}$/`)
- Words source: [http://wordlist.aspell.net/12dicts/](http://wordlist.aspell.net/12dicts/)
- Time resets at 12 am UTC

### Classes

<!-- TODO: discuss classes being used -->

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
During testing, the only way to cheat that was found was by manually calling the `words/by-hash` endpoint that is needed to provide the word to the user in case they cannot find the correct word. However, this would require the user to first acquire the `hash` of the word, which can be done by setting breakpoints in the browser developer tools.

## References

- Icons: all icons used are under CC0 or PD licensing:  
SVG Repo - Free SVG Vectors and Icons. (n.d.). www.svgrepo.com. <https://www.svgrepo.com/>
