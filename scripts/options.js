let options = {
    /** The settings customizing the alignment of several elements. */
    display: {
        // Revert the display order of the turntable and the details block.
        reverse: false,
        // Sets the vertical alignment of the details block, centered by default. (null | "top" | "bottom")
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