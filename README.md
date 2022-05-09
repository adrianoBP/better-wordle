# better-wordle

Coursework for Web Programming module (M30237) at University of Portsmouth

## Installation

```sh
npm install
npm run setup
```

## Execution

For the release version:

```sh
npm start
```

For the test version (includes reload on save):

```sh
npm run dev
```

## Core functionalities

The base version of the game allows the user to play with a five letter word.  
The word is chosen by the server, limiting the user from being able to identify the word of the day by opening the browser developer tools and see the answer.  
Finally, the application offers statistics to thrive user engagement.

### Different word each day

The word of the day is selected by the server. Once the application is first configured, the first word is manually selected and will always be the same.  

When the server receives a request for the validation of an user's guess, it will first check if the day word is stored in memory to minimise the database lookups.  
If the word is not stored in the memory, then a request will be done to the database to retrieve today's word, identified by having the value for the `last_picked` column set to today's date.

In case the word is not found, the server will pick a random word from the pool of five-letter words and assign the `last_picked` value to the current date.  
When picking the random word, the database service will not pick a word which has been picked in the past 365 days.

This process ensures the word to changes at 12 am UTC.

### Non discoverable word

Users are not able to see what is the word of the day nor all the possible words by just opening the browser developer tools.  
Instead, the word submitted by the user is sent to the server, which, after performing the validation, replies with a simple array.  
Each element in the array contains the correctness of the letter in the word at a specific index:

- '**-1**' that the letter is not present in the word
- '**0**' that the letter is in the wrong position
- '**1**' indicates that the letter is in the correct position

### Stats

At the end of a game, users are provided with their progress on the game, indicating:

- how many games have been played
- what percentages of games have been won
- how many words the user had to use to guess the word

This statistics are also available for the multiplayer game mode and, alongside the single player stats, are saved in the browser storage.

### Virtual keyboard

A virtual keyboard is provided to the user to make the game more accessible, but more importantly it prevents the user on mobile devices from trying to insert unwanted characters.  
To prevent users with keyboard from inserting unsupported characters, a regular expression (`/^[a-z]{1,1}$/`) is used to filter out characters that could cause the application to fail.

Due to the fact that the virtual keyboard is being accessed by multiple components across the application, it was deemed appropriate to create a service to handle the keyboard instead of passing the DOM element.

## Non-core functionalities

### Play with random word

It was noticed during the investigation and development phase, that, after guessing the word of the day, users want to play the game again.  

To facilitate this, users can play again with a random word, which is selected by the server.  
When the server choses a word, it will pass the word `id` to the client; the word id represents the index of the word in the database.  
When the user submits a word whilst playing a random game, the word id will also be passed to the server which will be used to verify the word.

Users can also edit the word length (between 4 and 8 letters) as well as specify the word difficulty:

- Level 1, composed by ordinary British and American English words
- Level 2, composed by less common American English words
- Level 3, composed by uncommon British and American English, Names and Acronyms

When a new random game is started, the settings are added as URL parameters, allowing the users to send the link to a friend or colleague.  
Once the URL is opened, the application will recognize the parameters and start a new random game with the parameters in the URL.

### Word meaning search

### Share game result (emoji format)

**Mobile only:**

- `Navigator.clipboard()` is not available in mobile devices.
- `Document.execCommand()` is deprecated.
- `Navigator.share` only available through HTTPS (out of scope for this project)

### Menu

The menu can be opened by clicking on the icon on the top right corner, or, if a keyboard is attached to the device, using the `Escape` key.
It contains a quick guide on **how to play** as well as list of **settings** that the user can edit:

- Light/dark mode switch (default on system theme)
- Tile selection
- Validate word
- Haptic feedback (mobile only)
- Custom properties
  - Word length
  - Word difficulty
- Game modes
  - Random word
  - Multiplayer

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
