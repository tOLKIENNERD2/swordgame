class Player {
    constructor(x, y, color, isHuman) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 100;
        this.color = color;
        this.speed = 3; // Reduced from 5 to 3
        this.isAttacking = false;
        this.health = 100;
        this.stamina = 100;
        this.facingRight = false;
        this.velocityY = 0;
        this.isJumping = false;
        this.attackAngle = 0;
        this.powerUp = null;
        this.powerUpDuration = 0;
        this.canWallJump = false;
        this.wallJumpCooldown = 0;
        this.swordLength = 60;
        this.swordWidth = 10;
        this.attackDuration = 0;
        this.score = 0;
        this.jumpCount = 0;
        this.maxJumps = 2;
        this.groundLevel = y; // Store the initial y position as the ground level
        this.velocityX = 0; // Add this line
        this.attackCooldown = 0;
        this.blockCooldown = 0;
        this.isBlocking = false;
        this.comboCount = 0;
        this.lastAttackTime = 0;
        this.blockDuration = 0;
        this.maxBlockDuration = 120; // 2 seconds of blocking
        this.blockRechargeTime = 0;
        this.maxBlockRechargeTime = 180; // 3 seconds to recharge block
    }

    stopMoving() {
        this.velocityX = 0;
    }

    moveLeft() {
        this.velocityX = -this.speed;
        this.facingRight = false;
    }

    moveRight() {
        this.velocityX = this.speed;
        this.facingRight = true;
    }

    jump() {
        if (!this.isJumping || (this.jumpCount < this.maxJumps)) {
            this.velocityY = -15;
            this.isJumping = true;
            this.jumpCount++;
        }
    }

    attack() {
        const currentTime = Date.now();
        if (!this.isAttacking && this.stamina >= 15 && this.attackCooldown <= 0) {
            this.isAttacking = true;
            this.stamina -= 15; // Reduced from 20 to 15
            this.attackAngle = -Math.PI / 4;
            this.attackDuration = 0;
            this.attackCooldown = 45; // Increased from 30 to 45 (0.75 seconds cooldown)

            if (currentTime - this.lastAttackTime < 500) {
                this.comboCount++;
            } else {
                this.comboCount = 0;
            }
            this.lastAttackTime = currentTime;
        }
    }

    block() {
        if (!this.isBlocking && this.stamina >= 10 && this.blockRechargeTime === 0) {
            this.isBlocking = true;
            this.stamina -= 10;
            this.blockDuration = this.maxBlockDuration;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }

    updatePowerUp() {
        if (this.powerUp) {
            this.powerUpDuration--;
            if (this.powerUpDuration <= 0) {
                if (this.powerUp === 'speed') {
                    this.speed = 5;
                }
                this.powerUp = null;
            }
        }
    }

    update(canvasWidth, canvasHeight) {
        // Apply horizontal movement
        this.x += this.velocityX;

        // Apply gravity
        this.velocityY += 0.8;
        this.y += this.velocityY;

        // Keep player within horizontal bounds
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;

        // Keep player above ground level
        if (this.y > this.groundLevel) {
            this.y = this.groundLevel;
            this.velocityY = 0;
            this.isJumping = false;
            this.jumpCount = 0;
        }

        // Regenerate stamina
        if (this.stamina < 100) {
            this.stamina += 0.5;
        }

        if (this.wallJumpCooldown > 0) {
            this.wallJumpCooldown--;
        }

        // Update attack animation
        if (this.isAttacking) {
            this.attackDuration += 1;
            this.attackAngle += Math.PI / 16;
            if (this.attackDuration >= 10) {
                this.isAttacking = false;
                this.attackDuration = 0;
            }
        }

        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.blockCooldown > 0) this.blockCooldown--;
        if (this.isBlocking) {
            this.blockCooldown--;
            if (this.blockCooldown <= 0) this.isBlocking = false;
        }

        // Update blocking
        if (this.isBlocking) {
            this.blockDuration--;
            if (this.blockDuration <= 0) {
                this.isBlocking = false;
                this.blockRechargeTime = this.maxBlockRechargeTime;
            }
        } else if (this.blockRechargeTime > 0) {
            this.blockRechargeTime--;
        }

        this.updatePowerUp();
    }

    draw(ctx) {
        // Draw player body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw head
        ctx.fillStyle = 'beige';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 15, 15, 0, Math.PI * 2);
        ctx.fill();

        // Draw eyes
        ctx.fillStyle = 'black';
        const eyeX = this.facingRight ? 5 : -5;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 + eyeX, this.y + 12, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw armor
        ctx.fillStyle = 'darkgray';
        ctx.fillRect(this.x + 5, this.y + 30, this.width - 10, 40);

        // Draw sword or bow
        if (this instanceof Archer) {
            // Draw bow
            ctx.strokeStyle = 'brown';
            ctx.lineWidth = 3;
            ctx.beginPath();
            if (this.facingRight) {
                ctx.arc(this.x + this.width, this.y + this.height / 2, 20, Math.PI / 2, -Math.PI / 2);
            } else {
                ctx.arc(this.x, this.y + this.height / 2, 20, -Math.PI / 2, Math.PI / 2);
            }
            ctx.stroke();
        } else if (this.isAttacking) {
            // Draw sword
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            if (!this.facingRight) ctx.scale(-1, 1);
            ctx.rotate(this.attackAngle);
            ctx.fillStyle = 'silver';
            ctx.fillRect(0, -this.swordWidth / 2, this.swordLength, this.swordWidth);
            ctx.fillStyle = 'gold';
            ctx.fillRect(0, -this.swordWidth / 2, 10, this.swordWidth);
            ctx.restore();
        }

        // Draw shield
        ctx.fillStyle = 'brown';
        ctx.strokeStyle = 'gold';
        ctx.lineWidth = 2;
        const shieldWidth = 30;
        const shieldHeight = 50;
        const shieldX = this.facingRight ? this.x + this.width : this.x - shieldWidth;
        const shieldY = this.y + 25;
        
        if (this.isBlocking) {
            ctx.fillRect(shieldX, shieldY, shieldWidth, shieldHeight);
            ctx.strokeRect(shieldX, shieldY, shieldWidth, shieldHeight);
        } else {
            // Draw a smaller shield on the back when not blocking
            const backShieldWidth = 20;
            const backShieldHeight = 35;
            const backShieldX = this.facingRight ? this.x : this.x + this.width - backShieldWidth;
            const backShieldY = this.y + 30;
            ctx.fillRect(backShieldX, backShieldY, backShieldWidth, backShieldHeight);
            ctx.strokeRect(backShieldX, backShieldY, backShieldWidth, backShieldHeight);
        }

        // Draw health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y - 20, this.width, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y - 20, this.width * (this.health / 100), 5);

        // Draw stamina bar
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y - 15, this.width, 5);
        ctx.fillStyle = 'orange';
        ctx.fillRect(this.x, this.y - 15, this.width * (this.stamina / 100), 5);

        // Draw power-up indicator
        if (this.powerUp) {
            ctx.fillStyle = this.powerUp === 'speed' ? 'lightblue' : 'orange';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y - 30, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw score
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${this.score}`, this.x, this.y - 40);

        // Draw block cooldown indicator
        if (this.blockRechargeTime > 0) {
            ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
            const cooldownHeight = (this.blockRechargeTime / this.maxBlockRechargeTime) * this.height;
            ctx.fillRect(this.x, this.y + this.height - cooldownHeight, 5, cooldownHeight);
        }
    }
}

class Archer extends Player {
    constructor(x, y, color, isHuman) {
        super(x, y, color, isHuman);
        this.arrowSpeed = 8; // Reduced from 10 to 8
        this.arrows = [];
        this.aimAngle = 0;
    }

    aim(direction) {
        if (direction === 'up') {
            this.aimAngle = Math.max(this.aimAngle - Math.PI / 18, -Math.PI / 3);
        } else if (direction === 'down') {
            this.aimAngle = Math.min(this.aimAngle + Math.PI / 18, Math.PI / 3);
        }
    }

    attack() {
        if (this.stamina >= 8 && this.attackCooldown <= 0) {
            this.stamina -= 8; // Reduced from 10 to 8
            this.attackCooldown = 45; // Increased from 30 to 45 (0.75 seconds cooldown)
            const arrow = {
                x: this.x + (this.facingRight ? this.width : 0),
                y: this.y + this.height / 2,
                speed: this.arrowSpeed,
                angle: this.aimAngle + (this.facingRight ? 0 : Math.PI),
                width: 20,
                height: 5
            };
            this.arrows.push(arrow);
        }
    }

    update(canvasWidth, canvasHeight) {
        super.update(canvasWidth, canvasHeight);
        this.arrows = this.arrows.filter(arrow => {
            arrow.x += arrow.speed * Math.cos(arrow.angle);
            arrow.y += arrow.speed * Math.sin(arrow.angle);
            return arrow.x > 0 && arrow.x < canvasWidth && arrow.y > 0 && arrow.y < canvasHeight;
        });
    }

    draw(ctx) {
        super.draw(ctx);
        
        // Draw bow and aiming line
        ctx.strokeStyle = 'brown';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const bowX = this.facingRight ? this.x + this.width : this.x;
        const bowY = this.y + this.height / 2;
        ctx.arc(bowX, bowY, 20, this.aimAngle - Math.PI / 4, this.aimAngle + Math.PI / 4);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.moveTo(bowX, bowY);
        ctx.lineTo(bowX + Math.cos(this.aimAngle + (this.facingRight ? 0 : Math.PI)) * 50,
                   bowY + Math.sin(this.aimAngle + (this.facingRight ? 0 : Math.PI)) * 50);
        ctx.stroke();

        // Draw arrows
        ctx.fillStyle = 'brown';
        this.arrows.forEach(arrow => {
            ctx.save();
            ctx.translate(arrow.x, arrow.y);
            ctx.rotate(arrow.angle);
            ctx.fillRect(0, -arrow.height / 2, arrow.width, arrow.height);
            ctx.restore();
        });
    }
}