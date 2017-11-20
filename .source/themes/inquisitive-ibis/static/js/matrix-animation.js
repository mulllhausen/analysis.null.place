// code to run a matrix-lookalike in a <canvas>

// we use a lot of variables between functions, so keep them out of the global
// scope with a closure
(function() {
    // init vars
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var canvas2 = document.getElementById('canvas2');
    var ctx2 = canvas2.getContext('2d');
    var cw = 300;
    var ch = 200;
    var charArr = ['杕','丁','丂','七','丄','丅','丆','万','丈','三','上','下','丌','不','与','丏','丐','丑','丒','专','且','丕','世','丗','丘','丙','业'];
    var maxCharCount = 100;
    var fallingCharArr = [];
    var fontSize = 12;
    var font = 'bold ' + fontSize + 'px monospace';

    var maxColums = cw/(fontSize);

    // init each canvas
    canvas.width = canvas2.width = cw;
    canvas.height = canvas2.height = ch;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, cw, ch);
    ctx2.fillStyle = 'black';
    ctx2.fillRect(0, 0, cw, ch);

    function RandomInt(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    function RandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    function FatRandomFloat(min, max, fatness) {
        var x = fatness * RandomFloat(min, max);
        if (x > max) return max;
        if (x < min) return min;
        return x;
    }

    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    Point.prototype.draw = function(ctx) {
        //randomly skip 1/10 of the columns every frame
        if (RandomFloat(0, 10) < 1) return;

        this.value = charArr[RandomInt(0, charArr.length - 1)];
        if (this.speed == null) this.speed = RandomFloat(1, 10);
        if (this.maxY == null) this.maxY = FatRandomFloat(ch/4, ch, 2);

        ctx2.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx2.font = font;
        ctx2.fillText(this.value, this.x, this.y);

        ctx.fillStyle = '#0F0';
        ctx.font = font;
        ctx.fillText(this.value, this.x, this.y);

        this.y += this.speed;
        if (this.y > this.maxY) {
            this.y = RandomFloat(-ch/4, 0);
            this.speed = RandomFloat(1, 10);
            this.maxY = FatRandomFloat(ch/4, ch, 2);
        }
    }

    // initialize all points
    for (var i = 0; i < maxColums ; i++) {
        fallingCharArr.push(new Point(i * fontSize, RandomFloat(-ch/4, 0)));
    }

    var update = function() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, cw, ch);
        ctx2.clearRect(0, 0, cw, ch);

        var i = fallingCharArr.length;
        while (i--) {
            fallingCharArr[i].draw(ctx);
            var v = fallingCharArr[i];
        }
        setTimeout(function() {
            requestAnimationFrame(update);
        }, 100);
    }
    update();
})();
