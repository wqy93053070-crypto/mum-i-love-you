const btn = document.getElementById("start-btn");
const audio = document.getElementById("pig-audio");

btn.onclick = () => {
  audio.currentTime = 0;
  audio.play().catch(()=>{});
  window.location.href = "./m8-game-test/";
};
