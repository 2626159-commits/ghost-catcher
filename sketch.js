let ghost = null, particles = [], stars = [], bats = [];
let score = 0, best = 0, combo = 0, misses = 0;
let state = "start", startTime = 0, duration = 30, ghostSize = 58, shake = 0;
const C = { bg:[15,10,28], moon:[255,224,165], ghost:[232,241,255], purple:[170,120,255], orange:[255,133,43], red:[255,80,92] };

function setup() {
  createCanvas(480,360); textFont("Georgia"); pixelDensity(1);
  for (let i=0;i<60;i++) stars.push({x:random(width),y:random(300),s:random(1,3),p:random(TWO_PI)});
  for (let i=0;i<6;i++) bats.push({x:random(width),y:random(45,180),v:random(.5,1.4),p:random(TWO_PI)});
  try { best = Number(localStorage.getItem("ghostBest")||0); } catch(e) {}
  spawnGhost();
}

function draw() {
  background(...C.bg); drawWorld();
  if (state === "start") return drawStart();
  if (state === "over") { updateParticles(); drawParticles(); return drawOver(); }
  let left = max(0, duration-(millis()-startTime)/1000);
  if (left <= 0) { state="over"; best=max(best,score); ghost=null; saveBest(); return; }
  ghostSize = lerp(58,39,1-left/duration);
  ensureGhost(); updateBats(); updateParticles();
  if (ghost) { updateGhost(ghost); drawGhost(ghost); }
  drawBats(); drawParticles(); drawHUD(left);
  if (shake>0) shake--;
}

function drawWorld() {
  noStroke();
  for (let y=0;y<height;y+=4) { let t=y/height; fill(18+16*t,11+5*t,39+20*t); rect(0,y,width,4); }
  for (let s of stars) { fill(255,224,165,130+100*sin(frameCount*.03+s.p)); circle(s.x,s.y,s.s); }
  fill(255,195,100,25); circle(395,70,110); fill(...C.moon); circle(395,70,66);
  fill(29,17,48); ellipse(80,330,280,110); ellipse(390,330,340,120);
  fill(15,9,28); rect(0,305,width,55);
  drawGrave(48,306,1); drawGrave(126,319,.65); drawGrave(420,314,1); drawPumpkin(25,340,.55); drawPumpkin(455,340,.55);
}

function drawGrave(x,y,s) { push(); translate(x,y); scale(s); fill(62,52,78); rect(-15,-28,30,34,8); fill(170,150,190,170); textAlign(CENTER,CENTER); textSize(10); text("+",0,-10); pop(); }
function drawPumpkin(x,y,s) { push(); translate(x,y); scale(s); fill(255,105,20); ellipse(0,0,38,28); ellipse(-9,0,18,25); ellipse(9,0,18,25); fill(45,100,35); rect(-3,-18,6,10); fill(40,20,15); triangle(-10,-4,-3,-4,-6,3); triangle(3,-4,10,-4,6,3); rect(-6,7,12,3); pop(); }

function updateBats() { for (let b of bats) { b.x+=b.v; if (b.x>width+25) b.x=-25; } }
function drawBats() { for (let b of bats) { push(); translate(b.x,b.y+sin(frameCount*.04+b.p)*3); scale(.8); fill(7,4,15); ellipse(0,0,9,12); triangle(-3,0,-18,-10,-12,5); triangle(3,0,18,-10,12,5); pop(); } }

function spawnGhost() {
  let r=max(29,ghostSize/2); ghost={x:random(r,width-r),y:random(120,280),vx:random(-1.5,1.5)||.7,vy:random(-1.2,1.2)||.6,p:random(TWO_PI)};
}
function ensureGhost() { if (state==="play" && !ghost) spawnGhost(); }
function updateGhost(g) { if (!g) return; g.x+=g.vx; g.y+=g.vy; let r=ghostSize/2; if(g.x<r||g.x>width-r){g.vx*=-1;g.x=constrain(g.x,r,width-r);} if(g.y<110+r||g.y>292-r){g.vy*=-1;g.y=constrain(g.y,110+r,292-r);} }
function drawGhost(g) { if(!g)return; push(); translate(g.x,g.y+sin(frameCount*.08+g.p)*5); scale(ghostSize/58); fill(150,90,255,35); circle(0,0,88); fill(...C.ghost); ellipse(0,-7,56,67); rect(-28,-7,56,29); triangle(-28,18,-18,29,-9,18); triangle(-11,18,0,30,10,18); triangle(8,18,18,29,28,18); fill(25,12,40); ellipse(-10,-8,8,13); ellipse(10,-8,8,13); ellipse(0,10,9,12); pop(); }

function updateParticles() { for(let p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.life-=p.fade;} particles=particles.filter(p=>p.life>0); }
function drawParticles() { noStroke(); for(let p of particles){fill(red(p.c),green(p.c),blue(p.c),p.life);circle(p.x,p.y,p.s);} }
function burst(x,y,n,c) { for(let i=0;i<n;i++) particles.push({x,y,vx:random(-4,4),vy:random(-5,2),life:255,fade:random(5,9),s:random(3,7),c}); }

function drawHUD(left) { fill(25,15,42,235); rect(10,10,460,52,12); fill(...C.orange); textAlign(LEFT,CENTER); textSize(15); text("SCORE  "+score,23,28); fill(190,165,230); textSize(11); text("COMBO  x"+combo,23,47); textAlign(RIGHT,CENTER); fill(left<10?color(...C.red):color(...C.moon)); textSize(17); text(ceil(left)+"s",456,29); fill(60,38,75); rect(10,69,460,5,4); fill(...C.orange); rect(10,69,460*left/duration,5,4); }
function drawStart() { drawGhost({x:240,y:210,p:0}); textAlign(CENTER,CENTER); fill(...C.orange); textSize(34); text("GHOST SHIP",240,95); fill(190,165,230); textSize(13); text("A HAUNTED NIGHT WATCH",240,125); fill(255); textSize(14); text("Catch the ghost before the tide runs out.",240,165); fill(...C.moon); textSize(17); text("CLICK OR TAP TO START",240,270); }
function drawOver() { fill(12,6,23,225); rect(0,0,width,height); textAlign(CENTER,CENTER); fill(...C.orange); textSize(31); text("THE TIDE TURNS",240,105); fill(255); textSize(20); text("SCORE  "+score,240,160); fill(...C.moon); textSize(15); text("BEST  "+best,240,190); fill(190,165,230); textSize(13); text("Misses: "+misses,240,215); fill(...C.moon); textSize(17); text("CLICK OR TAP TO PLAY AGAIN",240,275); }

function startGame() { score=0;combo=0;misses=0;particles=[];ghostSize=58;startTime=millis();state="play";ghost=null;spawnGhost(); }
function pointer(x,y) { if(state==="start"||state==="over") return startGame(); if(state!=="play") return; ensureGhost(); if(!ghost)return; if(dist(x,y,ghost.x,ghost.y)<max(22,ghostSize*.68)){combo++;score+=1+floor(combo/5);best=max(best,score);burst(ghost.x,ghost.y,20,color(...C.purple));spawnGhost();}else{combo=0;misses++;score=max(0,score-1);shake=7;burst(x,y,6,color(...C.red));} }
function mousePressed() { pointer(mouseX,mouseY); return false; }
function touchStarted() { if(touches.length) { let r=document.querySelector("canvas").getBoundingClientRect(), t=touches[0]; pointer((t.clientX-r.left)*width/r.width,(t.clientY-r.top)*height/r.height); } return false; }
function saveBest() { try{localStorage.setItem("ghostBest",best);}catch(e){} }
