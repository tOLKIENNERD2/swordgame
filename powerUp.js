class PowerUp {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.type = Math.random() < 0.5 ? 'speed' : 'strength';
        this.radius = 10;
    }

    draw(ctx) {
        ctx.fillStyle = this.type === 'speed' ? 'lightblue' : 'orange';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}