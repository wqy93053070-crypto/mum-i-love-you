/* ===== 基本設定 ===== */
const SIZE = 9;
let score = 0;

const boardEl = document.getElementById("board");
const piecesEl = document.getElementById("pieces");
const scoreEl = document.getElementById("score");

/* 棋盤資料 */
const board = Array.from({ length: SIZE }, () =>
  Array.from({ length: SIZE }, () => ({ stage: 0 }))
);

/* 方塊池 */
const SHAPES = [
  [[1]],
  [[1, 1]],
  [[1, 1, 1]],
  [[1], [1]],
  [[1], [1], [1]],
  [[1, 1], [1, 1]]
];

/* ===== 核心：Android 必須用 JS 設棋盤高度 ===== */
function fixBoardSize() {
  const w = boardEl.clientWidth;
  boardEl.style.height = w + "px";
}

/* ===== 渲染棋盤 ===== */
function renderBoard() {
  boardEl.innerHTML = "";

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const c = document.createElement("div");
      c.className = "cell" + (board[y][x].stage ? " stage-1" : "");
      boardEl.appendChild(c);
    }
  }

  fixBoardSize();
}

/* ===== 生成方塊 ===== */
function renderPieces() {
  piecesEl.innerHTML = "";

  for (let i = 0; i < 3; i++) {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];

    const p = document.createElement("div");
    p.className = "piece";
    p.style.gridTemplateColumns = `repeat(${shape[0].length}, 1fr)`;

    shape.flat().forEach(v => {
      const c = document.createElement("div");
      c.className = "piece-cell";
      if (!v) c.style.visibility = "hidden";
      p.appendChild(c);
    });

    piecesEl.appendChild(p);
  }
}

/* ===== 初始化 ===== */
window.addEventListener("resize", fixBoardSize);

scoreEl.innerText = "分数：0";
renderBoard();
renderPieces();