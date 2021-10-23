import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");
let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumbnail: "thumbnail.jpg",
};

const downloadFile = (fileURL, fileName) => {
  const downloadLink = document.createElement("a");
  downloadLink.href = fileURL;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
};

const handleDownloadRecording = async () => {
  actionBtn.removeEventListener("click", handleDownloadRecording);
  actionBtn.innerText = "Transcoding🔄";
  actionBtn.disabled = true;

  const ffmpeg = createFFmpeg({
    log: true,
    corePath: "/static/ffmpeg-core.js",
  });
  await ffmpeg.load();

  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

  await ffmpeg.run("-i", files.input, "-r", "60", files.output);

  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "0:01",
    "-frames:v",
    "1",
    files.thumbnail
  );

  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbnailFile = ffmpeg.FS("readFile", files.thumbnail);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbnailBlob = new Blob([thumbnailFile.buffer], { type: "image/jpg" });

  const mp4URL = URL.createObjectURL(mp4Blob);
  const thumbnailURL = URL.createObjectURL(thumbnailBlob);

  downloadFile(mp4URL, "Shorts.mp4");
  downloadFile(thumbnailURL, "MyThumbnail.jpg");

  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumbnail);
  URL.revokeObjectURL(mp4URL);
  URL.revokeObjectURL(thumbnailURL);
  URL.revokeObjectURL(videoFile);

  // eslint-disable-next-line no-use-before-define
  actionBtn.addEventListener("click", handleStartRecording);
  actionBtn.innerText = "Recording Again";
  actionBtn.disabled = false;
};

const handleStopRecording = () => {
  actionBtn.innerText = "Download Recording";
  actionBtn.removeEventListener("click", handleStopRecording);
  actionBtn.addEventListener("click", handleDownloadRecording);
  recorder.stop();
};
const handleStartRecording = () => {
  actionBtn.innerText = "Stop Recording";
  actionBtn.removeEventListener("click", handleStartRecording);
  actionBtn.addEventListener("click", handleStopRecording);

  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};
const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 480,
      height: 270,
    },
  });
  video.srcObject = stream;
  video.play();
};
init();
actionBtn.addEventListener("click", handleStartRecording);
