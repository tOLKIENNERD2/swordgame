class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        ctx.fillStyle = 'gray';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

function initObstacles(canvasWidth, canvasHeight) {
    // Example obstacle initialization
    return [
        new Obstacle(100, canvasHeight - 200, 200, 20),
        new Obstacle(400, canvasHeight - 300, 200, 20),
        new Obstacle(700, canvasHeight - 400, 200, 20)
    ];
}