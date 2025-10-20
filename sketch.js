//學習7程式碼所在
//學習5程式碼所在
let circles = []; // 儲存所有圓形物件的陣列
const colors = ['#d8e2dc', '#ffffff', '#f4acb7', '#9d8189']; // 圓形可用的顏色

// --- 新增：管理爆破粒子的陣列與參數 ---
let bursts = [];
const POP_CHANCE = 0.002; // 每個圓每一幀被炸裂的機率（可調整）
// --- 新增結束 ---

function setup() {
  createCanvas(windowWidth, windowHeight); // 建立全螢幕畫布
  background('#ffcad4'); // 設定畫布顏色

  // 初始化 30 個圓形物件
  for (let i = 0; i < 40; i++) {
    circles.push(new Circle());
  }
}

function draw() {
  // 為了看到圓形在移動，我們每次繪製時都要重新繪製背景，
  // 否則會留下殘影。
  background('#ffcad4');

  // 迭代並更新/顯示每個圓形
  for (let circle of circles) {
    circle.update();
    circle.display();
  }

  // --- 新增：更新並顯示爆破粒子 ---
  for (let i = bursts.length - 1; i >= 0; i--) {
    bursts[i].update();
    bursts[i].display();
    if (bursts[i].isDead()) {
      bursts.splice(i, 1);
    }
  }
  // --- 新增結束 ---
}

// 當視窗大小改變時，重新調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background('#ffcad4'); // 重新設定背景
}

// 定義一個 Circle 類別來管理每個圓形的屬性
class Circle {
  constructor() {
    this.reset();
  }

  // 設定或重設圓形的初始屬性
  reset() {
    // 隨機選擇一個顏色
    this.color = random(colors);
    
    // 隨機設定大小 (直徑)
    this.diameter = random(50, 200);
    
    // 圓形從畫布底部開始
    this.x = random(width);
    this.y = height + this.diameter / 2; 
    
    // 隨機設定向上漂浮的速度 (速度越快，值越大)
    this.speed = random(0.5, 3); 
    
    // 隨機設定透明度 (0 到 255)
    this.alpha = random(80, 200);
  }

  // 更新圓形的位置
  update() {
    this.y -= this.speed; // 向上移動

    // --- 新增：隨機爆破觸發 ---
    if (random() < POP_CHANCE) {
      this.explode();
      // 立刻重設到畫布底部重新生成氣球
      this.reset();
      this.x = random(width);
      this.y = height + this.diameter / 2;
      return;
    }
    // --- 新增結束 ---

    // 如果圓形完全漂浮到畫布頂部上方，就將其重設到畫布底部
    if (this.y < -this.diameter / 2) {
      this.reset();
      // 為了讓它們在畫布底部有隨機的起始位置，
      // 我們重新設定 x 座標，但保留其他屬性。
      this.x = random(width);
      this.y = height + this.diameter / 2;
    }
  }

  // 爆裂：生成多個爆破粒子
  explode() {
    // 粒子數量與圓大小相關
    let count = floor(random(12, 28));
    for (let i = 0; i < count; i++) {
      let angle = random(TWO_PI);
      // 粒子速度依直徑而定（大氣球碎片飛更遠）
      let speed = random(1, map(this.diameter, 50, 200, 2, 6));
      let vx = cos(angle) * speed;
      let vy = sin(angle) * speed;
      bursts.push(new BurstParticle(this.x, this.y, vx, vy, this.color, this.alpha));
    }
  }

  // 繪製圓形
  display() {
    noStroke(); // 無邊框
    
    // 為了使用透明度，我們需要將顏色轉換為 p5.js 的 color() 物件
    let c = color(this.color);
    c.setAlpha(this.alpha); // 設定透明度
    fill(c);
    
    // 繪製圓形
    ellipse(this.x, this.y, this.diameter, this.diameter);

    // --- 新增：在圓右上方繪製白色透明方形 ---
    let squareSize = this.diameter / 7;
    // 讓方形中心點在圓右上1/4半徑處，確保方形完全在圓內
    let offset = (this.diameter / 2) - (squareSize / 2);
    // 再往圓心方向縮小 1/4 方形邊長，確保不會超出圓邊
    let safeOffset = offset - squareSize / 4;
    let squareX = this.x + safeOffset * cos(PI / 4);
    let squareY = this.y - safeOffset * sin(PI / 4);

    // 設定白色且透明
    let squareColor = color(255, 255, 255, 120); // 120為透明度，可自行調整
    fill(squareColor);
    noStroke();
    rectMode(CENTER);
    rect(squareX, squareY, squareSize, squareSize);
    // --- 新增結束 ---
  }
}

// --- 新增：爆破粒子類別 ---
class BurstParticle {
  constructor(x, y, vx, vy, col, baseAlpha) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.col = col;
    this.baseAlpha = baseAlpha || 200;
    this.lifespan = 255;
    this.size = random(3, 8);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    // 微小重力與摩擦，讓碎片稍微下墜並漸停
    this.vy += 0.06;
    this.vx *= 0.99;
    this.vy *= 0.995;
    this.lifespan -= 6; // 漸隱速度
  }

  display() {
    noStroke();
    let c = color(this.col);
    // 根據剩餘壽命調整透明度
    let a = (this.lifespan / 255) * this.baseAlpha;
    c.setAlpha(max(0, a));
    fill(c);
    ellipse(this.x, this.y, this.size, this.size);
  }

  isDead() {
    return this.lifespan <= 0 || this.y > height + 50;
  }
}