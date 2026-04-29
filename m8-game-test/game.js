const SIZE = 9;
let score = 0;

const board = Array.from({ length: SIZE }, () =>
  Array.from({ length: SIZE }, () => ({ stage: 0 }))
);

const boardEl = document.getElementById("board");
const piecesEl = document.getElementById("pieces");
const scoreEl = document.getElementById("score");

let currentShapes = [];

// === 拖拽状态机 ===
let pendingShape = null;   // 已按下但未拖
let activeShape = null;    // 正在拖拽
let isDragging = false;
let startX = 0;
let startY = 0;

const DRAG_THRESHOLD = 10; // ✅ 手指移动 ≥ 10px 才算拖

// === 形状池 ===
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

/* ===================
   渲染棋盘
=================== */
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
}

/* ===================
   生成 3 个方块
=================== */
function generatePieces() {
  piecesEl.innerHTML = "";
  currentShapes = [];

  for (let i = 0; i < 3; i++) {
    const shape =
      SHAPE_POOL[Math.floor(Math.random() * SHAPE_POOL.length)];
    currentShapes.push(shape);

    const p = document.createElement("div");
    p.className = "piece";
    p.style.gridTemplateColumns =
      `repeat(${shape[0].length},1fr)`;

    shape.flat().forEach(v => {
      const c = document.createElement("div");
      c.className = "piece-cell";
      if (!v) c.style.visibility = "hidden";
      p.appendChild(c);
    });

    // ✅ Pointer按下（只登记，不算拖）
    p.addEventListener("pointerdown", e => {
      e.preventDefault();
      const idx = [...piecesEl.children].indexOf(p);
      pendingShape = currentShapes[idx];
      startX = e.clientX;
      startY = e.clientY;
      isDragging = false;
    });

    piecesEl.appendChild(p);
  }
}

/* ===================
   Pointer移动
=================== */
window.addEventListener("pointermove", e => {
  if (!pendingShape && !activeShape) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  const dist = Math.sqrt(dx*dx + dy*dy);

  // ✅ 尚未进入拖拽，检查是否超过门槛
  if (!isDragging) {
    if (dist < DRAG_THRESHOLD) return;

    // ✅ 真正开始拖
    activeShape = pendingShape;
    pendingShape = null;
    isDragging = true;
  }

  const target = document.elementFromPoint(e.clientX, e.clientY);
  if (target && target.classList.contains("cell")) {
    preview(+target.dataset.x, +target.dataset.y);
  }
});

/* ===================
   Pointer放开
=================== */
window.addEventListener("pointerup", e => {
  if (!isDragging || !activeShape) {
    pendingShape = null;
    return;
  }

  const target = document.elementFromPoint(e.clientX, e.clientY);
  if (target && target.classList.contains("cell")) {
    const x = +target.dataset.x;
    const y = +target.dataset.y;

    if (canPlace(activeShape, x, y)) {
      placeShape(activeShape, x, y);

      const placed =
        activeShape.flat().filter(v => v === 1).length;
      score += placed;

      scoreEl.innerText = "分数：" + score;
      renderBoard();
      generatePieces();
    }
  }

  isDragging = false;
  activeShape = null;
  pendingShape = null;
  clearPreview();
});

/* ===================
   游戏逻辑
=================== */
function canPlace(shape, x, y) {
  for (let dy = 0; dy < shape.length; dy++)
    for (let dx = 0; dx < shape[0].length; dx++)
      if (shape[dy][dx] &&
          board[y+dy]?.[x+dx]?.stage !== 0)
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
        .find(c =>
          c.dataset.x == x+dx &&
          c.dataset.y == y+dy
        );
      if (el) el.classList.add("preview-ok");
    })
  );
}

function clearPreview() {
  document.querySelectorAll(".preview-ok")
    .forEach(el => el.classList.remove("preview-ok"));
}

/* ===================
   初始化
=================== */
scoreEl.innerText = "分数：0";
renderBoard();
generatePieces();