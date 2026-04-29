(function () {

  const startBtn = document.getElementById("start-btn");
  const speech = document.getElementById("speech");
  const audio = document.getElementById("pig-audio");

  function isNight() {
    const h = new Date().getHours();
    return h >= 19 || h < 5;
  }

  // 初始化对白（夜晚也能玩）
  speech.innerText = isNight()
    ? "夜晚的花园很安静，我们轻轻玩一会儿吧 🌙"
    : "白天好，我们一起慢慢玩吧～";

  startBtn.onclick = () => {
    audio.currentTime = 0;
    audio.play().catch(() => {});

    speech.innerText = isNight()
      ? "夜色很温柔，我们出发吧 🌙"
      : "太好了，我们去花园看看吧 🌸";

    setTimeout(() => {
      window.location.href = "./m8-game-test/";
    }, 400);
  };

})();
``