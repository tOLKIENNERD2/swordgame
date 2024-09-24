function initObstacles(canvasWidth, canvasHeight, level) {
    switch (level) {
        case 1:
            return [
                new Obstacle(100, canvasHeight - 200, 200, 20),
                new Obstacle(400, canvasHeight - 300, 200, 20),
                new Obstacle(700, canvasHeight - 400, 200, 20)
            ];
        case 2:
            return [
                new Obstacle(200, canvasHeight - 250, 150, 20),
                new Obstacle(500, canvasHeight - 350, 150, 20),
                new Obstacle(800, canvasHeight - 450, 150, 20),
                new Obstacle(300, canvasHeight - 150, 100, 300),
                new Obstacle(700, canvasHeight - 200, 100, 200)
            ];
        default:
            return []; // Return an empty array for any undefined levels
    }
}