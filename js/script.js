let currentsong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songul = document.querySelector(".songList ul");
  songul.innerHTML = "";
  for (const song of songs) {
    songul.innerHTML += `
      <li>
        <img class="invert" src="img/music.svg">
        <div class="info">
          <div>${decodeURIComponent(song).replaceAll("/", "")}</div>
          <div>siddu</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="img/play.svg">
        </div>
      </li>`;
  }

  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", () => {
      const clickedSongName = e.querySelector(".info").firstElementChild.innerHTML.trim();
      const encodedTrack = songs.find(song => decodeURIComponent(song) === clickedSongName);
      if (encodedTrack) {
        playmusic(encodedTrack);
      }
    });
  });
}

const playmusic = (track, pause = false) => {
  currentsong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURIComponent(track.replaceAll("/", ""));
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayalbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer");

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      try {
        let a = await fetch(`/songs/${folder}/info.json`);
        let response = await a.json();
        cardcontainer.innerHTML += `
          <div data-folder="${folder}" class="card">
            <div class="play-circle">
              <img id="playbtn" src="img/play.svg" alt="Play Icon">
            </div>
            <img src="/songs/${folder}/cover (1).jpg" />
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`;
      } catch (err) {
        console.error(`Error loading album info for ${folder}`, err);
      }
    }
  }

  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      playmusic(songs[0]);
    });
  });
}

async function main() {
  await getsongs("songs/cs");
  playmusic(songs[0], true);
  displayalbums();

  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "img/pause.svg";
    } else {
      currentsong.pause();
      play.src = "img/play.svg";
    }
  });

  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML =
      `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;
    document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  previous.addEventListener("click", () => {
    currentsong.pause();
    let currentFile = decodeURIComponent(currentsong.src.split("/").pop());
    let index = songs.findIndex(song => decodeURIComponent(song) === currentFile);
    if (index > 0) {
      playmusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    currentsong.pause();
    let currentFile = decodeURIComponent(currentsong.src.split("/").pop());
    let index = songs.findIndex(song => decodeURIComponent(song) === currentFile);
    if (index < songs.length - 1) {
      playmusic(songs[index + 1]);
    }
  });

  document.querySelector(".range input").addEventListener("change", (e) => {
    console.log("setting volume to", e.target.value);
    currentsong.volume = parseInt(e.target.value) / 100;
  });

  // Mute / unmute volume
  document.querySelector(".volume img").addEventListener("click", e => {
    if (e.target.src.includes("volume-high-stroke-rounded.svg")) {
      e.target.src = e.target.src.replace("volume-high-stroke-rounded.svg", "mute.svg");
      currentsong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume-high-stroke-rounded.svg");
      currentsong.volume = 0.5;
      document.querySelector(".range input").value = 50;
    }
  });
}

main();


