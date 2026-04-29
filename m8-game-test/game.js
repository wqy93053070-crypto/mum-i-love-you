/* =========================
   基本設定
========================= */
const SIZE = 9;
let score = 0;

/* =========================
   棋盤資料結構
========================= */
const board = Array.from({ length: SIZE }, () =>
  Array.from({ length: SIZE }, () => ({ stage: 0 }))
);

const boardEl = document.getElementById("board");
const piecesEl = document.getElementById("pieces");
const scoreEl = document.getElementById("score");

let currentShapes = [];

/* =========================
   拖拽狀態
========================= */
let pendingShape = null;   // 已按下尚未確認拖拽
let activeShape = null;    // 用來 preview / 放置的 shape
let isDragging = false;

let startX = 0;
let startY = 0;
const DRAG_THRESHOLD = 10;

/* =========================
   形狀池
========================= */
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
  fixBoardHeight(); // ✅ Android / Huawei 保險
}

/* =========================
   修正棋盤高度（Android 必需）
========================= */
function fixBoardHeight() {
  const w = boardEl.offsetWidth;
  boardEl.style.height = w + "px";
}
window.addEventListener("resize", fixBoardHeight);

/* =========================
   生成方塊
========================= */
function generatePieces() {
  piecesEl.innerHTML = "";
  currentShapes = [];

  for (let i = 0; i < 3; i++) {
    const shape = SHAPE_POOL[Math.floor(Math.random() * SHAPE_POOL.length)];
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

/* =========================
   Pointer 移動
========================= */
window.addEventListener("pointermove", e => {
  if (!activeShape) return;

  const target = document.elementFromPoint(e.clientX, e.clientY);
  if (target && target.classList.contains("cell")) {
    preview(+target.dataset.x, +target.dataset.y);
  } else {
    clearPreview();
  }

  if (!isDragging && pendingShape) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.sqrt(dx*dx + dy*dy) >= DRAG_THRESHOLD) {
      isDragging = true;
      pendingShape = null;
    }
  }
});

/* =========================
   Pointer 放開
========================= */
window.addEventListener("pointerup", e => {
  if (!activeShape) {
    clearPreview();
    return;
  }

  if (isDragging) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target && target.classList.contains("cell")) {
      const x = +target.dataset.x;
      const y = +target.dataset.y;
      if (canPlace(activeShape, x, y)) {
        placeShape(activeShape, x, y);
        score += activeShape.flat().filter(v => v === 1).length;
        scoreEl.innerText = "分数：" + score;
        renderBoard();
        generatePieces();
      }
    }
  }

  isDragging = false;
  pendingShape = null;
  activeShape = null;
  clearPreview();
});

/* =========================
   遊戲邏輯
========================= */
function canPlace(shape, x, y) {
  for (let dy = 0; dy < shape.length; dy++)
    for (let dx = 0; dx < shape[0].length; dx++)
      if (shape[dy][dx] && board[y+dy]?.[x+dx]?.stage !== 0)
        return false;
  return true;
}

function placeShape(shape, x, y) {
  shape.forEach((r, dy) =>
    r.forEach((v, dx) => {
      if (v) board[y+dy][x+dx].stage = 1;
    })
  );
}

function preview(x, y) {
  clearPreview();
  if (!canPlace(activeShape, x, y)) return;
  activeShape.forEach((r, dy) =>
    r.forEach((v, dx) => {
      if (!v) return;
      const el = [...boardEl.children]
        .find(c => c.dataset.x == x+dx && c.dataset.y == y+dy);
      if (el) el.classList.add("preview-ok");
    })
  );
}

function clearPreview() {
  document.querySelectorAll(".preview-ok, .preview-bad")
    .forEach(el => el.classList.remove("preview-ok", "preview-bad"));
}

/* =========================
   初始化
========================= */
scoreEl.innerText = "分数：0";
renderBoard();
generatePieces();