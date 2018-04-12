// code to run a matrix-movie animation in a <canvas>

function init_all_matrix_canvases(green_text_canvas_class_name, white_text_canvas_class_name) {
    var green_text_canvases = document.querySelectorAll(green_text_canvas_class_name);
    var white_text_canvases = document.querySelectorAll(white_text_canvas_class_name);
    for (var i = 0; i < green_text_canvases.length; i++) {
        init_matrix_canvas(green_text_canvases[i], white_text_canvases[i]);
    }
}

// we use a lot of variables between functions, so keep them out of the global
// scope with a closure
function init_matrix_canvas(green_text_canvas, white_text_canvas) {
    // clear old canvases so only 1 animation can run at a time
    if (green_text_canvas.hasOwnProperty('animation_id')) {
        cancelAnimationFrame(green_text_canvas.animation_id);
    }

    // exit if this canvas is not visible.
    // this way we can call this function every page resize and hide the canvas
    // if it becomes invisible to prevent unnecessary cpu load
    function is_hidden(el) {
        return (el.offsetParent === null);
    }
    if (is_hidden(green_text_canvas)) return;

    // init vars
    var green_text_ctx = green_text_canvas.getContext('2d');
    var white_text_ctx = white_text_canvas.getContext('2d');
    var cw = 300;
    var ch = 200;
    var charArr = ['杕','の','丂','七','丄','当','次','万','丈','三','国','下',
    '丌','不','与','丏','よ','丑','丒','专','且','丕','世','丗','丘','丙','业'];
    var fallingCharArr = [];

    // we want (canvas.width, fontsize) = (42px, 30) = (270px, 16)
    // so plot a line, using www.mathportal.org/calculators/analytic-geometry/two-point-form-calculator.php
    var fontSize = (619 / 19) - (7 * green_text_canvas.scrollWidth / 114);
    var font = 'bold ' + fontSize + 'px monospace';

    var maxColumns = cw / fontSize;

    // init each canvas
    green_text_canvas.width = white_text_canvas.width = cw;
    green_text_canvas.height = white_text_canvas.height = ch;
    green_text_ctx.fillStyle = 'black';
    green_text_ctx.fillRect(0, 0, cw, ch);
    white_text_ctx.fillStyle = 'black';
    white_text_ctx.fillRect(0, 0, cw, ch);

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

    Point.prototype.draw = function() {
        //randomly skip 1/10 of the columns every frame
        if (RandomFloat(0, 10) < 1) return;

        this.value = charArr[RandomInt(0, charArr.length - 1)];
        if (this.speed == null) this.speed = RandomFloat(1, 10);
        if (this.maxY == null) this.maxY = FatRandomFloat(ch/4, ch, 2);

        white_text_ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        white_text_ctx.font = font;
        white_text_ctx.fillText(this.value, this.x, this.y);

        green_text_ctx.fillStyle = 'green';
        green_text_ctx.font = font;
        green_text_ctx.fillText(this.value, this.x, this.y);

        this.y += this.speed;
        if (this.y > this.maxY) {
            this.y = RandomFloat(-ch/4, 0);
            this.speed = RandomFloat(1, 10);
            this.maxY = FatRandomFloat(ch/4, ch, 2);
        }
    }

    // initialize all points
    for (var i = 0; i < maxColumns; i++) {
        fallingCharArr.push(new Point(i * fontSize, RandomFloat(-ch/4, 0)));
    }

    var freq_counter = 0;
    function update() {
        // queue up to re-run on next screen paint
        green_text_ctx.canvas.animation_id = requestAnimationFrame(update);

        // requestAnimationFrame runs at 60fps. make it 6fps = every 100ms
        freq_counter++;
        if (freq_counter < 6) return;
        freq_counter = 0;

        green_text_ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        green_text_ctx.fillRect(0, 0, cw, ch);
        white_text_ctx.clearRect(0, 0, cw, ch);

        for (var i = 0; i < maxColumns; i++) {
            fallingCharArr[i].draw();
        }
    }
    green_text_ctx.canvas.animation_id = requestAnimationFrame(update);
}
