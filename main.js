const gameStart = document.querySelector('.game-start');
const gameArea = document.querySelector('.game-area');
const gameScore = document.querySelector('.game-score');
const gamePoints = gameScore.querySelector('.points');
const gameOver = document.querySelector('.game-over');

const keys = {};
const player = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    lastTimeFiredFireball: 0
};
const game = {
    speed: 2,
    movingMultiplier: 4,
    fireBallMultiplier: 5,
    fireInterval: 1000,
    cloudSpawnInterval: 3000,
    bugSpawnInterval: 1000,
    bugKillBonus: 2000,
    bonusSpawnInterval: 4000, 
    bonusPoints: 5000        
};
const scene = {
    score: 0,
    isActiveGame: true,
    lastCloudSpawn: 0,
    lastBugSpawn: 0,
    lastBonusSpawn: 0
};

gameStart.addEventListener('click', onGameStart);
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

function onKeyDown(e) {
    keys[e.code] = true;
}
function onKeyUp(e) {
    keys[e.code] = false;
}

function onGameStart() {
    gameStart.classList.add('hide');
    gameOver.classList.add('hide');
    scene.isActiveGame = true;
    gameArea.innerHTML = '';

    const wizard = document.createElement('div');
    wizard.classList.add('wizard');
    gameArea.appendChild(wizard);

    player.x = 200;
    player.y = 200;

    wizard.style.left = player.x + 'px';
    wizard.style.top = player.y + 'px';

    player.width = wizard.offsetWidth;
    player.height = wizard.offsetHeight;

    window.requestAnimationFrame(gameAction);
}

function gameAction(timestamp) {
    const wizard = document.querySelector('.wizard');
    if (timestamp - scene.lastBonusSpawn > game.bonusSpawnInterval + 3000 * Math.random()) {
    const bonus = document.createElement('div');
    bonus.classList.add('bonus-item');
    bonus.x = gameArea.offsetWidth - 60;
    bonus.style.left = bonus.x + 'px';
    bonus.style.top = (Math.random() * (gameArea.offsetHeight - 200)) + 50 + 'px';
    gameArea.appendChild(bonus);
    console.log('BONUS SPAWNED at', bonus.style.top);
    scene.lastBonusSpawn = timestamp;
}

    // Gravity
    let isInAir = player.y + player.height < gameArea.offsetHeight;

    document.querySelectorAll('.bonus-item').forEach(bonus => {
    bonus.x -= game.speed;
    bonus.style.left = bonus.x + 'px';
    if (bonus.x + bonus.offsetWidth <= 0) bonus.remove();
});

    if (keys['ArrowUp'] && player.y > 0) player.y -= game.speed * game.movingMultiplier;
    if (keys['ArrowDown'] && isInAir) player.y += game.speed * game.movingMultiplier;
    if (keys['ArrowLeft'] && player.x > 0) player.x -= game.speed * game.movingMultiplier;
    if (keys['ArrowRight'] && player.x + player.width < gameArea.offsetWidth) {
        player.x += game.speed * game.movingMultiplier;
    }

    if (isInAir) player.y += game.speed;

    wizard.style.left = player.x + 'px';
    wizard.style.top = player.y + 'px';

    // Shoot Fireball
    if (keys['Space'] && timestamp - player.lastTimeFiredFireball > game.fireInterval) {
        wizard.classList.add('wizard-fire');
        addFireBall(player);
        player.lastTimeFiredFireball = timestamp;
    } else {
        wizard.classList.remove('wizard-fire');
    }

    // Move Fireballs
    document.querySelectorAll('.fire-ball').forEach(fireBall => {
        fireBall.x += game.speed * game.fireBallMultiplier;
        if (fireBall.x + fireBall.offsetWidth > gameArea.offsetWidth) {
            fireBall.remove();
        } else {
            fireBall.style.left = fireBall.x + 'px';
        }
    });

    // Add Clouds
    if (timestamp - scene.lastCloudSpawn > game.cloudSpawnInterval + 20000 * Math.random()) {
        const cloud = document.createElement('div');
        cloud.classList.add('cloud');
        cloud.x = gameArea.offsetWidth - 200;
        cloud.style.left = cloud.x + 'px';
        cloud.style.top = (Math.random() * gameArea.offsetHeight / 2) + 'px';
        gameArea.appendChild(cloud);
        scene.lastCloudSpawn = timestamp;
    }

    // Move Clouds
    document.querySelectorAll('.cloud').forEach(cloud => {
        cloud.x -= game.speed;
        cloud.style.left = cloud.x + 'px';
        if (cloud.x + cloud.offsetWidth <= 0) cloud.remove();
    });

    // Add Bugs
    if (timestamp - scene.lastBugSpawn > game.bugSpawnInterval + 5000 * Math.random()) {
        const bug = document.createElement('div');
        bug.classList.add('bug');
        bug.x = gameArea.offsetWidth - 60;
        bug.style.left = bug.x + 'px';
        bug.style.top = (Math.random() * (gameArea.offsetHeight - 60)) + 'px';
        gameArea.appendChild(bug);
        scene.lastBugSpawn = timestamp;
    }

    // Move Bugs
    document.querySelectorAll('.bug').forEach(bug => {
        bug.x -= game.speed;
        bug.style.left = bug.x + 'px';
        if (bug.x + bug.offsetWidth <= 0) bug.remove();
    });

    // Collisions
    document.querySelectorAll('.bug').forEach(bug => {
        if (isCollision(wizard, bug)) gameOverAction();

     document.querySelectorAll('.bonus-item').forEach(bonus => {
    if (isCollision(wizard, bonus)) {
        scene.score += game.bonusPoints;
        showMessage("Честита годишнина Мишел ❤️");
        bonus.remove();
    }
});

        document.querySelectorAll('.fire-ball').forEach(fireBall => {
            if (isCollision(fireBall, bug)) {
                scene.score += game.bugKillBonus;
                bug.remove();
                fireBall.remove();
            }
        });
    });

    // Score
    scene.score++;
    gamePoints.textContent = scene.score;

    if (scene.isActiveGame) {
        window.requestAnimationFrame(gameAction);
    }
}

function addFireBall(player) {
    const fireBall = document.createElement('div');
    fireBall.classList.add('fire-ball');
    fireBall.x = player.x + player.width;
    fireBall.style.left = fireBall.x + 'px';
    fireBall.style.top = (player.y + player.height / 3 + 5) + 'px';
    gameArea.appendChild(fireBall);
}

function isCollision(first, second) {
    const firstRect = first.getBoundingClientRect();
    const secondRect = second.getBoundingClientRect();

    return !(
        firstRect.top > secondRect.bottom ||
        firstRect.bottom < secondRect.top ||
        firstRect.right < secondRect.left ||
        firstRect.left > secondRect.right
    );
}

function gameOverAction() {
    scene.isActiveGame = false;
    gameOver.classList.remove('hide');
}

function showMessage(text) {
    const messageEl = document.querySelector('.message');
    messageEl.textContent = text;
    messageEl.style.display = 'block';

    // Скрий текста след 2 секунди
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 2000);
}
