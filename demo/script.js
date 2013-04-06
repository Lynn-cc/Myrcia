// call demo
(function() {

    var canvas = document.getElementById('c');

    if (c = canvas.getContext('2d')) {

        var mc = new Myrcia();

        // create the config object
        var config = (function() {

            var bg = new Image();
            bg.src = './bg.jpg';

            return {
                canvas: canvas,
                bg: {
                    img: bg
                },
                direction: 'left',
                samples : [{
                    class: House,
                    rate: .3
                }]
            };
        })();

        mc.init(config);
        var times = 0;
        var direc = ['left', 'right', 'up', 'down'];
        setInterval(function() {
            mc.setDirection(direc[times]);
            times = (times + 1) % 4
        }, 1000);
    }
})();


// House sample
// Api of a sample class:
// { Function } init(origin) essential
// { Function } draw(ctx) essential
// { Object } shape optional
// { Function } range(data) optional
function House() {
    
    var random = Myrcia.random,
    randomColor = Myrcia.randomColor;

    /**
     * origin
     *      @...@a      .     .
     *      .  /  \     :     :
     *      . /    \    : 60% :
     *     b@/_@____\@c _     :height
     *        d|  |     : 40% :
     *         |__|     :     :
     *         ....
     *         60%
     *       .........
     *        width
     **/
    var width, height, a, b, c, d, color1, color2,
    size = {
        w: { min: 80, max: 160 },
        h: { min: 100, max: 200 }
    };

    /**
     * @public
     * @param { Object } (see the graph above)
     **/
    this.init = function(origin) {
        width = random(size.w.min, size.w.max);
        height = random(size.h.min, size.h.max);
        a = { x: origin.x + width / 2, y: origin.y };
        b = { x: a.x - width / 2, y: a.y + height * .6 };
        c = { x: b.x + width, y: b.y };
        d = { x: b.x + width * .2, y: b.y };
        color1 = randomColor();
        color2 = randomColor();
    };

    /**
     * the drawing process
     * @public
     * @param { Object } the context object
     **/
    this.draw = function(ctx) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.fillStyle = color1;
        ctx.fill();
        ctx.fillStyle = color2;
        ctx.fillRect(d.x, d.y, width * .6, height * .4);
    };

    
    /**
     * a rect that always covers up this sample
     * @public
     **/
    this.shape = {
        width: size.w.max,
        height: size.h.max
    };

    /**
     * modify the area of the random origin point for the init method (optional)
     * @public
     * @param { Object } a map with keys: x, y, width, height
     * @return { Object } a revised map
     **/
    this.range = function(data) {
        return {
            x: data.x,
            y: data.y + data.height - size.h.max * 1.2,
            width: data.width,
            height: size.h.max * .5
        };
    };
};

