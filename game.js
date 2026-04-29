// ✅ 不用 DOMContentLoaded（Android WebView 安全）
(function () {

  const startBtn = document.getElementById("start-btn");
  const speech = document.getElementById("speech");
  const audio = document.getElementById("pig-audio");
  const mainStage = document.getElementById("main-stage");
  const runners = document.querySelectorAll(".runner");

  if (!startBtn || !speech || !audio || !mainStage) {
    console.warn("主頁 game.js：必要元素不存在");
    return;
  }

  function isNight() {
    const h = new Date().getHours();
    return h >= 19 || h < 5;
  }

  // 初始对白（夜晚也能玩）
  speech.innerText = isNight()
    ? "夜晚的花园很安静，我们轻轻玩一会儿吧 🌙"
    : "白天好，我们一起慢慢玩吧～";

  // ✅ 强制显示按钮（不靠 hidden 动画）
  startBtn.style.display = "block";

  // 跑动动画
  setTimeout(() => {
    runners.forEach((runner, i) => {
      runner.classList.add(`r${i + 1}`);
    });
  }, 400);

  // 点击开始游戏
  startBtn.onclick = () => {

    audio.currentTime = 0;
    audio.play().catch(() => {});

    speech.innerText = isNight()
      ? "夜色很温柔，我们出发吧 🌙"
      : "太好了，我们去花园看看吧 🌸";

    // 淡出主画面
    mainStage.style.opacity = "0";
    mainStage.style.pointerEvents = "none";

    // 跳转到游戏页（Android 最稳）
    setTimeout(() => {
      window.location.href = "/mum-i-love-you/m8-game-test/";
    }, 600);
  };

})();
``