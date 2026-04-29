const SIZE = 9;

/* =========================
   分数与 DOM
========================= */
let score = 0;
const scoreEl = document.getElementById("score");

/* =========================
   棋盘数据
========================= */
const board = Array.from({ length: SIZE }, () =>
  Array.from({ length: SIZE }, () => ({ stage: 0 }))
);

const boardEl = document.getElementById("board");
const piecesEl = document.getElementById("pieces");

/* =========================
   拖拽状态
========================= */
let draggedShape = null;
let currentShapes = [];

/* =========================
   形状库
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
   渲染棋盘
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
}

/* =========================
   生成 3 个形状
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
    p.draggable = true;
    p.style.gridTemplateColumns =
      `repeat(${shape[0].length},1fr)`;

    shape.forEach(row =>
      row.forEach(v => {
        const c = document.createElement("div");
        c.className = "piece-cell";
        if (!v) c.style.visibility = "hidden";
        p.appendChild(c);
      })
    );

    p.addEventListener("dragstart", () => {
      draggedShape = shape;
    });

    p.addEventListener("dragend", clearPreview);

    piecesEl.appendChild(p);
  }

  if (isGameOver()) {
    endGame();
  }
}

/* =========================
   拖拽：预览
========================= */
boardEl.addEventListener("dragover", e => {
  e.preventDefault();
  if (!draggedShape) return;

  const cell = e.target;
  if (!cell.classList.contains("cell")) return;

  preview(Number(cell.dataset.x), Number(cell.dataset.y));
});

/* =========================
   拖拽：放置
========================= */
boardEl.addEventListener("drop", e => {
  e.preventDefault();
  if (!draggedShape) return;

  const cell = e.target;
  if (!cell.classList.contains("cell")) return;

  const x = Number(cell.dataset.x);
  const y = Number(cell.dataset.y);

  if (canPlace(draggedShape, x, y)) {

    /* ① 放置形状 */
    placeShape(draggedShape, x, y);

    /* ② 基础计分：每放一格 +1 分 */
    const placedCount =
      draggedShape.flat().filter(v => v === 1).length;
    score += placedCount;

    /* ③ 消行 / 消列计分 */
    clearAndGrow();

    /* ④ 更新 UI */
    scoreEl.innerText = "分数：" + score;
    renderBoard();
    generatePieces();
  }

  draggedShape = null;
  clearPreview();
});

/* =========================
   是否可放
========================= */
function canPlace(shape, x, y) {
  for (let dy = 0; dy < shape.length; dy++) {
    for (let dx = 0; dx < shape[0].length; dx++) {
      if (shape[dy][dx]) {
        if (board[y + dy]?.[x + dx]?.stage !== 0) {
          return false;
        }
      }
    }
  }
  return true;
}

/* =========================
   真正放置
========================= */
function placeShape(shape, x, y) {
  shape.forEach((row, dy) =>
    row.forEach((v, dx) => {
      if (v) {
        board[y + dy][x + dx].stage = 1;
      }
    })
  );
}

/* =========================
   预览
========================= */
function preview(x, y) {
  clearPreview();
  const ok = canPlace(draggedShape, x, y);

  draggedShape.forEach((row, dy) =>
    row.forEach((v, dx) => {
      if (!v) return;
      const el = [...boardEl.children]
        .find(c =>
          c.dataset.x == x + dx &&
          c.dataset.y == y + dy
        );
      if (el) {
        el.classList.add(ok ? "preview-ok" : "preview-bad");
      }
    })
  );
}

function clearPreview() {
  document.querySelectorAll(".preview-ok,.preview-bad")
    .forEach(el =>
      el.classList.remove("preview-ok", "preview-bad")
    );
}

/* =========================
   消行 / 消列 + 进阶计分
========================= */
function clearAndGrow() {
  const clear = [];

  /* 横向 */
  for (let y = 0; y < SIZE; y++) {
    if (board[y].every(c => c.stage > 0)) {
      for (let x = 0; x < SIZE; x++) {
        clear.push([x, y]);
      }
    }
  }

  /* 纵向 */
  for (let x = 0; x < SIZE; x++) {
    let full = true;
    for (let y = 0; y < SIZE; y++) {
      if (board[y][x].stage === 0) {
        full = false;
        break;
      }
    }
    if (full) {
      for (let y = 0; y < SIZE; y++) {
        clear.push([x, y]);
      }
    }
  }

  /* 实际清除并计分 */
  clear.forEach(([x, y]) => {
    board[y][x].stage = 0;
    score += 5; // ✅ 消一格 +5 分
  });
}

/* =========================
   是否 Game Over
========================= */
function isGameOver() {
  return currentShapes.every(shape => {
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        if (canPlace(shape, x, y)) return false;
      }
    }
    return true;
  });
}

/* =========================
   Game Over：只在这里回传分数
========================= */
function endGame() {

  window.parent.postMessage(
    { type: "GAME_OVER", score },
    "*"
  );

  // （如果你有结果画面，也可以留着）
}

/* =========================
   初始化
========================= */
scoreEl.innerText = "分数：0";
renderBoard();
generatePieces();
