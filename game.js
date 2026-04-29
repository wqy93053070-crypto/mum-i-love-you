alert("MAIN PAGE GAME.JS LOADED");

document.addEventListener("DOMContentLoaded", () => {

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

  /* 初始化对白 */
  speech.innerText = isNight()
    ? "夜晚的花园很安静，我们轻轻玩一会儿吧 🌙"
    : "白天好，我们一起慢慢玩吧～";

  /* 初始化按钮 */
  startBtn.classList.add("hidden");

  /* 跑动动画（仪式感） */
  if (runners.length > 0) {
    setTimeout(() => {
      runners.forEach((runner, i) => {
        runner.classList.add(`r${i + 1}`);
      });
    }, 400);
  }

  /* 延迟显示开始按钮 */
  setTimeout(() => {
    startBtn.classList.remove("hidden");
    startBtn.classList.add("show");
  }, 2600);

  /* ✅ 点击开始游戏 */
  startBtn.addEventListener("click", () => {

    audio.currentTime = 0;
    audio.play().catch(() => {});

    speech.innerText = isNight()
      ? "夜色很温柔，我们出发吧 🌙"
      : "太好了，我们去花园看看吧 🌸";

    /* 主画面淡出 */
    mainStage.classList.add("fade-out");

    /* ✅ 保留 0.7 秒仪式感后跳转 */
    setTimeout(() => {
      window.location.href = "/mum-i-love-you/m8-game-test/";
    }, 700);
  });

});
