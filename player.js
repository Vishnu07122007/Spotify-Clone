document.addEventListener("DOMContentLoaded", () => {
 const playlistItems = document.querySelectorAll(".playlist-item");
 const playPauseButton = document.getElementById("play-pause-button");
 const prevButton = document.getElementById("prev-button");
 const nextButton = document.getElementById("next-button");
 const progressBar = document.getElementById("progress-bar");
 const songTitle = document.getElementById("song-title");
 const artistName = document.getElementById("artist-name");
 const albumArt = document.getElementById("album-art");
 const currentTime = document.getElementById("current-time");
 const duration = document.getElementById("duration");

 let audio = new Audio();
 let currentSongIndex = 0;

 const loadSong = (element) => {
     const src = element.getAttribute("data-src");
     audio.src = src;
     songTitle.textContent = element.textContent.split(" - ")[0];
     artistName.textContent = element.textContent.split(" - ")[1];
     audio.play();
     playPauseButton.textContent = "⏸️";
 };

 playlistItems.forEach((item, index) => {
     item.addEventListener("click", () => {
         currentSongIndex = index;
         loadSong(item);
     });
 });

 playPauseButton.addEventListener("click", () => {
     if (audio.paused) {
         audio.play();
         playPauseButton.textContent = "⏸️";
     } else {
         audio.pause();
         playPauseButton.textContent = "▶️";
     }
 });

 prevButton.addEventListener("click", () => {
     currentSongIndex = (currentSongIndex - 1 + playlistItems.length) % playlistItems.length;
     loadSong(playlistItems[currentSongIndex]);
 });

 nextButton.addEventListener("click", () => {
     currentSongIndex = (currentSongIndex + 1) % playlistItems.length;
     loadSong(playlistItems[currentSongIndex]);
 });

 audio.addEventListener("timeupdate", () => {
     progressBar.value = (audio.currentTime / audio.duration) * 100;
     currentTime.textContent = formatTime(audio.currentTime);
 });

 progressBar.addEventListener("input", () => {
     audio.currentTime = (progressBar.value / 100) * audio.duration;
 });

 const formatTime = (time) => {
     const minutes = Math.floor(time / 60);
     const seconds = Math.floor(time % 60);
     return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
 };

 audio.addEventListener("loadedmetadata", () => {
     duration.textContent = formatTime(audio.duration);
 });
});
