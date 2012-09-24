function Myrcia() {
    var self = this,

    // the canvas element
    _canvas = null, 

    /** @const */
    CANVAS_WIDTH,

    /** @const */
    CANVAS_HEIGHT,

    // drawing background method
    _backgroundDraw,

    // the samples' classes
    _samples,

    // the instances of the _samples which need to draw in current frame
    _objects = [],

    // the method to move the picture
    _movePic,

    // setInterval object
    _animate = null,

    // the animate's interval
    _interval = 20,

    // the origin point or how far the picture moved
    _point = { x: 0, y: 0 },

    // The direction of picture moving, default is 'left'
    _direction = 'left';

    /**
     * create the samples objects in random
     * @private
     **/
    function _create() {

        Myrcia.each(_samples, function(o, i) {
            var obj, range, pos = {};
            if (Myrcia.random(1000) / _interval < o.rate) {
                obj = new o.class();
                range = {
                    x: _point.x,
                    y: _point.y,
                    width: CANVAS_WIDTH,
                    height: CANVAS_HEIGHT
                };
                range = obj.range ? obj.range(range) : range;

                pos.x = Myrcia.random(range.width) + range.x;
                pos.y = Myrcia.random(range.height) + range.y;

                obj.init(pos);
                obj.pos = pos;

                _objects.push(obj);
            }
        });
    }

    /**
     * drawing in every frame
     * at the same time, remove the objects out of boundary (saving one loop)
     * @private
     **/
    function _frameDraw() {
        var temp = [];

        c.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _draw(_backgroundDraw);

        Myrcia.each(_objects, function(o, i) {
            if (_inRange(o)) {
                temp.push(o);
                _draw(function() {
                    c.translate(-_point.x, -_point.y);
                    o.draw(c);
                });
            }
        });

        _objects = temp;

        // reset the _point to (0, 0) when the _objects is empty
        if (_objects.length === 0 &&
            ((Math.abs(_point.x) > CANVAS_WIDTH) ||
             (Math.abs(_point.y) > CANVAS_HEIGHT) )) {

            _point = { x: 0, y: 0 };
        }
    }

    /**
     * settings for the next frame
     * @private
     **/
    function _next() {
        _movePic();
    }

    /**
     * return true if the sample object is inside the canvas
     * @private
     * @return { Boolean }
     *
     * (0, 0)
     *   @----------------------------------> x
     *   |
     *   |          .........CANVAS_WIDTH..........
     *   |  (px, py)@--------------------|  .
     *   |          |   (ox, oy)         |  :
     *   |          |       @_____ .     |  :
     *   |          |       |    | : oh  |  : CANVAS_HEIGHT
     *   |          |       |____| :     |  :
     *   |          |       ..ow..       |  :
     *   |          |--------------------|  .
     *   v
     *   y
     **/
    function _inRange(o) {
        var ox = o.pos.x, oy = o.pos.y,
        ow = o.shape ? o.shape.width : CANVAS_WIDTH,
        oh = o.shape ? o.shape.height : CANVAS_HEIGHT,
        pw = CANVAS_WIDTH, ph = CANVAS_HEIGHT,
        px = _point.x, py = _point.y;
        return (Math.abs((ox + .5 * ow) - (px + .5 * pw)) < .5 * (ow + pw)) &&
            (Math.abs((oy + .5 * oh) - (py + .5 * ph)) < .5 * (oh + ph));
    }

    /**
     * initialize the private methods
     * @private
     * @param { Object } some data to initialize private attributes
     **/
    function _initFunc(data) {
        try {
            _samples = data.samples || _samples;
            if (_samples.length === 0) {
                throw 'no sample';
            }
        } catch (e) {
            console.log('Missing parameters: ' + e);
        }

        _direction = data.direction || 'left';

        setDirection(_direction);
    }

    /**
     * @public
     * @param { Object }
     * @example
     *          {
     *               bg : {              // the background
     *                   color: 'blue'
     *               },
     *               direction: 'left',  // the moving direction
     *               samples: [{         // the sample classes
     *                   class: House,   // class name
     *                   rate: .2        // the frequency of occurrence
     *               }, {
     *                   class: Tree,
     *                   rate: .6
     *               }]
     *           }
     **/
    self.init = function(data) {

        try {
            _canvas = data.canvas;
            CANVAS_WIDTH = _canvas.width,
            CANVAS_HEIGHT = _canvas.height;
        } catch (e) {
            console.log('Missing parameters: canvas');
        }

        setBG(data.bg).start().addEventListener('success', function() {
            _initFunc(data);
            _animate = setInterval(function() {
                _create();
                _frameDraw();
                _next();
            }, _interval);
        });
    };

    var setBG = eval(Wind.compile('async', function(data) {
        if (data) {
            if (data.img) {
                $await(Wind.Async.onEvent(data.img, 'load'));
                _backgroundDraw = function() {
                    c.drawImage(data.img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                };

            } else if (data.color) {
                _backgroundDraw = function() {
                    c.fillStyle = data.color;
                    c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                };
            }
        } else {
            _backgroundDraw = function() {
                c.fillStyle = '#7DB9FF';
                c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            };
        }
    }));

    /**
     * make the draw methods in a saving environment
     * @private
     * @param { Function } a drawing process
     **/
    function _draw(fn) {
        c.save();
        try {
            fn();
        } catch(e) {
            console.log('error drawing: ' + e);
        }
        c.restore();
    }

    /**
    * set the moving direction of the picture
    * @public
    * @param { String } 'left', 'right', 'up' or 'down'
     **/
    function setDirection(direc) {
        if (direc != _direction || !_movePic) {
            switch (direc) {
                case 'left' :
                    _movePic = function() { ++_point.x; };
                break;
                case 'right' :
                    _movePic = function() { --_point.x; };
                break;
                case 'up' :
                    _movePic =  function() { ++_point.y; };
                break;
                case 'down' :
                    _movePic = function() { --_point.y; };
                break;
            }
        }
    }

    self.setDirection = setDirection;

}

/**
 * return a random number
 * @static
 * @param { Number } optional
 * @param { Number } optional
 * if no argument  : return a float in [0, 1)
 * if one argument : return a integer in [0, a]
 * if two arguments: return a integer in [a, b]
 **/
Myrcia.random = function(a, b) {
    var randnum = Math.random();
    if (arguments.length === 1) {
        return Math.floor(randnum * (a + 1));
    } else if (arguments.length === 2) {
        return Math.floor(randnum * (b - a + 1) + a);
    } else {
        return randnum;
    }
};

/**
 * a random color string
 * @static
 * @return { String } such as "#cf93a8"
 **/
Myrcia.randomColor = function() {
    var arr = '0123456789ABCDEF'.split(''),
    color = [],
    i, n;
    for (i = 0; i < 6; i++) {
        n = Myrcia.random(15);
        color[i] = arr[n];
    }
    return '#' + color.join('');
};

/**
 * traverse a map or a array
 * @static
 * @param { Object } the map or  array to traverse
 * @param { Function } the handler, with two parameters: current obj and key/number
 **/
Myrcia.each = function(obj, fn) {
    if (obj) {
        if (obj instanceof Array && obj.length > 0) {
            for (var i = 0; i < obj.length; ++i) {
                fn(obj[i], i);
            }
        } else {
            for (var key in obj) {
                fn(obj[key], key);
            }
        }
    }
};
