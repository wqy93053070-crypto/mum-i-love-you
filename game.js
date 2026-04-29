document.addEventListener("DOMContentLoaded", () => {document.addEvent  
  const flowerBox = document.getElementById("flower-message");
  const flowerText = document.getElementById("flower-text");
  const runners = document.querySelectorAll(".runner");

  if (!startBtn || !speech || !audio || !mainStage) {
    console.warn("关键 DOM 元素不存在，主頁 game.js 停止执行");
    return;
  }

  function isNight() {
    const h = new Date().getHours();
    return h >= 19 || h < 5;
  }

  speech.innerText = isNight()
    ? "已经很晚了，我们慢慢玩一会儿吧 🌙"
    : "白天好，我们一起慢慢玩吧～";

  startBtn.classList.add("hidden");
  if (flowerBox) flowerBox.classList.add("hidden");

  if (runners.length > 0) {
    setTimeout(() => {
      runners.forEach((runner, i) => {
        runner.classList.add(`r${i + 1}`);
      });
    }, 400);
  }

  setTimeout(() => {
    startBtn.classList.remove("hidden");
    startBtn.classList.add("show");
  }, 2600);

  startBtn.addEventListener("click", () => {

    audio.currentTime = 0;
    audio.play().catch(() => {});

    speech.innerText = isNight()
      ? "夜晚的花园很安静，我们轻轻前进 🌙"
      : "太好了，我们去花园看看吧 🌸";

    mainStage.classList.add("fade-out");

    setTimeout(() => {
      window.location.href = "/mum-i-love-you/m8-game-test/";
    }, 700);
  });

});

  const startBtn = document.getElementById("start-btn");
  const speech = document.getElementById("speech");
  const audio = document.getElementById("pig-audio");
  const mainStage = document.getElementById("main-stage");

