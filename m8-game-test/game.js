/*************************************************
 * 基本設定
 *************************************************/
const SIZE = 9;
let score = 0;

const boardEl  = document.getElementById("board");
const piecesEl = document.getElementById("pieces");
const scoreEl  = document.getElementById("score");

/*************************************************
 * 棋盤資料
 *************************************************/
const board = Array.from({ length: SIZE }, () =>
  Array.from({ length: SIZE }, () => ({ stage: 0 }))
);

/*************************************************
 * 方塊池
 *************************************************/
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
let selectedShape = null;
let selectedShapeIndex = -1;

/*************************************************
 * Android：固定棋盤高度
 *************************************************/
function fixBoardSize() {
  const w = boardEl.clientWidth;
  boardEl.style.height = w + "px";
}
window.addEventListener("resize", fixBoardSize);

/*************************************************
 * 渲染棋盤
 *************************************************/
function renderBoard() {
  boardEl.innerHTML = "";
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const c = document.createElement("div");
      c.className = "cell" + (board[y][x].stage ? " stage-1" : "");
      c.dataset.x = x;
      c.dataset.y = y;

      /* 點棋盤格 → 嘗試放置 */
      c.addEventListener("click", () => {
        if (!selectedShape) return;
        if (!canPlace(selectedShape, x, y)) return;

        placeShape(selectedShape, x, y);

        // 放置得分
        score += selectedShape.flat().filter(v => v).length;

        // 消除
        const cleared = clearCompleted();
        score += cleared * 2;

        scoreEl.innerText = "分数：" + score;

        // 移除用掉的方塊
        currentShapes.splice(selectedShapeIndex, 1);
        if (currentShapes.length === 0) generateShapes();

        resetSelection();
        renderBoard();
        renderPieces();
      });

      boardEl.appendChild(c);
    }
  }
  fixBoardSize();
}

/*************************************************
 * 方塊生成 / 渲染
 *************************************************/
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
      `repeat(${shape[0].length},1fr)`;

    shape.flat().forEach(v => {
      const c = document.createElement("div");
      c.className = "piece-cell";
      if (!v) c.style.visibility = "hidden";
      p.appendChild(c);
    });

    /* 點一下選取 */
    p.addEventListener("click", () => {
      selectedShape = shape;
      selectedShapeIndex = index;
      showAllPreviews();
    });

    piecesEl.appendChild(p);
  });
}

/*************************************************
 * 放置判斷
 *************************************************/
function canPlace(shape, x, y) {
  for (let dy = 0; dy < shape.length; dy++)
    for (let dx = 0; dx < shape[0].length; dx++)
      if (
        shape[dy][dx] &&
        (y+dy >= SIZE || x+dx >= SIZE || board[y+dy][x+dx].stage)
      ) return false;
  return true;
}

function placeShape(shape, x, y) {
  shape.forEach((row, dy) =>
    row.forEach((v, dx) => {
      if (v) board[y+dy][x+dx].stage = 1;
    })
  );
}

/*************************************************
 * Preview（顯示所有可放位置）
 *************************************************/
function clearPreview() {
  document.querySelectorAll(".preview-ok")
    .forEach(el => el.classList.remove("preview-ok"));
}

function showAllPreviews() {
  clearPreview();
  if (!selectedShape) return;

  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      if (canPlace(selectedShape, x, y))
        selectedShape.forEach((row, dy) =>
          row.forEach((v, dx) => {
            if (!v) return;
            const idx = (y+dy)*SIZE + (x+dx);
            boardEl.children[idx]?.classList.add("preview-ok");
          })
        );
}

/*************************************************
 * 消除（行 / 列 / 3×3）
 *************************************************/
function clearCompleted() {
  let cleared = 0;
  const mark = Array.from({length: SIZE}, () =>
    Array.from({length: SIZE}, () => false)
  );

  // 行
  for (let y = 0; y < SIZE; y++)
    if (board[y].every(c => c.stage))
      for (let x = 0; x < SIZE; x++) mark[y][x] = true;

  // 列
  for (let x = 0; x < SIZE; x++) {
    let full = true;
    for (let y = 0; y < SIZE; y++)
      if (!board[y][x].stage) full = false;
    if (full) for (let y = 0; y < SIZE; y++) mark[y][x] = true;
  }

  // 3×3
  for (let by = 0; by < 3; by++)
    for (let bx = 0; bx < 3; bx++) {
      let full = true;
      for (let y = 0; y < 3; y++)
        for (let x = 0; x < 3; x++)
          if (!board[by*3+y][bx*3+x].stage) full = false;
      if (full)
        for (let y = 0; y < 3; y++)
          for (let x = 0; x < 3; x++)
            mark[by*3+y][bx*3+x] = true;
    }

  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      if (mark[y][x] && board[y][x].stage) {
        board[y][x].stage = 0;
        cleared++;
      }

  return cleared;
}

/*************************************************
 * 重置選取
 *************************************************/
function resetSelection() {
  selectedShape = null;
  selectedShapeIndex = -1;
  clearPreview();
}

/*************************************************
 * 初始化
 *************************************************/
scoreEl.innerText = "分数：0";
generateShapes();
renderBoard();
renderPieces();
