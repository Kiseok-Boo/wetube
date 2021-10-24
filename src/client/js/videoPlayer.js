const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const volumeDiv = document.getElementById("volumeDiv");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const timeDiv = document.getElementById("timeDiv");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
// const videoStatus = document.getElementById("videoStatus");
// const videoStatusIcon = videoStatus.querySelector("#videoStatusIcon");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let click = 0;
let clickTimeout = null;
let currentVolume = 0.5;
video.volume = currentVolume;

const handlePlayClick = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};
const handleMuteEnter = () => {
  volumeRange.style.display = "block";
  timeDiv.style.marginLeft = "5px";
};
const handleMuteLeave = () => {
  volumeRange.style.display = "none";
  timeDiv.style.marginLeft = "20px";
};
const handleMuteClick = () => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  volumeRange.value = video.muted ? 0 : currentVolume;
  if (video.muted) {
    muteBtnIcon.classList = "fas fa-volume-mute";
    video.volume = 0;
  } else {
    muteBtnIcon.classList =
      video.volume < 0.5 ? "fas fa-volume-down" : "fas fa-volume-up";
    video.volume = currentVolume;
  }
};
const handleVolumeRangeStyle = () => {
  const volume = video.volume * 100;
  volumeRange.style.background = `linear-gradient(to right, white 0%, white ${volume}%, rgba(255,255,255,0.6) ${volume}%, rgba(255,255,255,0.6) 100%)`;
};
const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtnIcon.classList = "fas fa-volume-down";
  }
  currentVolume = value;
  video.volume = currentVolume;
  if (video.volume === 0) {
    video.muted = true;
    muteBtnIcon.classList = "fas fa-volume-mute";
  }
};
const handleVolumeUpdate = () => {
  if (video.volume === 0) {
    muteBtnIcon.classList = "fas fa-volume-mute";
  } else if (video.volume < 0.5) {
    muteBtnIcon.classList = "fas fa-volume-down";
  } else {
    muteBtnIcon.classList = "fas fa-volume-up";
  }
  handleVolumeRangeStyle();
};
const formatTime = (time1, time2) => {
  const hours = Math.floor(time1 / 3600);
  let minutes = Math.floor(time1 / 60);
  let seconds = Math.floor(time1 % 60);
  if (hours !== 0 && minutes < 10) {
    minutes = `0${minutes}`;
  }
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  if (hours !== 0) {
    // eslint-disable-next-line no-param-reassign
    time2.innerText = `${hours}:${minutes}:${seconds}`;
  } else {
    // eslint-disable-next-line no-param-reassign
    time2.innerText = `${minutes}:${seconds}`;
  }
};
const handleLoadedMetaData = () => {
  formatTime(video.duration, totalTime);
  timeline.max = Math.floor(video.duration);
};
const handleTimeUpdate = () => {
  formatTime(video.currentTime, currentTime);
  timeline.value = video.currentTime;
};
const handleTimelineStyle = () => {
  const time = (video.currentTime / timeline.max) * 100;
  timeline.style.background = `linear-gradient(to right, red 0%, red ${time}%, rgba(255,255,255,0.6) ${time}%, rgba(255,255,255,0.6) 100%)`;
};
const handltTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
  handleTimelineStyle();
};
const handleTimelineEnter = () => {
  timeline.style.overflow = "visible";
  timeline.style.height = "7px";
};
const handleTimelineLeave = () => {
  timeline.style.overflow = "hidden";
  timeline.style.height = "5px";
};
const handleFullScreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand fa-lg";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress fa-lg";
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  if (!video.paused) {
    controlsMovementTimeout = setTimeout(hideControls, 3000);
  }
};
const handleMouseLeave = () => {
  if (!video.paused) {
    controlsTimeout = setTimeout(hideControls, 3000);
  }
};

const handleArrowKeys = (key) => {
  if (key === "ArrowLeft") {
    video.currentTime -= 5;
    handleTimeUpdate();
  } else if (key === "ArrowRight") {
    video.currentTime += 5;
    handleTimeUpdate();
  } else if (key === "ArrowUp") {
    if (video.volume > 0.95) {
      video.volume = 1;
      volumeRange.value = video.volume;
    } else {
      video.volume += 0.05;
      volumeRange.value = video.volume;
    }
    currentVolume = video.volume;
  } else if (key === "ArrowDown") {
    if (video.volume < 0.05) {
      video.volume = 0;
      volumeRange.value = video.volume;
    } else {
      video.volume -= 0.05;
      volumeRange.value = video.volume;
    }
    currentVolume = video.volume;
  }
};

const handleKeyDown = (event) => {
  const { key } = event;
  const fullscreen = document.fullscreenElement;
  if (
    event.target.nodeName !== "INPUT" &&
    event.target.nodeName !== "TEXTAREA"
  ) {
    if (fullscreen && key === "Escape") {
      document.exitFullscreen();
    }
    if (key === " ") {
      handlePlayClick();
    }
    if (key === "f" || key === "F") {
      handleFullScreen();
    }
    if (key === "m" || key === "M") {
      handleMuteClick();
    }
    if (
      key === "ArrowLeft" ||
      key === "ArrowRight" ||
      key === "ArrowUp" ||
      key === "ArrowDown"
    ) {
      handleArrowKeys(key);
    }
  }
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  playBtnIcon.classList = "fas fa-undo-alt";
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
};

const handleVideoClick = () => {
  click += 1;
  if (click !== 2) {
    clickTimeout = setTimeout(() => {
      handlePlayClick();
      click = 0;
    }, 200);
  } else {
    clearTimeout(clickTimeout);
    click = 0;
  }
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("mouseenter", handleMuteEnter);
volumeDiv.addEventListener("mouseleave", handleMuteLeave);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("dblclick", handleFullScreen);
video.addEventListener("click", handleVideoClick);
video.addEventListener("volumechange", handleVolumeUpdate);
video.addEventListener("loadeddata", handleLoadedMetaData);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("timeupdate", handleTimelineStyle);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
timeline.addEventListener("input", handltTimelineChange);
timeline.addEventListener("mouseenter", handleTimelineEnter);
timeline.addEventListener("mouseleave", handleTimelineLeave);
fullScreenBtn.addEventListener("click", handleFullScreen);
window.addEventListener("keydown", handleKeyDown);
video.addEventListener("ended", handleEnded);
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    fullScreenIcon.classList = "fas fa-compress fa-lg";
  } else {
    fullScreenIcon.classList = "fas fa-expand fa-lg";
  }
});
if (video.readyState === 4) {
  handleLoadedMetaData();
}
