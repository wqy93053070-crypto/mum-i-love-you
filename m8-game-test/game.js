const SIZE = 9;const SIZE = 棋盤資料 */
const board = Array.from({ length: SIZE }, () =>
  Array.from({ length: SIZE }, () => ({ stage: 0 }))
);

const boardEl = document.getElementById("board");
const piecesEl = document.getElementById("pieces");
const scoreEl = document.getElementById("score");

let currentShapes = [];

/* 拖拽狀態 */
let pendingShape = null;
let activeShape = null;
let isDragging = false;
let startX = 0;
let startY = 0;
const DRAG_THRESHOLD = 10;

/* 方塊池 */
const SHAPE_POOL = [
  [[1]],
  [[1,1]],
  [[1,1,1]],
  [[1,1,1,1]],
  [[1],[1]],
  [[1],[1],[1]],
  [[1,1],[1,1]],
  [[1,0],[1,0],[1,1]],
  [[0,1],[0,1],[1,1]],
  [[1,1,1],[0,1,0]],
];

/* =========================
   ✅ 最終關鍵：等待 board 寬度真的出現
========================= */
function ensureBoardSize(attempt = 0) {
  const w = boardEl.offsetWidth;

  if (w > 0) {
    boardEl.style.height = w + "px";
    return;
  }

  // 華為 WebView 有時要等很久
  if (attempt < 20) {
    setTimeout(() => ensureBoardSize(attempt + 1), 100);
  }
}

/* =========================
   渲染棋盤
========================= */
function renderBoard() {
  boardEl.innerHTML = "";
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const c = document.createElement("div");
      c.className = `cell stage-${board[y][x].stage}`;
      c.dataset.x = x;
      c.dataset.y = y;
      boardEl.appendChild(c);
    }
  }
  ensureBoardSize();   // ✅ 每次 render 都保證一次
}

/* =========================
   生成方塊
========================= */
function generatePieces() {
  piecesEl.innerHTML = "";
  currentShapes = [];

  for (let i = 0; i < 3; i++) {
    const shape =
      SHAPE_POOL[Math.floor(Math.random() * SHAPE_POOL.length)];
    currentShapes.push(shape);

    const p = document.createElement("div");
    p.className = "piece";
    p.style.gridTemplateColumns = `repeat(${shape[0].length},1fr)`;

    shape.flat().forEach(v => {
      const pc = document.createElement("div");
      pc.className = "piece-cell";
      if (!v) pc.style.visibility = "hidden";
      p.appendChild(pc);
    });

    p.addEventListener("pointerdown", e => {
      e.preventDefault();
      const idx = [...piecesEl.children].indexOf(p);
      pendingShape = currentShapes[idx];
      activeShape = pendingShape;
      isDragging = false;
      startX = e.clientX;
      startY = e.clientY;
    });

    piecesEl.appendChild(p);
  }
}

/* 拖動 */
window.addEventListener("pointermove", e => {
  if (!activeShape) return;

  const target = document.elementFromPoint(e.clientX, e.clientY);
  if (target && target.classList.contains("cell")) {
    preview(+target.dataset.x, +target.dataset.y);
  }

  if (!isDragging && pendingShape) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
      isDragging = true;
      pendingShape = null;
    }
  }
});

/* 放開 */
window.addEventListener("pointerup", () => {
  isDragging = false;
  pendingShape = null;
  activeShape = null;
  clearPreview();
});

/* 遊戲邏輯 */
function canPlace(shape, x, y) {
  for (let dy = 0; dy < shape.length; dy++)
    for (let dx = 0; dx < shape[0].length; dx++)
      if (shape[dy][dx] &&
          board[y+dy]?.[x+dx]?.stage !== 0)
        return false;
  return true;
}

function preview(x, y) {
  clearPreview();
  if (!canPlace(activeShape, x, y)) return;

  activeShape.forEach((r, dy) =>
    r.forEach((v, dx) => {
      if (!v) return;
      const idx = (y+dy)*SIZE + (x+dx);
      const el = boardEl.children[idx];
      if (el) el.classList.add("preview-ok");
    })
  );
}

function clearPreview() {
  document.querySelectorAll(".preview-ok")
    .forEach(el => el.classList.remove("preview-ok"));
}

/* 初始化 */
scoreEl.innerText = "分数：0";
renderBoard();
generatePieces();
let score = 0;

