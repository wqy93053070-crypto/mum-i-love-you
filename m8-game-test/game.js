const SIZE = 9;
let score = 0;

const boardEl = document.getElementById("board");
const piecesEl = document.getElementById("pieces");
const scoreEl = document.getElementById("score");

const board = Array.from({ length: SIZE }, () =>
  Array.from({ length: SIZE }, () => ({ stage: 0 }))
);

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
let activeShape = null;
let activeShapeIndex = -1;
let isDragging = false;

/* ===== 棋盘尺寸（Android 必须） ===== */
function fixBoardSize() {
  const w = boardEl.clientWidth;
  boardEl.style.height = w + "px";
}
window.addEventListener("resize", fixBoardSize);

/* ===== 渲染棋盘 ===== */
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

/* ===== 方块生成 ===== */
function generateShapes() {
  currentShapes = [];
  for (let i = 0; i < 3; i++) {
    currentShapes.push(
      SHAPES[Math.floor(Math.random() * SHAPES.length)]
    );
  }
}

/* ===== 渲染方块 ===== */
function renderPieces() {
  piecesEl.innerHTML = "";

  currentShapes.forEach((shape, index) => {
    const p = document.createElement("div");
    p.className = "piece";
    p.style.gridTemplateColumns = `repeat(${shape[0].length}, 1fr)`;

    shape.flat().forEach(v => {
      const c = document.createElement("div");
      c.className = "piece-cell";
      if (!v) c.style.visibility = "hidden";
      p.appendChild(c);
    });

    p.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const t = e.touches[0];
      activeShape = shape;
      activeShapeIndex = index;
      isDragging = true;
      handleMove(t.clientX, t.clientY);
    });

    piecesEl.appendChild(p);
  });
}

/* ===== 能否放置 ===== */
function canPlace(shape, x, y) {
  for (let dy = 0; dy < shape.length; dy++)
    for (let dx = 0; dx < shape[0].length; dx++)
      if (
        shape[dy][dx] &&
        (y+dy >= SIZE || x+dx >= SIZE || board[y+dy][x+dx].stage)
      ) return false;
  return true;
}

/* ===== 实际放置 ===== */
function placeShape(shape, x, y) {
  shape.forEach((row, dy) =>
    row.forEach((v, dx) => {
      if (v) board[y+dy][x+dx].stage = 1;
    })
  );
}

/* ===== Preview ===== */
function clearPreview() {
  document.querySelectorAll(".preview-ok")
    .forEach(el => el.classList.remove("preview-ok"));
}

function handleMove(x, y) {
  if (!isDragging || !activeShape) return;
  clearPreview();

  const el = document.elementFromPoint(x, y);
  if (!el || !el.classList.contains("cell")) return;

  const cx = Number(el.dataset.x);
  const cy = Number(el.dataset.y);
  if (!canPlace(activeShape, cx, cy)) return;

  activeShape.forEach((row, dy) =>
    row.forEach((v, dx) => {
      if (!v) return;
      const idx = (cy+dy)*SIZE + (cx+dx);
      boardEl.children[idx]?.classList.add("preview-ok");
    })
  );
}

/* ===== touch move / end ===== */
document.addEventListener("touchmove", (e) => {
  handleMove(e.touches[0].clientX, e.touches[0].clientY);
});

document.addEventListener("touchend", (e) => {
  if (!isDragging) return;

  const t = e.changedTouches[0];
  const el = document.elementFromPoint(t.clientX, t.clientY);

  if (el && el.classList.contains("cell")) {
    const x = Number(el.dataset.x);
    const y = Number(el.dataset.y);
    if (canPlace(activeShape, x, y)) {
      placeShape(activeShape, x, y);
      score += activeShape.flat().filter(v => v).length;
      scoreEl.innerText = "分数：" + score;

      currentShapes.splice(activeShapeIndex, 1);
      if (!currentShapes.length) generateShapes();

      renderBoard();
      renderPieces();
    }
  }

  clearPreview();
  activeShape = null;
  activeShapeIndex = -1;
  isDragging = false;
});

/* ===== 初始化 ===== */
scoreEl.innerText = "分数：0";
generateShapes();
renderBoard();
renderPieces();
``