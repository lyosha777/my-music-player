const songList = document.getElementById("song-list");
const songCount = document.getElementById("song-count");

const player = document.getElementById("player");

const playerTitle = document.getElementById("player-title");
const playerArtist = document.getElementById("player-artist");

const playButton = document.getElementById("play-button");
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");

const progressBar = document.getElementById("progress-bar");
const progressFilled = document.getElementById("progress-filled");

const currentTimeElement = document.getElementById("current-time");
const durationElement = document.getElementById("duration");

const searchInput = document.getElementById("search-input");
const clearSearchButton = document.getElementById("clear-search");

const refreshButton = document.getElementById("refresh-button");


let songs = [];

let filteredSongs = [];

let currentSongIndex = -1;



// ================================
// LOAD SONGS
// ================================

async function loadSongs() {

    songList.innerHTML = `
        <div class="loading">
            Loading your music...
        </div>
    `;

    try {

        const response = await fetch("/api/songs");

        if (!response.ok) {
            throw new Error("Could not load songs.");
        }

        songs = await response.json();

        filteredSongs = [...songs];

        renderSongs(filteredSongs);

    } catch (error) {

        console.error(error);

        songList.innerHTML = `
            <div class="empty-state">
                Couldn't load your music.
            </div>
        `;

    }
}



// ================================
// DISPLAY SONGS
// ================================

function renderSongs(songArray) {

    songList.innerHTML = "";

    songCount.textContent =
        `${songArray.length} ${songArray.length === 1 ? "song" : "songs"}`;


    if (songArray.length === 0) {

        songList.innerHTML = `
            <div class="empty-state">
                No songs found.
            </div>
        `;

        return;
    }


    songArray.forEach(song => {

        const songItem = document.createElement("div");

        songItem.classList.add("song-item");

        songItem.dataset.songId = song.id;


        songItem.innerHTML = `

            <div class="song-cover">
                ♪
            </div>

            <div class="song-info">

                <div class="song-title">
                    ${escapeHtml(song.title)}
                </div>

                <div class="song-artist">
                    ${escapeHtml(song.artist)}
                </div>

            </div>

            <button class="song-options">
                ⋯
            </button>

        `;


        songItem.addEventListener("click", event => {

            if (event.target.classList.contains("song-options")) {
                return;
            }

            playSong(song);

        });


        songList.appendChild(songItem);

    });


    updateActiveSong();
}



// ================================
// PLAY SONG
// ================================

function playSong(song) {

    currentSongIndex =
        songs.findIndex(item => item.id === song.id);


    player.src =
        `/api/songs/${song.id}/stream`;


    playerTitle.textContent =
        song.title;


    playerArtist.textContent =
        song.artist;


    player.play()
        .catch(error => {
            console.error("Playback failed:", error);
        });


    updateActiveSong();
}



// ================================
// PLAY / PAUSE
// ================================

playButton.addEventListener("click", () => {

    if (!player.src) {

        if (songs.length > 0) {
            playSong(songs[0]);
        }

        return;
    }


    if (player.paused) {

        player.play();

    } else {

        player.pause();

    }

});


player.addEventListener("play", () => {

    playButton.textContent = "❚❚";

});


player.addEventListener("pause", () => {

    playButton.textContent = "▶";

});



// ================================
// NEXT SONG
// ================================

nextButton.addEventListener("click", () => {

    if (songs.length === 0) {
        return;
    }


    if (currentSongIndex === -1) {

        currentSongIndex = 0;

    } else {

        currentSongIndex++;

    }


    if (currentSongIndex >= songs.length) {

        currentSongIndex = 0;

    }


    playSong(songs[currentSongIndex]);

});



// ================================
// PREVIOUS SONG
// ================================

previousButton.addEventListener("click", () => {

    if (songs.length === 0) {
        return;
    }


    if (currentSongIndex === -1) {

        currentSongIndex = 0;

    } else {

        currentSongIndex--;

    }


    if (currentSongIndex < 0) {

        currentSongIndex =
            songs.length - 1;

    }


    playSong(songs[currentSongIndex]);

});



// ================================
// AUTO NEXT
// ================================

player.addEventListener("ended", () => {

    nextButton.click();

});



// ================================
// PROGRESS BAR
// ================================

player.addEventListener("timeupdate", () => {

    if (!player.duration) {
        return;
    }


    const percentage =
        (player.currentTime / player.duration) * 100;


    progressFilled.style.width =
        `${percentage}%`;


    currentTimeElement.textContent =
        formatTime(player.currentTime);


    durationElement.textContent =
        formatTime(player.duration);

});


player.addEventListener("loadedmetadata", () => {

    durationElement.textContent =
        formatTime(player.duration);

});



progressBar.addEventListener("click", event => {

    if (!player.duration) {
        return;
    }


    const rect =
        progressBar.getBoundingClientRect();


    const clickPosition =
        event.clientX - rect.left;


    const percentage =
        clickPosition / rect.width;


    player.currentTime =
        percentage * player.duration;

});



// ================================
// SEARCH
// ================================

searchInput.addEventListener("input", () => {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    clearSearchButton.classList.toggle(
        "hidden",
        search.length === 0
    );


    filteredSongs = songs.filter(song => {

        const title =
            song.title?.toLowerCase() || "";


        const artist =
            song.artist?.toLowerCase() || "";


        const album =
            song.album?.toLowerCase() || "";


        return (
            title.includes(search) ||
            artist.includes(search) ||
            album.includes(search)
        );

    });


    renderSongs(filteredSongs);

});



clearSearchButton.addEventListener("click", () => {

    searchInput.value = "";

    clearSearchButton.classList.add("hidden");

    filteredSongs = [...songs];

    renderSongs(filteredSongs);

});



// ================================
// REFRESH
// ================================

refreshButton.addEventListener("click", async () => {

    refreshButton.style.transform =
        "rotate(180deg)";


    await loadSongs();


    setTimeout(() => {

        refreshButton.style.transform =
            "rotate(0deg)";

    }, 250);

});



// ================================
// ACTIVE SONG HIGHLIGHT
// ================================

function updateActiveSong() {

    document
        .querySelectorAll(".song-item")
        .forEach(item => {

            item.classList.remove("active");

        });


    if (currentSongIndex === -1) {
        return;
    }


    const currentSong =
        songs[currentSongIndex];


    const element =
        document.querySelector(
            `[data-song-id="${currentSong.id}"]`
        );


    if (element) {

        element.classList.add("active");

    }

}



// ================================
// TIME FORMATTER
// ================================

function formatTime(seconds) {

    if (
        !seconds ||
        Number.isNaN(seconds)
    ) {

        return "0:00";

    }


    const minutes =
        Math.floor(seconds / 60);


    const remainingSeconds =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");


    return `${minutes}:${remainingSeconds}`;
}



// ================================
// BASIC HTML SAFETY
// ================================

function escapeHtml(value) {

    if (!value) {
        return "";
    }


    const div =
        document.createElement("div");


    div.textContent =
        value;


    return div.innerHTML;
}



// ================================
// START APP
// ================================

loadSongs();