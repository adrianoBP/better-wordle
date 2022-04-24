# better-wordle

Coursework for Web Programming module (M30237) at University of Portsmouth

## Layout

[Figma Prototype](https://www.figma.com/file/u0nTlcMm0l8TFa9kjbFQUP/Untitled?node-id=0%3A1)

## Word conditions

- Word length between 4 and 8 inclusive
- No special characters
- All words converted to lowercase

**Notes**: originally going for different languages ([gwicks.net](http://www.gwicks.net/dictionaries.htm)), but focus on words instead

- Regex: any word containing latin letters and word length between 4 and 8 characters (`/^[a-z]{4,8}$/`)
- Words source: [http://wordlist.aspell.net/12dicts/](http://wordlist.aspell.net/12dicts/)
- Time resets at 12 am UTC

## Considerations

- Dictionaries are saved as normal txt files as we will only read from them and never write

### Classes

<!-- TODO: discuss classes being used -->

## Additional

### Extra features

- Light / dark mode switch
- Play with random word
- Word meaning once complete

### Acknowledgment

#### Overkill

Many elements of the projects are way more complicated of what this kind of project (i.e. components, split all files, validation, etc.), however, since this project has to be a testament of our knowledge of Javascript, HTML and CSS, I believe that it is appropriate to include them.

#### Cheating

Technically speaking, there may be way to cheat the game by changing the game save time, however, having this value is necessary to know when the client should reset the board.
Another possible way to cheat is to manually run the API call to get today's word.

### References

- Icons: all icons used are under CC0 or PD licensing:  
SVG Repo - Free SVG Vectors and Icons. (n.d.). www.svgrepo.com. <https://www.svgrepo.com/>
