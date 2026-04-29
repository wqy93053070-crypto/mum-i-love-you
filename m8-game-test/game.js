const SIZE = 9;
  Array.from({ length: SIZE }, () => ({ stage: 0 }))let score = 0;
);

const boardEl = document.getElementById("board");
const piecesEl = document.getElementById("pieces");
const scoreEl = document.getElementById("score");

let currentShapes = [];

// ===== 拖拽状态 =====
let pendingShape = null;   // 已按下但未确认拖拽
let activeShape = null;    // 当前用于预览/放置的 shape
let isDragging = false;

let startX = 0;
let startY = 0;

const DRAG_THRESHOLD = 10; // ✅ 超过这个距离才允许放置

// ===== 形状池 =====
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
   生成方块
=================== */
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
      const c = document.createElement("div");
      c.className = "piece-cell";
      if (!v) c.style.visibility = "hidden";
      p.appendChild(c);
    });

    p.addEventListener("pointerdown", e => {
      e.preventDefault();
      const idx = [...piecesEl.children].indexOf(p);

      pendingShape = currentShapes[idx];
      activeShape = pendingShape; // ✅ 先用于 preview
      isDragging = false;

      startX = e.clientX;
      startY = e.clientY;
    });

    piecesEl.appendChild(p);
  }
}

/* ===================
   Pointer 移动
=================== */
window.addEventListener("pointermove", e => {
  if (!activeShape) return;

  // ✅ 不管有没有超过门槛，都先显示落点影子
  const target = document.elementFromPoint(e.clientX, e.clientY);
  if (target && target.classList.contains("cell")) {
    preview(+target.dataset.x, +target.dataset.y);
  } else {
    clearPreview();
  }

  // ✅ 再判断是否真正进入拖拽状态（决定是否能放）
  if (!isDragging && pendingShape) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist >= DRAG_THRESHOLD) {
      isDragging = true;
      pendingShape = null;
    }
  }
});

/* ===================
   Pointer 放开
=================== */
window.addEventListener("pointerup", e => {
  if (!activeShape) {
    clearPreview();
    return;
  }

  // ✅ 只有真正拖拽后才允许放置
  if (isDragging) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target && target.classList.contains("cell")) {
      const x = +target.dataset.x;
      const y = +target.dataset.y;

      if (canPlace(activeShape, x, y)) {
        placeShape(activeShape, x, y);

        const placed = activeShape.flat().filter(v => v === 1).length;
        score += placed;

        scoreEl.innerText = "分数：" + score;
        renderBoard();
        generatePieces();
      }
    }
  }

  // ✅ 收尾
  isDragging = false;
  pendingShape = null;
  activeShape = null;
  clearPreview();
});

/* ===================
   游戏逻辑
=================== */
function canPlace(shape, x, y) {
  for (let dy = 0; dy < shape.length; dy++)
    for (let dx = 0; dx < shape[0].length; dx++)
      if (shape[dy][dx] && board[y + dy]?.[x + dx]?.stage !== 0)
        return false;
  return true;
}

function placeShape(shape, x, y) {
  shape.forEach((r, dy) =>
    r.forEach((v, dx) => {
      if (v) board[y + dy][x + dx].stage = 1;
    })
  );
}

function preview(x, y) {
  clearPreview();
  if (!activeShape) return;

  if (!canPlace(activeShape, x, y)) return;

  activeShape.forEach((r, dy) =>
    r.forEach((v, dx) => {
      if (!v) return;
      const el = [...boardEl.children].find(
        c => c.dataset.x == x + dx && c.dataset.y == y + dy
      );
      if (el) el.classList.add("preview-ok");
    })
  );
}

function clearPreview() {
  document
    .querySelectorAll(".preview-ok, .preview-bad")
    .forEach(el => el.classList.remove("preview-ok", "preview-bad"));
}

/* ===================
   初始化
=================== */
scoreEl.innerText = "分数：0";
renderBoard();
generatePieces();

const board = Array.from({ length: SIZE }, () =>
