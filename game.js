document.addEventListener("DOMContentLoaded", () => {

  const startBtn = document.getElementById("start-btn");
  const speech = document.getElementById("speech");
  const audio = document.getElementById("pig-audio");
  const gameContainer = document.getElementById("game-container");
  const mainStage = document.getElementById("main-stage");

  const flowerBox = document.getElementById("flower-message");
  const flowerText = document.getElementById("flower-text");

  const runners = document.querySelectorAll(".runner");

  // ✅ 防御：关键元素不存在就停
  if (!startBtn || !speech || !audio || !gameContainer || !mainStage) {
    console.warn("关键 DOM 元素不存在，game.js 已停止执行");
    return;
  }

  function isNight() {
    const h = new Date().getHours();
    return h >= 19 || h < 5;
  }

  /* =========================
     初始化陪伴对白
  ========================= */
  speech.innerText = isNight()
    ? "已经很晚了，我们准备休息吧 🌙"
    : "白天好，我们一起慢慢玩吧～";

  /* =========================
     开场：按钮一开始隐藏
  ========================= */
  startBtn.classList.add("hidden");

  if (flowerBox) {
    flowerBox.classList.add("hidden");
  }

  /* =========================
     🏃 跑动动画（仪式感）
     不影响按钮出现
  ========================= */
  if (runners.length > 0) {
    setTimeout(() => {
      runners.forEach((runner, index) => {
        runner.classList.add(`r${index + 1}`);
      });
    }, 400);
  }

  /* =========================
     ✅ 保证按钮一定出现
  ========================= */
  setTimeout(() => {
    startBtn.classList.remove("hidden");

    // 柔和淡入
    setTimeout(() => {
      startBtn.classList.add("show");
    }, 200);

  }, 2600);

  /* =========================
     点击开始游戏
  ========================= */
  startBtn.addEventListener("click", () => {

    // 🔊 音效（必须在点击事件内）
    audio.currentTime = 0;
    audio.play().catch(() => {});

    if (isNight()) {
      speech.innerText = "已经很晚了，我们一起休息吧 🌙";
      return;
    }

    speech.innerText = "太好了，我们去花园看看吧 🌸";

    // 主画面淡出
    mainStage.classList.add("fade-out");

    // 隐藏花语（如果上次还在）
    if (flowerBox) {
      flowerBox.classList.add("hidden");
    }

    // 进入游戏
    setTimeout(() => {
      gameContainer.classList.remove("hidden");
      gameContainer.classList.add("show");
    }, 800);
  });

  /* =========================
     游戏结束 → 回到主画面 + 花语
  ========================= */
  window.addEventListener("message", (e) => {
    if (e.data && e.data.type === "GAME_OVER") {

      const score = e.data.score;

      // 游戏淡出
      gameContainer.classList.remove("show");

      setTimeout(() => {
        gameContainer.classList.add("hidden");

        // 主画面回来
        mainStage.classList.remove("fade-out");

        /* 🌷 根据结果显示花语 */
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

        // 陪伴对白
        speech.innerText = "今天的花园之旅结束了 🌷";

      }, 600);
    }
  });

});