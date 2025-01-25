# U-Turntable
Browser source rendering an **animated turntable** for your stream overlay, currently working with **Pretzel Rocks** _(desktop)_.


## 1. How to install?

A few simple steps to follow:

- **[Download](https://github.com/U-Jey/U-Turntable/archive/refs/heads/main.zip)** all the files of this repository
- **Unzip them** wherever you want
- Create a **browser source** in OBS
- Check the box **local file** and link to the **music.html** one

At this point, the turntable should be visible on your overlay.



## 2. Turntable settings

You **<u>need</u>** to customize the settings listed in the **scripts/options.js** file _(at least, the two options related to **Pretzel**)_.

| Mandatory options | Description |
| --- | --- |
| pretzel.cover | The <u>relative path</u> to the output file "Album Cover". |
| pretzel.nowPlaying | The <u>relative path</u> to the output file "Now Playing JSON Data". |

Here are all the currently available options for the player.

```js
let options = {
    /** The settings customizing the alignment of several elements. */
    display: {
        // Revert the display order of the turntable and the details block.
        reverse: false,
        // Sets the vertical alignment of the details block,
        // centered by default. (null | "top" | "bottom")
        detailsAlign: "top"
    },
    
    /** The Pretzel resources path needed. */
    pretzel: {
        // The relative path to the output file "Album Cover".
        cover: "<relative-path-to-Pretzel-output-files>/cover.jpg",
        // The relative path to the output file "Now Playing JSON Data".
        nowPlaying: "<relative-path-to-Pretzel-output-files>/now_playing.json"
    },

    /** The delay (ms) between each refresh. */
    syncDelay: 200
};
```

Once they're all set, **refresh** your browser source in OBS and you're good to go ! 🎼