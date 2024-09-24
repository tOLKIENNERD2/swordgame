function checkCollision(attacker, defender) {
    if (attacker instanceof Archer) {
        checkArrowCollisions(attacker, defender);
    } else {
        const attackRange = 10; // Increase this value to extend the sword's range
        if (attacker.isAttacking &&
            attacker.x - attackRange < defender.x + defender.width &&
            attacker.x + attacker.width + attackRange > defender.x &&
            attacker.y < defender.y + defender.height &&
            attacker.y + attacker.height > defender.y) {
            
            let damage = 7 + (attacker.comboCount * 1);
            
            if (defender.isBlocking) {
                damage *= 0.3;
                defender.stamina -= 5;
            }
            
            defender.takeDamage(damage);
            attacker.score += damage;

            // Knockback effect
            const knockbackForce = 3 + (attacker.comboCount * 0.5);
            if (attacker.x < defender.x) {
                defender.x += knockbackForce;
            } else {
                defender.x -= knockbackForce;
            }
        }
    }
}

function checkPowerUpCollision(player, powerUp) {
    if (powerUp &&
        player.x < powerUp.x + powerUp.radius &&
        player.x + player.width > powerUp.x - powerUp.radius &&
        player.y < powerUp.y + powerUp.radius &&
        player.y + player.height > powerUp.y - powerUp.radius) {
        player.powerUp = powerUp.type;
        player.powerUpDuration = 300;
        if (powerUp.type === 'speed') {
            player.speed = 8;
        }
        powerUp = null;
    }
}

function checkObstacleCollision(player, obstacles) {
    for (let obstacle of obstacles) {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            // Collision detected, adjust player position
            if (player.y + player.height > obstacle.y && player.y < obstacle.y) {
                player.y = obstacle.y - player.height;
                player.velocityY = 0;
                player.isJumping = false;
                player.jumpCount = 0;
            } else if (player.y < obstacle.y + obstacle.height) {
                player.y = obstacle.y + obstacle.height;
                player.velocityY = 0;
            }
        }
    }
}

// Add this function to check arrow collisions
function checkArrowCollisions(attacker, defender) {
    attacker.arrows.forEach((arrow, index) => {
        if (arrow.x < defender.x + defender.width &&
            arrow.x + arrow.width > defender.x &&
            arrow.y < defender.y + defender.height &&
            arrow.y + arrow.height > defender.y) {
            
            let damage = 10; // Reduced from 15 to 10
            
            if (defender.isBlocking) {
                damage *= 0.3;
                defender.stamina -= 5;
            }
            
            defender.takeDamage(damage);
            attacker.score += damage;
            attacker.arrows.splice(index, 1);
        }
    });
}