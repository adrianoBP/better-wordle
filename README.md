# better-wordle

Coursework for Web Programming module (M30237) at the University of Portsmouth

`Warning: service to validate words is currently not working!`

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

The base version of the game allows the user to play with a *five letter* word which is *chosen by the server*.  
This limits the user from being able to identify the word of the day by opening the browser developer tools.  
Finally, the application offers statistics to thrive user engagement.

### Different word each day

Once the application is first configured, the first word is selected and will always be the same.

When the server receives a request for the validation of a user's guess, it will first check if the word of the day is stored in memory to minimise the database lookups.  
If the word is not stored in memory, a request will be done to the database to retrieve the word of the day.  
The word is identified by having the value for the `last_picked` column set to today's date.

In case the word is not found, the server will pick a random word from the pool of five-letter words and assign the `last_picked` value to the current date.  
This process ensures the word changes at **12 am UTC**.

Only words that have not been picked or that have been picked more than 365 days ago are in the pool of available words.

### Non discoverable word

Users are not able to see what is the word of the day is nor all the possible words by just opening the browser developer tools.  
Instead, the word submitted is sent to the server, which, after performing the validation, replies with an array.  
Each element in the array contains the correctness of the letter in the word at a specific index:

- '**-1**' that the letter is not present in the word
- '**0**' that the letter is in the wrong position
- '**1**' indicates that the letter is in the correct position

Before the guess is sent to the server for validation, it is first checked to make sure it is a valid English word.
Words that have been checked are saved in memory to minimise the number of API requests.

### Stats

At the end of a game, users are provided with some stats, indicating:

- how many games have been played
- what percentages of games have been won
- how many words were required to guess the word of the day

These stats are saved in the browser's `localStorage` alongside the game settings.
The current day game is stored in a different Local Storage object under the `game-save` key.

Stats are also available for the *multiplayer* game mode and, are also saved in the browser's storage.

### Virtual keyboard

A virtual keyboard is provided to the user to make the game more accessible, especially on mobile devices.  

A regular expression (`/^[a-z]{1,1}$/`) is used to filter out characters that could cause the application to fail.  
This has been put in place to prevent users with a physical keyboard from inserting unsupported characters.

Since the virtual keyboard is being accessed by multiple components across the system, it was deemed appropriate to create a service to handle the keyboard instead of passing the DOM element across multiple components.

## Non-core functionalities

### Random word game mode, parameters & share

It was noticed during the investigation and development phases, that, after guessing the word of the day, users wanted to play the game again.  

To facilitate this, users can play again with a random word, which is selected by the server.  
When the server chooses a word, it will provide the client with an `id` that represents the index of the word in the database.  
When the user tries to guess a word, the ID will also be passed to the server which will be used to verify the word.

Users can also edit the word length (between 4 and 8 letters) as well as specify the word difficulty:

- Level 1, composed of ordinary British and American English words
- Level 2, composed of less common American English words
- Level 3, composed of uncommon British and American English, Names and Acronyms

All words from all levels have been validated against the dictionary of valid English words.

When a new random game is started, the settings are added as URL parameters, allowing the users to send the link to a different user.  
Once the URL is opened, the application will recognize the parameters and start a new random game with the parameters in the URL.

### Word meaning search

It was also noticed during testing and play through that, on higher difficulties, the user does not always know the meaning of a word.  
The default behaviour is to open the browser, open Google and search for the word meaning.

To speed this process up, a "word search" feature has been included to allow the user to search for the meaning of a word.  
This option is available after the game ends by clicking on the bouncing button.  
Once clicked, a new browser page will be opened redirecting the user to Google Search with the word pre compiled.

### Share game result (emoji format)

One of the reasons the original Wordle was so popular, was the ease of sharing, where users were able to copy the result in "emoji format".  
It was deemed appropriate to include this feature in a better Wordle, however, this feature is only available on the desktop version of the game because no suitable ways to implement it on mobile were found:

- `Navigator.clipboard` is only available in secure contexts (localhost or HTTPS)
- `Document.execCommand` is considered deprecated
- `Navigator.share` is only available in secure contexts - deploying a website and adding SSL is out of the scope of this coursework

### Menu

To allow the user to configure the game settings and toggle its feature, a menu panel was added.

The menu can be accessed by clicking the on icon located at the top left corner of the screen.  
Alternatively, if a physical keyboard is attached to the device, by pressing the `Escape` key.

The menu contains a quick guide on **how to play** as well as a list of **settings** that the user can edit:

- **App theme**: Light/dark mode switch (default from device settings with `prefers-color-scheme`)
- **Tile selection**: toggles the highlighting of the cell to be typed into
- **Word validation**: toggles the validation of the correctness of a word as soon as all tiles in the row are filled
- **Haptic feedback**: toggles haptic feedback (only available on mobile devices)
- **Play animations**: toggles any major animations in the application (default from device settings with `prefers-reduced-motion`)
- Custom game properties
  - **Word length**
  - **Word difficulty**
- Game modes
  - **Random word game** (dice icon)
  - **Multiplayer** (controller icon)

Settings are saved in the browser Local Storage.

### Multiplayer

To add competitiveness to the game, a multiplayer feature has been created.  
It allows 2 or more players to play together using the same word settings (length and difficulty)

The game can be shared by copying and pasting the URL.
The URL will contain the following parameters:

- `id` of the word
- `code` indicating the unique game code
- `length` indicating the word length (if different from **5**)

Once the game is started by the user who created the session, all connected users will be able to start typing answers.  
The first user to correctly guess the word will win, and a losing message will be sent to all other users.

At the completion of the game ended, multiplayer stats will be displayed.

### PWA

The game can be installed on the device as it has been made available as a Progressive Web App.  
This offers quicker accessibility instead of having to open the browser every time and search for the game.

Additionally, thanks to the fact that PWA requires a `ServiceWorker`, load times of the app have been reduced as some files are served directly from the service worker cache.

## Endpoints structure

- `/api`
  - `/words`
    - `/by-id` (GET): provides the user with the correct word in case they were not able to guess it.  
    When no ID is provided, the word of the day will be returned.
    - `/verify` (GET): checks if the provided word ID and length match. Used to prevent players from playing with incorrect data
  - `/game`
    - `/validate-guess` (POST): validates the user's guess and returns an array indicating the correctness of a letter at the index.
    - `/random` (GET): returns a new random word ID used when playing with the "Random Game" feature.

## Considerations

### Words

The list of available words is a subset of the words in the 12Dicts Package by Alan Beale:

- Level 1 is a subset of *2of5core*
- Level 2 is a subset of *2of12*
- Level 3 is a subset of *5d+2a*

Words from a lower level are not included in the higher level (e.g. words from Level 1 are not included in Level 2)

### Mobile

Elements that have an `hover` effect have been wrapped with the `@media (hover: hover) {}` media selector to prevent sticky statuses on mobile devices.

Double tap to zoom has been disabled to prevent the page from zooming in and out when typing fast on the keyboard.

### SVG icons

SVG icons were loaded in multiple ways depending on their necessity:

- `<svg>` tag (i.e. [`result.component.html`](client/js/components/game/result/result.component.html)) when the icon is static and only its basic properties need to change (i.e. `fill` CSS property)
- `<img>` tag (i.e. [`index.html`](client/index.html)) when basic transitions need to be applied (e.g. `scale` or `translate`) or when the icon needs to change (by changing the `src` attribute)
- Created in JS (i.e. [`enter.js`](client/js/svg/enter.js)) when the image needs to be added dynamically within a component for better code readability.  
Icons are referenced in an [index file](client/js/svg/index.js) that can be imported into the requiring component.

## Acknowledgments

### Overkill

Many elements of the project could be considered excessive, however, this has been done on purpose as we were advised that this project has to be a testament to our knowledge of Javascript, HTML and CSS.  
Some of the elements that can be considered excessive are:

- Componentisation of the elements, for example, having a keyboard component that itself contains a key component
- Controllers / Services separation: due to the simplicity of the project, it may have not been needed to separate the backend files, however, this has been done to build a solid structure for any future developments.

### Cheating in game

During testing, the only way to cheat that was found was by **manually** calling the `/api/words/by-id` from an API debugging tool.  
However, this would require the user to first acquire the `id` of the word, which can be done by setting breakpoints in the browser developer tools.

This could be prevented by using **CORS** and allowing only a specific domain address (game domain address) to make the API call in question.

For this project, it is not considered a critical issue because the base user is not expected to have the knowledge to achieve this.

## Future works

- **Multiplayer**: thanks to how the application has been structured, should be quite simple to add a co-op mode where two or more players can work together to guess the same word.  
Alternatively, a "battle" mode can be implemented where many users can play on the same sessions and other's players' boards are visible (hidden letters).  
This was not implemented in this version of the application because it is quite hard to insert multiple game boards in the mobile layout.
- **PWA (offline)**: having the application PWA-ready allows a simple implementation of an offline version of the game. This mode could hold a subset of the words on the client to allow the user to keep playing whilst not having internet connectivity.
- **Accounts**: allow users to create accounts and save their progress across devices.

## References

- MDN Web Docs. (2022, February 18). Secure context. <https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts>
- MDN Web Docs. (2022, May 8). Document.execCommand(). <https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand>
- MDN Web Docs. (2022, May 4). Cross-Origin Resource Sharing. <https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS>
- Beale, A. (2016, June 20). The 12dicts Word Lists. Wyrdplay.org. <http://www.wyrdplay.org/12dicts.html>
- SVG Repo - Free SVG Vectors and Icons. (n.d.). <https://www.svgrepo.com>
