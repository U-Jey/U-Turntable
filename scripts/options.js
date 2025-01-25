let options = {
    /** The settings customising the alignment of several elements. */
    display: {
        // Revert the display order of the turntable and the details block.
        reverse: false,
        // Sets the vertical alignment of the details block, centered by default. (null | "top" | "bottom")
        detailsAlign: "top"
    },
    /** The Pretzel resources path needed. */
    pretzel: {
        cover: "<relative-path-to-Pretzel-output-files>/cover.jpg",
        nowPlaying: "<relative-path-to-Pretzel-output-files>/now_playing.json"
    },
    /** The delay (ms) between each refresh. */
    syncDelay: 200
};