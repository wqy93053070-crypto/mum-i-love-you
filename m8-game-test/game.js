const SIZE = 9;
let score = 0;

const board = Array.from({ length: SIZE }, () =>
  Array.from({ length: SIZE }, () => ({ stage: 0 }))
);

const boardEl = document.getElementById("board");
const piecesEl = document.getElementById("pieces");
const scoreEl = document.getElementById("score");

let activeShape = null;
let currentShapes = [];
let dragging = false;

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

/* ===== 渲染 ===== */
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

function generatePieces() {
  piecesEl.innerHTML = "";
  currentShapes = [];

  for (let i = 0; i < 3; i++) {
    const shape = SHAPE_POOL[Math.floor(Math.random() * SHAPE_POOL.length)];
    currentShapes.push(shape);

    const p = document.createElement("div");
    p.className = "piece";
    p.style.gridTemplateColumns = `repeat(${shape[0].length}, 1fr)`;

    shape.flat().forEach(v => {
      const cell = document.createElement("div");
      cell.className = "piece-cell";
      if (!v) cell.style.visibility = "hidden";
      p.appendChild(cell);
    });

    // ✅ Pointer Events：按下
    p.addEventListener("pointerdown", () => {
      activeShape = shape;
      dragging = true;
    });

    piecesEl.appendChild(p);
  }
}

/* ===== Pointer 拖拽 ===== */
boardEl.addEventListener("pointermove", e => {
  if (!dragging || !activeShape) return;

  const target = document.elementFromPoint(e.clientX, e.clientY);
  if (!target || !target.classList.contains("cell")) return;

  preview(+target.dataset.x, +target.dataset.y);
});

window.addEventListener("pointerup", e => {
  if (!dragging || !activeShape) return;

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

  dragging = false;
  activeShape = null;
  clearPreview();
});

/* ===== 遊戲邏輯 ===== */
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
  document.querySelectorAll(".preview-ok")
    .forEach(el => el.classList.remove("preview-ok"));
}

/* ===== 初始化 ===== */
scoreEl.innerText = "分数：0";
renderBoard();
generatePieces();
``