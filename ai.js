function updateAI(aiPlayer, humanPlayer, powerUp, obstacles) {
    // Reduce overall randomness
    if (Math.random() < 0.02) {
        aiPlayer.velocityX = 0; // Occasionally stop moving
        return;
    }

    const distanceToPlayer = humanPlayer.x - aiPlayer.x;
    const closeToPlayer = Math.abs(distanceToPlayer) < 150;

    // Check if there's an obstacle in front of the AI
    const obstacleAhead = obstacles.some(obstacle => 
        (aiPlayer.facingRight && obstacle.x > aiPlayer.x && obstacle.x < aiPlayer.x + 200) ||
        (!aiPlayer.facingRight && obstacle.x < aiPlayer.x && obstacle.x + obstacle.width > aiPlayer.x - 200)
    );

    // Move towards the human player hi
    if (!closeToPlayer) {
        if (distanceToPlayer > 0) {
            aiPlayer.moveRight();
        } else {
            aiPlayer.moveLeft();
        }
    } else {
        // When close, have a chance to stop or attack
        if (Math.random() < 0.3) {
            aiPlayer.stopMoving();
        }
        if (Math.random() < 0.5 && !aiPlayer.isAttacking) {
            aiPlayer.attack();
        }
    }

    // Jump logic
    const shouldJump = (
        (obstacleAhead && Math.random() < 0.1) || // Jump over obstacles
        (powerUp && Math.abs(aiPlayer.x - powerUp.x) < 50 && powerUp.y < aiPlayer.y) || // Jump for power-ups
        (Math.random() < 0.005) // Occasional random jump (reduced frequency)
    );

    if (shouldJump) {
        aiPlayer.jump();
    }

    // Blocking logic
    if (closeToPlayer && humanPlayer.isAttacking && Math.random() < 0.7) {
        aiPlayer.block();
    }

    // If stuck, try to jump
    if (aiPlayer.velocityX === 0 && aiPlayer.velocityY === 0 && Math.random() < 0.1) {
        aiPlayer.jump();
    }
}