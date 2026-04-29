const SIZE = 9;
let score = 0;

const board = Array.from({ length: SIZE }, () =>
  Array.from({ length: SIZE }, () => ({ stage: 0 }))
);

const boardEl = document.getElementById("board");
const piecesEl = document.getElementById("pieces");
const scoreEl = document.getElementById("score");

const gameEl = document.getElementById("game");
const resultEl = document.getElementById("result");
const resultTitle = document.getElementById("result-title");
const resultImg = document.getElementById("result-image");
const resultText = document.getElementById("result-text");

let draggedShape = null;
let currentShapes = [];

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
    p.draggable = true;
    p.style.gridTemplateColumns = `repeat(${shape[0].length},1fr)`;

    shape.forEach(r => r.forEach(v => {
      const c = document.createElement("div");
      c.className = "piece-cell";
      if (!v) c.style.visibility = "hidden";
      p.appendChild(c);
    }));

    p.addEventListener("dragstart", () => draggedShape = shape);
    p.addEventListener("dragend", clearPreview);

    piecesEl.appendChild(p);
  }

  if (isGameOver()) endGame();
}

/* ===== 拖拽放置 ===== */
boardEl.addEventListener("dragover", e => {
  e.preventDefault();
  if (!draggedShape) return;

  const cell = e.target;
  if (!cell.classList.contains("cell")) return;
  preview(Number(cell.dataset.x), Number(cell.dataset.y));
});

boardEl.addEventListener("drop", e => {
  e.preventDefault();
  if (!draggedShape) return;

  const cell = e.target;
  if (!cell.classList.contains("cell")) return;

  const x = Number(cell.dataset.x);
  const y = Number(cell.dataset.y);

  if (canPlace(draggedShape, x, y)) {
    placeShape(draggedShape, x, y);
    clearAndGrow();
    scoreEl.innerText = "分数：" + score;
    renderBoard();
    generatePieces();
  }

  draggedShape = null;
  clearPreview();
});

/* ===== 逻辑 ===== */
function canPlace(shape, x, y) {
  for (let dy=0;dy<shape.length;dy++)
    for (let dx=0;dx<shape[0].length;dx++)
      if (shape[dy][dx] && board[y+dy]?.[x+dx]?.stage !== 0) return false;
  return true;
}

function placeShape(shape,x,y){
  shape.forEach((r,dy)=>r.forEach((v,dx)=>{
    if(v) board[y+dy][x+dx].stage=1;
  }));
}

function preview(x,y){
  clearPreview();
  const ok = canPlace(draggedShape,x,y);
  draggedShape.forEach((r,dy)=>r.forEach((v,dx)=>{
    if(!v)return;
    const el=[...boardEl.children]
      .find(c=>c.dataset.x==x+dx && c.dataset.y==y+dy);
    if(el) el.classList.add(ok?"preview-ok":"preview-bad");
  }));
}

function clearPreview(){
  document.querySelectorAll(".preview-ok,.preview-bad")
    .forEach(el=>el.classList.remove("preview-ok","preview-bad"));
}

function clearAndGrow(){
  const clear=[];
  for(let y=0;y<SIZE;y++)
    if(board[y].every(c=>c.stage>0))
      for(let x=0;x<SIZE;x++) clear.push([x,y]);

  clear.forEach(([x,y])=>{
    board[y][x].stage=0;
    score++;
  });
}

function isGameOver(){
  return currentShapes.every(s=>{
    for(let y=0;y<SIZE;y++)
      for(let x=0;x<SIZE;x++)
        if(canPlace(s,x,y)) return false;
    return true;
  });
}

function endGame(){
  gameEl.classList.add("hidden");
  resultEl.classList.remove("hidden");
  if(score>=300){
    resultTitle.innerText="花开了 🌸";
    resultText.innerText="谢谢你，慢慢来，一切都会好的。";
  }else{
    resultTitle.innerText="还没开花 🌿";
    resultText.innerText="消除得太少了。";
  }
}

window.parent.postMessage(
  { type: "GAME_OVER", score },
  "*"
);

/* ===== 初始化 ===== */
renderBoard();
generatePieces();