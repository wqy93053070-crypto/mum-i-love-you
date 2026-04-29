document.addEventListener("DOMContentLoaded", () => {

  const startBtn = document.getElementById("start-btn");
  const speech = document.getElementById("speech");
  const audio = document.getElementById("pig-audio");
  const gameContainer = document.getElementById("game-container");
  const mainStage = document.getElementById("main-stage");

  const flowerBox = document.getElementById("flower-message");
  const flowerText = document.getElementById("flower-text");

  const runners = document.querySelectorAll(".runner");

  if (!startBtn || !speech || !audio || !gameContainer || !mainStage) {
    console.warn("关键 DOM 元素不存在，主頁 game.js 停止执行");
    return;
  }

  function isNight() {
    const h = new Date().getHours();
    return h >= 19 || h < 5;
  }

  /* 初始化陪伴对白 */
  speech.innerText = isNight()
    ? "已经很晚了，我们准备休息吧 🌙"
    : "白天好，我们一起慢慢玩吧～";

  /* 开场状态 */
  startBtn.classList.add("hidden");
  if (flowerBox) flowerBox.classList.add("hidden");

  /* 跑动动画（仪式感） */
  if (runners.length > 0) {
    setTimeout(() => {
      runners.forEach((runner, i) => {
        runner.classList.add(`r${i + 1}`);
      });
    }, 400);
  }

  /* 确保按钮出现 */
  setTimeout(() => {
    startBtn.classList.remove("hidden");
    setTimeout(() => {
      startBtn.classList.add("show");
    }, 200);
  }, 2600);

  /* 点击开始游戏 */
  startBtn.addEventListener("click", () => {

    audio.currentTime = 0;
    audio.play().catch(() => {});

    if (isNight()) {
      speech.innerText = "已经很晚了，我们一起休息吧 🌙";
      return;
    }

    speech.innerText = "太好了，我们去花园看看吧 🌸";

    mainStage.classList.add("fade-out");
    if (flowerBox) flowerBox.classList.add("hidden");

    /* ✅ 唯一的游戏入口 */
    setTimeout(() => {
      gameContainer.classList.remove("hidden");
      gameContainer.classList.add("show");
    }, 800);
  });

  /* 接收 M8 游戏结束信息 */
  window.addEventListener("message", (e) => {
    if (e.data && e.data.type === "GAME_OVER") {

      const score = e.data.score;

      gameContainer.classList.remove("show");

      setTimeout(() => {
        gameContainer.classList.add("hidden");
        mainStage.classList.remove("fade-out");

        if (flowerBox && flowerText) {
          let message = "慢慢来，你已经很努力了 🌸";

          if (typeof score === "number") {
            if (score >= 100) {
              message = "你今天的表现很耀眼，像盛开的花一样。";
            } else if (score >= 50) {
              message = "每一步都算数，小小的坚持也会开花。";
            } else {
              message = "种子已经埋下，花会在合适的时候出现 🌱";
            }
          }

          flowerText.innerText = message;
          flowerBox.classList.remove("hidden");
        }

        speech.innerText = "今天的花园之旅结束了 🌷";
      }, 600);
    }
  });

});
