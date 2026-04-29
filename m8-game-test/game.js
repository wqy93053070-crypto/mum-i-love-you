document.addEventListener("pointerdown", () => {
  console.log("✅ pointerdown detected");
});

/* =========================
   基本設定
========================= */
const SIZE = 9;
let score = 0;

/* DOM */
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
  [[1,1]],
  [[1,1,1]],
  [[1],[1]],
  [[1],[1],[1]],
  [[1,1],[1,1]],
  [[1,0],[1,1]],
  [[0,1],[1,1]]
];

let currentShapes = [];

/* 拖拽狀態（關鍵） */
let activeShape = null;
let activeShapeIndex = -1;
let isDragging = false;

/* =========================
   棋盤尺寸（Android 必須）
========================= */
function fixBoardSize() {
  const w = boardEl.clientWidth;
  boardEl.style.height = w + "px";
}
window.addEventListener("resize", fixBoardSize);

/* =========================
   渲染棋盤
========================= */
function renderBoard() {
  boardEl.innerHTML = "";
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const c = document.createElement("div");
      c.className = "cell" + (board[y][x].stage ? " stage-1" : "");
      c.dataset.x = x;
      c.dataset.y = y;
      boardEl.appendChild(c);
    }
  }
  fixBoardSize();
}

/* =========================
   生成與渲染方塊
========================= */
function generateShapes() {
  currentShapes = [];
  for (let i = 0; i < 3; i++) {
    currentShapes.push(
      SHAPES[Math.floor(Math.random() * SHAPES.length)]
    );
  }
}

function renderPieces() {
  piecesEl.innerHTML = "";

  currentShapes.forEach((shape, index) => {
    const p = document.createElement("div");
    p.className = "piece";
    p.style.gridTemplateColumns =
      `repeat(${shape[0].length}, 1fr)`;

    shape.flat().forEach(v => {
      const c = document.createElement("div");
      c.className = "piece-cell";
      if (!v) c.style.visibility = "hidden";
      p.appendChild(c);
    });

    /* ✅ pointerdown 永遠可以重新開始拖 */
    p.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      activeShape = shape;
      activeShapeIndex = index;
      isDragging = true;
    });

    piecesEl.appendChild(p);
  });
}

/* =========================
   放置邏輯
========================= */
function canPlace(shape, x, y) {
  for (let dy = 0; dy < shape.length; dy++) {
    for (let dx = 0; dx < shape[0].length; dx++) {
      if (shape[dy][dx]) {
        if (
          y + dy >= SIZE ||
          x + dx >= SIZE ||
          board[y + dy][x + dx].stage !== 0
        ) return false;
      }
    }
  }
  return true;
}

function placeShape(shape, x, y) {
  shape.forEach((row, dy) =>
    row.forEach((v, dx) => {
      if (v) board[y + dy][x + dx].stage = 1;
    })
  );
}

/* =========================
   Preview
========================= */
function clearPreview() {
  document
    .querySelectorAll(".preview-ok")
    .forEach(el => el.classList.remove("preview-ok"));
}

document.addEventListener("pointermove", e => {
  if (!isDragging || !activeShape) return;

  clearPreview();
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el || !el.classList.contains("cell")) return;

  const x = Number(el.dataset.x);
  const y = Number(el.dataset.y);

  if (!canPlace(activeShape, x, y)) return;

  activeShape.forEach((row, dy) =>
    row.forEach((v, dx) => {
      if (!v) return;
      const idx = (y + dy) * SIZE + (x + dx);
      const cell = boardEl.children[idx];
      if (cell) cell.classList.add("preview-ok");
    })
  );
});

/* =========================
   放手（✅ 一定 reset 狀態）
========================= */
document.addEventListener("pointerup", e => {
  if (!isDragging) return;

  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (
    el &&
    el.classList.contains("cell") &&
    activeShape &&
    activeShapeIndex >= 0
  ) {
    const x = Number(el.dataset.x);
    const y = Number(el.dataset.y);

    if (canPlace(activeShape, x, y)) {
      placeShape(activeShape, x, y);

      score += activeShape.flat().filter(v => v === 1).length;
      scoreEl.innerText = "分数：" + score;

      currentShapes.splice(activeShapeIndex, 1);
      if (currentShapes.length === 0) generateShapes();

      renderBoard();
      renderPieces();
    }
  }

  /* ✅ 無論成功或失敗，全部 reset */
  clearPreview();
  activeShape = null;
  activeShapeIndex = -1;
  isDragging = false;
});

/* =========================
   初始化
========================= */
scoreEl.innerText = "分数：0";
generateShapes();
renderBoard();
renderPieces();