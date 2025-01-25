var musicModule = (function () {
    "use strict";

    /** The default options for this module. */
    const OPTIONS = Object.freeze({
        /** The settings customising the alignment of several elements. */
        display: {
            // Revert the display order of the turntable and the details block.
            reverse: false,
            // Sets the vertical alignment of the details block, centered by default. (null|"top"|"bottom")
            detailsAlign: null
        },

        /** The Pretzel resources path needed. */
        pretzel: Object.freeze({
            // The relative path to the output file "Album Cover".
            cover: null,
            // The relative path to the output file "Now Playing JSON Data".
            nowPlaying: null
        }),
        
        /** The delay (ms) between each refresh. */
        syncDelay: 200
    });

    /** The "instance" of this module. */
    let _module = {};

    /** The internal members needed by the module. */
    let _mode = null,
        _options = {},
        _goofyRefreshCounter = 0,
        _trackId = null,
        _animationDiscTimeout = null;

    /** The jQuery instances representing every element of the music player. */
    let $musicPlayer = null,
        $musicTable = null,
        $musicCover = null,
        $musicDetails = null,
        $musicTitle = null,
        $musicArtists = null;

    /** Initializes the jQuery instances. */
    function initMembers() {
        $musicPlayer = $(".music-player");
        $musicTable = $musicPlayer.find(".turntable");
        $musicCover = $musicPlayer.find(".cover img");
        $musicDetails = $musicPlayer.find(".track-details");
        $musicTitle = $musicPlayer.find(".title");
        $musicArtists = $musicPlayer.find(".artists");
    }

    /** Sets the handlers to the managed events of some music player elements. */
    function bindEvents() {
        // It allows us to request another cover if one fails to render.
        $musicCover.off("error").on("error", function () {
            loadCover(true);
        });

        // It shows the element only when the cover is correctly loaded.
        $musicCover.off("load").on("load", function () {
            $musicCover.removeClass("loading");
        });

        // Here, this observer updates the "animation-play-state" of the cover by taking into account the movement of the arm.
        let observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                clearTimeout(_animationDiscTimeout);

                if ($(mutation.target).is(".reading")) {
                    // When the player is reading, we need to wait for the arm.
                    _animationDiscTimeout = setTimeout(function () {
                        $musicCover.parent().css("animation-play-state", "running");
                    }, 400);
                }
                else {
                    $musicCover.parent().css("animation-play-state", "paused");
                }
            });
        });

        // We only want to observe the "class" attribute.
        observer.observe($musicPlayer[0], { attributes: true, attributeFilter: ["class"] });
    }

    /**
     * Loads the cover of the track on the music player.
     * 
     * @param {boolean} skipTimeout Avoid a timeout when set to "true", usefull when called after failing to render a cover.
     */
    function loadCover(skipTimeout) {
        let loadCallback = function () {
            let coverPath = null;

            // At this moment, it only works with Pretzel.
            switch (_mode) {
                case "pretzel":
                default:
                    coverPath = _options.pretzel.cover;
                    break;
            }

            // The GET parameter added at the end is needed to force a new request (otherwise, the cache will return an old cover).
            // It's very hacky, but at least it works...
            $musicCover.attr("src", coverPath + "?refresh" + _goofyRefreshCounter++ + "=1664");
        };

        if (skipTimeout) {
            loadCallback();
        }
        else {
            $musicCover.addClass("loading");
            setTimeout(loadCallback, 200);
        }
    }

    /**
     * Loads the details of the track next to the music player.
     * 
     * @param {object} track The details of the track.
     */
    function loadDetails(track) {
        let loadCallback = function () {
            // Again, quite hacky.
            // I needed to get the max-width of the details block, but it is set to 0 for the transition effect.
            // The turntable does not move, so I get it from there.
            let maxWidth = parseInt($musicTable.css("max-width"));

            // By removing and re-adding the "animated" class 10ms later, we ensure to reset the animation on the text.
            $musicDetails.removeClass("animated");
            setTimeout(function () {
                $musicDetails.addClass("animated");

                $musicTitle.text(track.title);
                $musicArtists.text(track.artists);

                // If both of the title and artists widths are lower than the details max-width, no need the animated display.
                if (parseInt($musicTitle.css("width")) <= maxWidth && parseInt($musicArtists.css("width")) <= maxWidth) {
                    $musicDetails.removeClass("animated");
                }

                // Finally, we can show the updated details.
                $musicPlayer.removeClass("loading");
            }, 10);
        };

        // If a track is already loaded, we need hide the previous details before loading the new ones.
        if (_trackId !== null) {
            $musicPlayer.addClass("loading");
            loadCover();
            setTimeout(loadCallback, 600);
        }
        else {
            // If we're here, it means we're on the first load of the player ; it is already in loading state.
            loadCover(true);
            loadCallback();
        }
    }

    /** Sets the interval that reads and updates the cover and details of the track. */
    function syncMusicPlayer() {
        setInterval(function () {
            // Not called as a callback for now, you got this.
            let syncCallback = function (track) {
                // The most ID-ish thing that came to my mind...
                let newTrackId = track.title + "_" + track.artists;

                // We update the details only when we're on a new track.
                if (newTrackId !== _trackId) {
                    loadDetails(track);
                    _trackId = newTrackId;
                }

                // But we always to update the play state of the turntable.
                if (track.playing) {
                    $musicPlayer.addClass("reading");
                }
                else {
                    $musicPlayer.removeClass("reading");
                }
            };

            // At this moment, it only works with Pretzel.
            switch (_mode) {
                case "pretzel":
                default:
                    $.getJSON(_options.pretzel.nowPlaying, function (json) {
                        let artists = [],
                            track = {
                                title: json.track.title,
                                artists: null,
                                playing: json.player.playing
                            };
                        
                        // We ensure the unicity of each artist on the list.
                        $.each(json.track.artists, function (i, artist) {
                            artist = artist.name.trim();

                            if (artists.indexOf(artist) === -1) {
                                artists.push(artist);
                            }
                        });

                        // Then, we join them in the formatted instance.
                        track.artists = artists.length > 1
                            ? artists.slice(0, -1).join(", ") + " & " + artists.slice(-1)
                            : artists.join(", ");

                        syncCallback(track);
                    });
                    break;
            }
        }, _options.syncDelay);
    }

    /** Renders the turntable by taking into account the available options. */
    function render() {
        if (_options.display.reverse) {
            $musicPlayer.addClass("reverse");
        }

        if (_options.display.detailsAlign) {
            $musicPlayer.addClass("align-" + _options.display.detailsAlign);
        }
    }

    /**
     * Initializes the module with the requested options.
     * 
     * @param {object} options The options needed to synchronize the player.
     */
    _module.init = function (options) {
        initMembers();
        bindEvents();

        if (typeof (options) === "object") {
            if (options.pretzel) {
                _mode = "pretzel";
            }
        }

        // We simply hide the player when the mandatory options are not set.
        if (_mode === null) {
            $musicPlayer.css("display", "none");
            return;
        }

        $.extend(_options, OPTIONS, options);

        render();
        syncMusicPlayer();

        // TODO - Display the details on the left !! (reverse)
    };

    return _module;
})();