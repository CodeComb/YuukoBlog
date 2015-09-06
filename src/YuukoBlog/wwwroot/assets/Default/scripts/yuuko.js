/* NProgress, (c) 2013, 2014 Rico Sta. Cruz - http://ricostacruz.com/nprogress
 * @license MIT */

; (function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.NProgress = factory();
    }

})(this, function () {
    var NProgress = {};

    NProgress.version = '0.1.6';

    var Settings = NProgress.settings = {
        minimum: 0.08,
        easing: 'ease',
        positionUsing: '',
        speed: 200,
        trickle: true,
        trickleRate: 0.02,
        trickleSpeed: 800,
        showSpinner: true,
        barSelector: '[role="bar"]',
        spinnerSelector: '[role="spinner"]',
        parent: 'body',
        template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
    };

    /**
     * Updates configuration.
     *
     *     NProgress.configure({
     *       minimum: 0.1
     *     });
     */
    NProgress.configure = function (options) {
        var key, value;
        for (key in options) {
            value = options[key];
            if (value !== undefined && options.hasOwnProperty(key)) Settings[key] = value;
        }

        return this;
    };

    /**
     * Last number.
     */

    NProgress.status = null;

    /**
     * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
     *
     *     NProgress.set(0.4);
     *     NProgress.set(1.0);
     */

    NProgress.set = function (n) {
        var started = NProgress.isStarted();

        n = clamp(n, Settings.minimum, 1);
        NProgress.status = (n === 1 ? null : n);

        var progress = NProgress.render(!started),
            bar = progress.querySelector(Settings.barSelector),
            speed = Settings.speed,
            ease = Settings.easing;

        progress.offsetWidth; /* Repaint */

        queue(function (next) {
            // Set positionUsing if it hasn't already been set
            if (Settings.positionUsing === '') Settings.positionUsing = NProgress.getPositioningCSS();

            // Add transition
            css(bar, barPositionCSS(n, speed, ease));

            if (n === 1) {
                // Fade out
                css(progress, {
                    transition: 'none',
                    opacity: 1
                });
                progress.offsetWidth; /* Repaint */

                setTimeout(function () {
                    css(progress, {
                        transition: 'all ' + speed + 'ms linear',
                        opacity: 0
                    });
                    setTimeout(function () {
                        NProgress.remove();
                        next();
                    }, speed);
                }, speed);
            } else {
                setTimeout(next, speed);
            }
        });

        return this;
    };

    NProgress.isStarted = function () {
        return typeof NProgress.status === 'number';
    };

    /**
     * Shows the progress bar.
     * This is the same as setting the status to 0%, except that it doesn't go backwards.
     *
     *     NProgress.start();
     *
     */
    NProgress.start = function () {
        if (!NProgress.status) NProgress.set(0);

        var work = function () {
            setTimeout(function () {
                if (!NProgress.status) return;
                NProgress.trickle();
                work();
            }, Settings.trickleSpeed);
        };

        if (Settings.trickle) work();

        return this;
    };

    /**
     * Hides the progress bar.
     * This is the *sort of* the same as setting the status to 100%, with the
     * difference being `done()` makes some placebo effect of some realistic motion.
     *
     *     NProgress.done();
     *
     * If `true` is passed, it will show the progress bar even if its hidden.
     *
     *     NProgress.done(true);
     */

    NProgress.done = function (force) {
        if (!force && !NProgress.status) return this;

        return NProgress.inc(0.3 + 0.5 * Math.random()).set(1);
    };

    /**
     * Increments by a random amount.
     */

    NProgress.inc = function (amount) {
        var n = NProgress.status;

        if (!n) {
            return NProgress.start();
        } else {
            if (typeof amount !== 'number') {
                amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
            }

            n = clamp(n + amount, 0, 0.994);
            return NProgress.set(n);
        }
    };

    NProgress.trickle = function () {
        return NProgress.inc(Math.random() * Settings.trickleRate);
    };

    /**
     * Waits for all supplied jQuery promises and
     * increases the progress as the promises resolve.
     * 
     * @param $promise jQUery Promise
     */
    (function () {
        var initial = 0, current = 0;

        NProgress.promise = function ($promise) {
            if (!$promise || $promise.state() == "resolved") {
                return this;
            }

            if (current == 0) {
                NProgress.start();
            }

            initial++;
            current++;

            $promise.always(function () {
                current--;
                if (current == 0) {
                    initial = 0;
                    NProgress.done();
                } else {
                    NProgress.set((initial - current) / initial);
                }
            });

            return this;
        };

    })();

    /**
     * (Internal) renders the progress bar markup based on the `template`
     * setting.
     */

    NProgress.render = function (fromStart) {
        if (NProgress.isRendered()) return document.getElementById('nprogress');

        addClass(document.documentElement, 'nprogress-busy');

        var progress = document.createElement('div');
        progress.id = 'nprogress';
        progress.innerHTML = Settings.template;

        var bar = progress.querySelector(Settings.barSelector),
            perc = fromStart ? '-100' : toBarPerc(NProgress.status || 0),
            parent = document.querySelector(Settings.parent),
            spinner;

        css(bar, {
            transition: 'all 0 linear',
            transform: 'translate3d(' + perc + '%,0,0)'
        });

        if (!Settings.showSpinner) {
            spinner = progress.querySelector(Settings.spinnerSelector);
            spinner && removeElement(spinner);
        }

        if (parent != document.body) {
            addClass(parent, 'nprogress-custom-parent');
        }

        parent.appendChild(progress);
        return progress;
    };

    /**
     * Removes the element. Opposite of render().
     */

    NProgress.remove = function () {
        removeClass(document.documentElement, 'nprogress-busy');
        removeClass(document.querySelector(Settings.parent), 'nprogress-custom-parent')
        var progress = document.getElementById('nprogress');
        progress && removeElement(progress);
    };

    /**
     * Checks if the progress bar is rendered.
     */

    NProgress.isRendered = function () {
        return !!document.getElementById('nprogress');
    };

    /**
     * Determine which positioning CSS rule to use.
     */

    NProgress.getPositioningCSS = function () {
        // Sniff on document.body.style
        var bodyStyle = document.body.style;

        // Sniff prefixes
        var vendorPrefix = ('WebkitTransform' in bodyStyle) ? 'Webkit' :
                           ('MozTransform' in bodyStyle) ? 'Moz' :
                           ('msTransform' in bodyStyle) ? 'ms' :
                           ('OTransform' in bodyStyle) ? 'O' : '';

        if (vendorPrefix + 'Perspective' in bodyStyle) {
            // Modern browsers with 3D support, e.g. Webkit, IE10
            return 'translate3d';
        } else if (vendorPrefix + 'Transform' in bodyStyle) {
            // Browsers without 3D support, e.g. IE9
            return 'translate';
        } else {
            // Browsers without translate() support, e.g. IE7-8
            return 'margin';
        }
    };

    /**
     * Helpers
     */

    function clamp(n, min, max) {
        if (n < min) return min;
        if (n > max) return max;
        return n;
    }

    /**
     * (Internal) converts a percentage (`0..1`) to a bar translateX
     * percentage (`-100%..0%`).
     */

    function toBarPerc(n) {
        return (-1 + n) * 100;
    }


    /**
     * (Internal) returns the correct CSS for changing the bar's
     * position given an n percentage, and speed and ease from Settings
     */

    function barPositionCSS(n, speed, ease) {
        var barCSS;

        if (Settings.positionUsing === 'translate3d') {
            barCSS = { transform: 'translate3d(' + toBarPerc(n) + '%,0,0)' };
        } else if (Settings.positionUsing === 'translate') {
            barCSS = { transform: 'translate(' + toBarPerc(n) + '%,0)' };
        } else {
            barCSS = { 'margin-left': toBarPerc(n) + '%' };
        }

        barCSS.transition = 'all ' + speed + 'ms ' + ease;

        return barCSS;
    }

    /**
     * (Internal) Queues a function to be executed.
     */

    var queue = (function () {
        var pending = [];

        function next() {
            var fn = pending.shift();
            if (fn) {
                fn(next);
            }
        }

        return function (fn) {
            pending.push(fn);
            if (pending.length == 1) next();
        };
    })();

    /**
     * (Internal) Applies css properties to an element, similar to the jQuery 
     * css method.
     *
     * While this helper does assist with vendor prefixed property names, it 
     * does not perform any manipulation of values prior to setting styles.
     */

    var css = (function () {
        var cssPrefixes = ['Webkit', 'O', 'Moz', 'ms'],
            cssProps = {};

        function camelCase(string) {
            return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function (match, letter) {
                return letter.toUpperCase();
            });
        }

        function getVendorProp(name) {
            var style = document.body.style;
            if (name in style) return name;

            var i = cssPrefixes.length,
                capName = name.charAt(0).toUpperCase() + name.slice(1),
                vendorName;
            while (i--) {
                vendorName = cssPrefixes[i] + capName;
                if (vendorName in style) return vendorName;
            }

            return name;
        }

        function getStyleProp(name) {
            name = camelCase(name);
            return cssProps[name] || (cssProps[name] = getVendorProp(name));
        }

        function applyCss(element, prop, value) {
            prop = getStyleProp(prop);
            element.style[prop] = value;
        }

        return function (element, properties) {
            var args = arguments,
                prop,
                value;

            if (args.length == 2) {
                for (prop in properties) {
                    value = properties[prop];
                    if (value !== undefined && properties.hasOwnProperty(prop)) applyCss(element, prop, value);
                }
            } else {
                applyCss(element, args[1], args[2]);
            }
        }
    })();

    /**
     * (Internal) Determines if an element or space separated list of class names contains a class name.
     */

    function hasClass(element, name) {
        var list = typeof element == 'string' ? element : classList(element);
        return list.indexOf(' ' + name + ' ') >= 0;
    }

    /**
     * (Internal) Adds a class to an element.
     */

    function addClass(element, name) {
        var oldList = classList(element),
            newList = oldList + name;

        if (hasClass(oldList, name)) return;

        // Trim the opening space.
        element.className = newList.substring(1);
    }

    /**
     * (Internal) Removes a class from an element.
     */

    function removeClass(element, name) {
        var oldList = classList(element),
            newList;

        if (!hasClass(element, name)) return;

        // Replace the class name.
        newList = oldList.replace(' ' + name + ' ', ' ');

        // Trim the opening and closing spaces.
        element.className = newList.substring(1, newList.length - 1);
    }

    /**
     * (Internal) Gets a space separated list of the class names on the element. 
     * The list is wrapped with a single space on each end to facilitate finding 
     * matches within the list.
     */

    function classList(element) {
        return (' ' + (element.className || '') + ' ').replace(/\s+/gi, ' ');
    }

    /**
     * (Internal) Removes an element from the DOM.
     */

    function removeElement(element) {
        element && element.parentNode && element.parentNode.removeChild(element);
    }

    return NProgress;
});

/*!
 * jQuery.ScrollTo
 * Copyright (c) 2007-2014 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 * Licensed under MIT
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 * @projectDescription Easy element scrolling using jQuery.
 * @author Ariel Flesler
 * @version 1.4.9
 */

; (function (factory) {
    // AMD Support
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {

    var $scrollTo = $.scrollTo = function (target, duration, settings) {
        return $(window).scrollTo(target, duration, settings);
    };

    $scrollTo.defaults = {
        axis: 'xy',
        duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1,
        limit: true
    };

    // Returns the element that needs to be animated to scroll the window.
    // Kept for backwards compatibility (specially for localScroll & serialScroll)
    $scrollTo.window = function (scope) {
        return $(window)._scrollable();
    };

    // Hack, hack, hack :)
    // Returns the real elements to scroll (supports window/iframes, documents and regular nodes)
    $.fn._scrollable = function () {
        return this.map(function () {
            var elem = this,
                    isWin = !elem.nodeName || $.inArray(elem.nodeName.toLowerCase(), ['iframe', '#document', 'html', 'body']) != -1;

            if (!isWin)
                return elem;

            var doc = (elem.contentWindow || elem).document || elem.ownerDocument || elem;

            return /webkit/i.test(navigator.userAgent) || doc.compatMode == 'BackCompat' ?
                    doc.body :
                    doc.documentElement;
        });
    };

    $.fn.scrollTo = function (target, duration, settings) {
        if (typeof duration == 'object') {
            settings = duration;
            duration = 0;
        }
        if (typeof settings == 'function')
            settings = { onAfter: settings };

        if (target == 'max')
            target = 9e9;

        settings = $.extend({}, $scrollTo.defaults, settings);
        // Speed is still recognized for backwards compatibility
        duration = duration || settings.duration;
        // Make sure the settings are given right
        settings.queue = settings.queue && settings.axis.length > 1;

        if (settings.queue)
            // Let's keep the overall duration
            duration /= 2;
        settings.offset = both(settings.offset);
        settings.over = both(settings.over);

        return this._scrollable().each(function () {
            // Null target yields nothing, just like jQuery does
            if (target == null) return;

            var elem = this,
                    $elem = $(elem),
                    targ = target, toff, attr = {},
                    win = $elem.is('html,body');

            switch (typeof targ) {
                // A number will pass the regex
                case 'number':
                case 'string':
                    if (/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)) {
                        targ = both(targ);
                        // We are done
                        break;
                    }
                    // Relative selector, no break!
                    targ = $(targ, this);
                    if (!targ.length) return;
                case 'object':
                    // DOMElement / jQuery
                    if (targ.is || targ.style)
                        // Get the real position of the target
                        toff = (targ = $(targ)).offset();
            }

            var offset = $.isFunction(settings.offset) && settings.offset(elem, targ) || settings.offset;

            $.each(settings.axis.split(''), function (i, axis) {
                var Pos = axis == 'x' ? 'Left' : 'Top',
                        pos = Pos.toLowerCase(),
                        key = 'scroll' + Pos,
                        old = elem[key],
                        max = $scrollTo.max(elem, axis);

                if (toff) {// jQuery / DOMElement
                    attr[key] = toff[pos] + (win ? 0 : old - $elem.offset()[pos]);

                    // If it's a dom element, reduce the margin
                    if (settings.margin) {
                        attr[key] -= parseInt(targ.css('margin' + Pos)) || 0;
                        attr[key] -= parseInt(targ.css('border' + Pos + 'Width')) || 0;
                    }

                    attr[key] += offset[pos] || 0;

                    if (settings.over[pos])
                        // Scroll to a fraction of its width/height
                        attr[key] += targ[axis == 'x' ? 'width' : 'height']() * settings.over[pos];
                } else {
                    var val = targ[pos];
                    // Handle percentage values
                    attr[key] = val.slice && val.slice(-1) == '%' ?
                            parseFloat(val) / 100 * max
                            : val;
                }

                // Number or 'number'
                if (settings.limit && /^\d+$/.test(attr[key]))
                    // Check the limits
                    attr[key] = attr[key] <= 0 ? 0 : Math.min(attr[key], max);

                // Queueing axes
                if (!i && settings.queue) {
                    // Don't waste time animating, if there's no need.
                    if (old != attr[key])
                        // Intermediate animation
                        animate(settings.onAfterFirst);
                    // Don't animate this axis again in the next iteration.
                    delete attr[key];
                }
            });

            animate(settings.onAfter);

            function animate(callback) {
                $elem.animate(attr, duration, settings.easing, callback && function () {
                    callback.call(this, targ, settings);
                });
            };

        }).end();
    };

    // Max scrolling position, works on quirks mode
    // It only fails (not too badly) on IE, quirks mode.
    $scrollTo.max = function (elem, axis) {
        var Dim = axis == 'x' ? 'Width' : 'Height',
                scroll = 'scroll' + Dim;

        if (!$(elem).is('html,body'))
            return elem[scroll] - $(elem)[Dim.toLowerCase()]();

        var size = 'client' + Dim,
                html = elem.ownerDocument.documentElement,
                body = elem.ownerDocument.body;

        return Math.max(html[scroll], body[scroll])
                 - Math.min(html[size], body[size]);
    };

    function both(val) {
        return $.isFunction(val) || typeof val == 'object' ? val : { top: val, left: val };
    };

    // AMD requirement
    return $scrollTo;
}));

// Main
(function (window) {
    $(document).ready(initialize);
    $('#lstTemplate').change(function () {
        window.location = "/home/template?folder=" + $(this).val();
    });
    Highlight();
    window.mobileCheck = function () {
        var check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    }

    var LoadingAnimation = {

        flag: false,

        start: function () {
            LoadingAnimation.flag = false;
            NProgress.start();
        },

        done: function () {
            LoadingAnimation.flag = true;
            NProgress.set(0.5);
        },

        complete: function () {
            if (LoadingAnimation.flag) {
                NProgress.done();
            }
        }

    };

    function loadDynamic(url) {

        LoadingAnimation.start();

        jQuery.ajax({

            url: url,
            dataType: 'text',
            type: 'GET',
            data: {
                raw: 'true'
            },

            success: function (html) {

                CONFIG.URI = window.location.pathname + window.location.search;

                var $dom = $('<div>');
                $dom[0].innerHTML = html;

                // update title
                document.title = $dom.find('#raw_info .role-title').text();

                if (mobileCheck()) {
                    window.scrollTo(0, 0);

                    // update cover

                    // cover background
                    $('body').attr('class', 'body-' + $dom.find('#raw_info .role-body-class').text());
                    $('.page-header-li').removeClass('page-header-li-active');
                    $('.page-header-li-' + $dom.find('#raw_info .role-category').text()).addClass('page-header-li-active');

                    // cover title
                    var d = $('.page-title-content');
                    d.html($dom.find('#raw_info .role-head-title').html());

                    if ($('#disqus_thread').length > 0) {
                        DISQUS.reset({
                            reload: true
                        });
                    }

                } else {
                    // update scrolling
                    $(document).scrollTo({
                        left: 0,
                        top: 0
                    }, {
                        duration: 300
                    });

                    // update cover                
                    setTimeout(function () {

                        // cover background
                        $('body').attr('class', 'body-' + $dom.find('#raw_info .role-body-class').text());
                        $('.page-header-li').removeClass('page-header-li-active');
                        $('.page-header-li-' + $dom.find('#raw_info .role-category').text()).addClass('page-header-li-active');

                        // cover title
                        var d = $('.page-title-content').addClass('hide');
                        setTimeout(function () {
                            d.remove();
                            if ($('#disqus_thread').length > 0) {
                                DISQUS.reset({
                                    reload: true
                                });
                            }
                        }, 500);

                        var d2 = $('<div>').attr('class', 'page-title-content hide').append($dom.find('#raw_info .role-head-title').html()).appendTo('.page-title');
                        setTimeout(function () {
                            d2.removeClass('hide');
                        }, 10);

                    }, 300);
                }

                // replace content

                $('.page-content .grid_9').html('<div>&nbsp;</div>');
                var $left = $('<div>');
                $left[0].innerHTML = $dom.find('.grid_9').html();
                $left.hide().prependTo('.page-content .grid_9');

                $('.page-content .grid_3').html('<div>&nbsp;</div>');
                var $right = $('<div>');
                $right[0].innerHTML = $dom.find('.grid_3').html();
                $right.prependTo('.page-content .grid_3');

                setTimeout(function () {
                    $left.fadeIn(500);
                    Highlight();
                    prettyPrint();

                    if (LoadingAnimation.flag) {
                        NProgress.inc();
                    }

                    setTimeout(function () {
                        LoadingAnimation.complete();
                    }, 500);
                }, 300);

                LoadingAnimation.done();
                //LoadingAnimation.hide();
            },

            error: function () {

                window.location.href = url;

            }

        })

    }

    function initialize() {

        prettyPrint();

        // Change header bar style on scrolling
        var $header = $('.page-header-bar');

        if ($header.length > 0) {
            var offset = $('.page-content').offset().top - $header.outerHeight();
            var flag = false;

            if (!mobileCheck()) {
                $(window).scroll(function () {
                    if (window.scrollY >= offset) {
                        if (!flag) {
                            flag = true;
                            $header.addClass('page-header-bar-light');
                        }
                    } else {
                        if (flag) {
                            flag = false;
                            $header.removeClass('page-header-bar-light');
                        }
                    }
                });
            }
        }

        $(document).unbind().on('click', 'a', function (event) {

            // 1. links inside posts should be open in new window

            if ($(this).closest('.post-body').length > 0 || $(this).closest('.post-detail-body').length > 0) {
                $(this).attr('target', '_blank');
            }

            if ($(this).attr('yuuko-static') !== undefined) {
                return;
            }

            if ($(this).hasClass('yuuko-static')) {
                return;
            }

            // 2. links inside blog could be loaded dynamicly

            if (event.metaKey || event.ctrlKey || event.shiftKey) {
                // open in new tab/window: default behavior
                return;
            }

            if (typeof window.disableDynamicLoading != 'undefined') {
                return;
            }

            // check same domain
            var dest_url = $(this).prop('href');
            var cur_prefix = window.location.origin + CONFIG.Prefix + '/';

            if ((dest_url + '/').indexOf(cur_prefix) !== 0) {
                return;
            }

            window.history.pushState({ url: dest_url }, '', dest_url);
            loadDynamic(dest_url);

            event.preventDefault();
        });

        if (typeof window.disableDynamicLoading == 'undefined') {

            var popped = ('state' in window.history && window.history.state !== null), initialURL = location.href;

            setTimeout(function () {
                window.addEventListener('popstate', function (event) {
                    loadDynamic(window.location.href);
                }, false);
            }, 0);

        }

        window.bwblog_loaded = true;
        //LoadingAnimation.hide();

    }

})(window);


(function ($, window) {
    "use strict";

    var supported = (window.File && window.FileReader && window.FileList);

    /**
     * @options
     * @param action [string] "Where to submit uploads"
     * @param label [string] <'Drag and drop files or click to select'> "Dropzone text"
     * @param maxQueue [int] <2> "Number of files to simultaneously upload"
     * @param maxSize [int] <5242880> "Max file size allowed"
     * @param postData [object] "Extra data to post with upload"
     * @param postKey [string] <'file'> "Key to upload file as"
     */

    var options = {
        action: "",
        label: "Drag and drop files or click to select",
        maxQueue: 2,
        maxSize: 5242880, // 5 mb
        postData: {},
        postKey: "file"
    };

    /**
     * @events
     * @event start.dropper ""
     * @event complete.dropper ""
     * @event fileStart.dropper ""
     * @event fileProgress.dropper ""
     * @event fileComplete.dropper ""
     * @event fileError.dropper ""
     */

    var pub = {

        /**
         * @method
         * @name defaults
         * @description Sets default plugin options
         * @param opts [object] <{}> "Options object"
         * @example $.dropper("defaults", opts);
         */
        defaults: function (opts) {
            options = $.extend(options, opts || {});
            return $(this);
        }
    };

    /**
     * @method private
     * @name _init
     * @description Initializes plugin
     * @param opts [object] "Initialization options"
     */
    function _init(opts) {
        var $items = $(this);

        if (supported) {
            // Settings
            opts = $.extend({}, options, opts);

            // Apply to each element
            for (var i = 0, count = $items.length; i < count; i++) {
                _build($items.eq(i), opts);
            }
        }

        return $items;
    }

    /**
     * @method private
     * @name _build
     * @description Builds each instance
     * @param $nav [jQuery object] "Target jQuery object"
     * @param opts [object] <{}> "Options object"
     */
    function _build($dropper, opts) {
        opts = $.extend({}, opts, $dropper.data("dropper-options"));
        $dropper.addClass("dropper");

        var data = $.extend({
            $dropper: $dropper,
            $input: $dropper.parents().find(".dropper-input"),
            queue: [],
            total: 0,
            uploading: false
        }, opts);

        $dropper.on("click.dropper", data, _onClick)
            .on("dragenter.dropper", data, _onDragEnter)
            .on("dragover.dropper", data, _onDragOver)
            .on("dragleave.dropper", data, _onDragOut)
            .on("drop.dropper", data, _onDrop)
            .data("dropper", data);

        data.$input.on("change.dropper", data, _onChange);
    }

    /**
     * @method private
     * @name _onClick
     * @description Handles click to dropzone
     * @param e [object] "Event data"
     */
    function _onClick(e) {
        e.stopPropagation();
        e.preventDefault();

        var data = e.data;

        data.$input.trigger("click");
    }

    /**
     * @method private
     * @name _onChange
     * @description Handles change to hidden input
     * @param e [object] "Event data"
     */
    function _onChange(e) {
        e.stopPropagation();
        e.preventDefault();

        var data = e.data,
            files = data.$input[0].files;

        if (files.length) {
            _handleUpload(data, files);
        }
    }

    /**
     * @method private
     * @name _onDragEnter
     * @description Handles dragenter to dropzone
     * @param e [object] "Event data"
     */
    function _onDragEnter(e) {
        e.stopPropagation();
        e.preventDefault();

        var data = e.data;

        data.$dropper.addClass("dropping");
    }

    /**
     * @method private
     * @name _onDragOver
     * @description Handles dragover to dropzone
     * @param e [object] "Event data"
     */
    function _onDragOver(e) {
        e.stopPropagation();
        e.preventDefault();

        var data = e.data;

        data.$dropper.addClass("dropping");
    }

    /**
     * @method private
     * @name _onDragOut
     * @description Handles dragout to dropzone
     * @param e [object] "Event data"
     */
    function _onDragOut(e) {
        e.stopPropagation();
        e.preventDefault();

        var data = e.data;

        data.$dropper.removeClass("dropping");
    }

    /**
     * @method private
     * @name _onDrop
     * @description Handles drop to dropzone
     * @param e [object] "Event data"
     */
    function _onDrop(e) {
        e.preventDefault();

        var data = e.data,
            files = e.originalEvent.dataTransfer.files;

        data.$dropper.removeClass("dropping");

        _handleUpload(data, files);
    }

    /**
     * @method private
     * @name _handleUpload
     * @description Handles new files
     * @param data [object] "Instance data"
     * @param files [object] "File list"
     */
    function _handleUpload(data, files) {
        var newFiles = [];

        for (var i = 0; i < files.length; i++) {
            var file = {
                index: data.total++,
                file: files[i],
                name: files[i].name,
                size: files[i].size,
                started: false,
                complete: false,
                error: false,
                transfer: null
            };

            newFiles.push(file);
            data.queue.push(file);
        }

        if (!data.uploading) {
            $(window).on("beforeunload.dropper", function () {
                return 'You have uploads pending, are you sure you want to leave this page?';
            });

            data.uploading = true;
        }

        data.$dropper.trigger("start.dropper", [newFiles]);

        _checkQueue(data);
    }

    /**
     * @method private
     * @name _checkQueue
     * @description Checks and updates file queue
     * @param data [object] "Instance data"
     */
    function _checkQueue(data) {
        var transfering = 0,
            newQueue = [];

        // remove lingering items from queue
        for (var i in data.queue) {
            if (data.queue.hasOwnProperty(i) && !data.queue[i].complete && !data.queue[i].error) {
                newQueue.push(data.queue[i]);
            }
        }

        data.queue = newQueue;

        for (var j in data.queue) {
            if (data.queue.hasOwnProperty(j)) {
                if (!data.queue[j].started) {
                    var formData = new FormData();

                    formData.append(data.postKey, data.queue[j].file);

                    for (var k in data.postData) {
                        if (data.postData.hasOwnProperty(k)) {
                            formData.append(k, data.postData[k]);
                        }
                    }

                    _uploadFile(data, data.queue[j], formData);
                }

                transfering++;

                if (transfering >= data.maxQueue) {
                    return;
                } else {
                    i++;
                }
            }
        }

        if (transfering === 0) {
            $(window).off("beforeunload.dropper");

            data.uploading = false;

            data.$dropper.trigger("complete.dropper");
        }
    }

    /**
     * @method private
     * @name _uploadFile
     * @description Uploads file
     * @param data [object] "Instance data"
     * @param file [object] "Target file"
     * @param formData [object] "Target form"
     */
    function _uploadFile(data, file, formData) {
        if (file.size >= data.maxSize) {
            file.error = true;
            data.$dropper.trigger("fileError.dropper", [file, "Too large"]);

            _checkQueue(data);
        } else {
            file.started = true;
            file.transfer = $.ajax({
                url: data.action,
                data: formData,
                type: "POST",
                dataType: 'json',
                contentType: false,
                processData: false,
                cache: false,
                xhr: function () {
                    var $xhr = $.ajaxSettings.xhr();

                    if ($xhr.upload) {
                        $xhr.upload.addEventListener("progress", function (e) {
                            var percent = 0,
                                position = e.loaded || e.position,
                                total = e.total;

                            if (e.lengthComputable) {
                                percent = Math.ceil(position / total * 100);
                            }

                            data.$dropper.trigger("fileProgress.dropper", [file, percent]);
                        }, false);
                    }

                    return $xhr;
                },
                beforeSend: function (e) {
                    data.$dropper.trigger("fileStart.dropper", [file]);
                },
                success: function (response, status, jqXHR) {
                    file.complete = true;
                    data.$dropper.trigger("fileComplete.dropper", [file, response, jqXHR]);

                    _checkQueue(data);
                },
                error: function (jqXHR, status, error) {
                    file.error = true;
                    data.$dropper.trigger("fileError.dropper", [file, error]);

                    _checkQueue(data);
                }
            });
        }
    }

    $.fn.dropper = function (method) {
        if (pub[method]) {
            return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return _init.apply(this, arguments);
        }
        return this;
    };

    $.dropper = function (method) {
        if (method === "defaults") {
            pub.defaults.apply(this, Array.prototype.slice.call(arguments, 1));
        }
    };
})(jQuery, window);

(function () {
    var $, Paste, createHiddenEditable, dataURLtoBlob;

    $ = window.jQuery;

    $.paste = function (pasteContainer) {
        var pm;
        if (typeof console !== "undefined" && console !== null) {
            console.log("DEPRECATED: This method is deprecated. Please use $.fn.pastableNonInputable() instead.");
        }
        pm = Paste.mountNonInputable(pasteContainer);
        return pm._container;
    };

    $.fn.pastableNonInputable = function () {
        var el, _i, _len;
        for (_i = 0, _len = this.length; _i < _len; _i++) {
            el = this[_i];
            Paste.mountNonInputable(el);
        }
        return this;
    };

    $.fn.pastableTextarea = function () {
        var el, _i, _len;
        for (_i = 0, _len = this.length; _i < _len; _i++) {
            el = this[_i];
            Paste.mountTextarea(el);
        }
        return this;
    };

    $.fn.pastableContenteditable = function () {
        var el, _i, _len;
        for (_i = 0, _len = this.length; _i < _len; _i++) {
            el = this[_i];
            Paste.mountContenteditable(el);
        }
        return this;
    };

    dataURLtoBlob = function (dataURL, sliceSize) {
        var b64Data, byteArray, byteArrays, byteCharacters, byteNumbers, contentType, i, m, offset, slice, _ref;
        if (sliceSize == null) {
            sliceSize = 512;
        }
        if (!(m = dataURL.match(/^data\:([^\;]+)\;base64\,(.+)$/))) {
            return null;
        }
        _ref = m, m = _ref[0], contentType = _ref[1], b64Data = _ref[2];
        byteCharacters = atob(b64Data);
        byteArrays = [];
        offset = 0;
        while (offset < byteCharacters.length) {
            slice = byteCharacters.slice(offset, offset + sliceSize);
            byteNumbers = new Array(slice.length);
            i = 0;
            while (i < slice.length) {
                byteNumbers[i] = slice.charCodeAt(i);
                i++;
            }
            byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
            offset += sliceSize;
        }
        return new Blob(byteArrays, {
            type: contentType
        });
    };

    createHiddenEditable = function () {
        return $(document.createElement('div')).attr('contenteditable', true).css({
            width: 1,
            height: 1,
            position: 'fixed',
            left: -100,
            overflow: 'hidden'
        });
    };

    Paste = (function () {
        Paste.prototype._target = null;

        Paste.prototype._container = null;

        Paste.mountNonInputable = function (nonInputable) {
            var paste;
            paste = new Paste(createHiddenEditable().appendTo(nonInputable), nonInputable);
            $(nonInputable).on('click', (function (_this) {
                return function () {
                    return paste._container.focus();
                };
            })(this));
            paste._container.on('focus', (function (_this) {
                return function () {
                    return $(nonInputable).addClass('pastable-focus');
                };
            })(this));
            return paste._container.on('blur', (function (_this) {
                return function () {
                    return $(nonInputable).removeClass('pastable-focus');
                };
            })(this));
        };

        Paste.mountTextarea = function (textarea) {
            var ctlDown, paste;
            if (-1 !== navigator.userAgent.toLowerCase().indexOf('chrome')) {
                return this.mountContenteditable(textarea);
            }
            paste = new Paste(createHiddenEditable().insertBefore(textarea), textarea);
            ctlDown = false;
            $(textarea).on('keyup', function (ev) {
                var _ref;
                if ((_ref = ev.keyCode) === 17 || _ref === 224) {
                    return ctlDown = false;
                }
            });
            $(textarea).on('keydown', function (ev) {
                var _ref;
                if ((_ref = ev.keyCode) === 17 || _ref === 224) {
                    ctlDown = true;
                }
                if (ctlDown && ev.keyCode === 86) {
                    return paste._container.focus();
                }
            });
            $(paste._target).on('pasteImage', (function (_this) {
                return function () {
                    return $(textarea).focus();
                };
            })(this));
            $(paste._target).on('pasteText', (function (_this) {
                return function () {
                    return $(textarea).focus();
                };
            })(this));
            $(textarea).on('focus', (function (_this) {
                return function () {
                    return $(textarea).addClass('pastable-focus');
                };
            })(this));
            return $(textarea).on('blur', (function (_this) {
                return function () {
                    return $(textarea).removeClass('pastable-focus');
                };
            })(this));
        };

        Paste.mountContenteditable = function (contenteditable) {
            var paste;
            paste = new Paste(contenteditable, contenteditable);
            $(contenteditable).on('focus', (function (_this) {
                return function () {
                    return $(contenteditable).addClass('pastable-focus');
                };
            })(this));
            return $(contenteditable).on('blur', (function (_this) {
                return function () {
                    return $(contenteditable).removeClass('pastable-focus');
                };
            })(this));
        };

        function Paste(_at__container, _at__target) {
            this._container = _at__container;
            this._target = _at__target;
            this._container = $(this._container);
            this._target = $(this._target).addClass('pastable');
            this._container.on('paste', (function (_this) {
                return function (ev) {
                    var clipboardData, file, item, reader, text, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _results;
                    if (((_ref = ev.originalEvent) != null ? _ref.clipboardData : void 0) != null) {
                        clipboardData = ev.originalEvent.clipboardData;
                        if (clipboardData.items) {
                            _ref1 = clipboardData.items;
                            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                                item = _ref1[_i];
                                if (item.type.match(/^image\//)) {
                                    reader = new FileReader();
                                    reader.onload = function (event) {
                                        return _this._handleImage(event.target.result);
                                    };
                                    reader.readAsDataURL(item.getAsFile());
                                }
                                if (item.type === 'text/plain') {
                                    item.getAsString(function (string) {
                                        return _this._target.trigger('pasteText', {
                                            text: string
                                        });
                                    });
                                }
                            }
                        } else {
                            if (-1 !== Array.prototype.indexOf.call(clipboardData.types, 'text/plain')) {
                                text = clipboardData.getData('Text');
                                _this._target.trigger('pasteText', {
                                    text: text
                                });
                            }
                            _this._checkImagesInContainer(function (src) {
                                return _this._handleImage(src);
                            });
                        }
                    }
                    if (clipboardData = window.clipboardData) {
                        if ((_ref2 = (text = clipboardData.getData('Text'))) != null ? _ref2.length : void 0) {
                            return _this._target.trigger('pasteText', {
                                text: text
                            });
                        } else {
                            _ref3 = clipboardData.files;
                            _results = [];
                            for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
                                file = _ref3[_j];
                                _this._handleImage(URL.createObjectURL(file));
                                _results.push(_this._checkImagesInContainer(function () { }));
                            }
                            return _results;
                        }
                    }
                };
            })(this));
        }

        Paste.prototype._handleImage = function (src) {
            var loader;
            loader = new Image();
            loader.onload = (function (_this) {
                return function () {
                    var blob, canvas, ctx, dataURL;
                    canvas = document.createElement('canvas');
                    canvas.width = loader.width;
                    canvas.height = loader.height;
                    ctx = canvas.getContext('2d');
                    ctx.drawImage(loader, 0, 0, canvas.width, canvas.height);
                    dataURL = null;
                    try {
                        dataURL = canvas.toDataURL('image/png');
                        blob = dataURLtoBlob(dataURL);
                    } catch (_error) { }
                    if (dataURL) {
                        return _this._target.trigger('pasteImage', {
                            blob: blob,
                            dataURL: dataURL,
                            width: loader.width,
                            height: loader.height
                        });
                    }
                };
            })(this);
            return loader.src = src;
        };

        Paste.prototype._checkImagesInContainer = function (cb) {
            var img, timespan, _i, _len, _ref;
            timespan = Math.floor(1000 * Math.random());
            _ref = this._container.find('img');
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                img = _ref[_i];
                img["_paste_marked_" + timespan] = true;
            }
            return setTimeout((function (_this) {
                return function () {
                    var _j, _len1, _ref1, _results;
                    _ref1 = _this._container.find('img');
                    _results = [];
                    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                        img = _ref1[_j];
                        if (!img["_paste_marked_" + timespan]) {
                            cb(img.src);
                        }
                        _results.push($(img).remove());
                    }
                    return _results;
                };
            })(this), 1);
        };

        return Paste;

    })();

}).call(this);

function DropEnable() {
    $('.markdown-textbox').each(function () {
        if (!$(this).hasClass('dropper')) {
            $(this).dropper({
                action: "/file/upload",
                maxQueue: 1,
                postData: {}
            })
                .on('fileStart.dropper', function (file) {
                    $(this).val($(this).val() + '\r\n![Upload](Uploading)\r\n');
                })
                .on('fileComplete.dropper', function (file, res, ret) {
                    var content = $(this).val().replace('![Upload](Uploading)', '![' + res.name + '](/file/download/' + ret.fileId + ')');
                    $(this).val(content);
                });
        }

        $('.markdown-textbox').pastableTextarea();
        $('.markdown-textbox').on('pasteImage', function (ev, data) {
            var txtbox = $(this);
            $(this).val($(this).val() + '\r\n![Upload](Uploading)\r\n');
            var blobUrl = URL.createObjectURL(data.blob);
            $.post('/file/base64string', { file: data.dataURL }, function (result) {
                var content = txtbox.val().replace('![Upload](Uploading)', '![' + result.name + '](/file/download/' + result.fileId + ')');
                txtbox.val(content);
            }, "json");
        });
    });
}

function savePost(url) {
    $.post('/admin/post/edit', {
        __RequestVerificationToken: $('#frmSavePost input[name="__RequestVerificationToken"]').val(),
        title: $('#txtTitle').val(),
        id: url,
        newId: $('#txtUrl').val(),
        content: $('#txtContent').val(),
        tags: $('#txtTags').val(),
        catalog: $('#lstCatalogs').val(),
        isPage: $('#chkIsPage').is(':checked')
    }, function (html) {
        $('.post-body').html(html);
        $('.post-edit').slideUp();
        $('.post-body').slideDown();
        Highlight();
        popResult('文章保存成功');
    });
}

function editCatalog(id) {
    var parent = $('tr[data-catalog="' + id + '"]');
    parent.find('.display').hide();
    parent.find('.editing').fadeIn();
}

function cancelEditCatalog () {
    $('.editing').hide();
    $('.display').fadeIn();
}

function deleteCatalog(id) {
    var parent = $('tr[data-catalog="' + id + '"]');
    parent.remove();
    $.post('/admin/catalog/delete', {
        id: id,
        __RequestVerificationToken: $('#frmDeleteCatalog input[name="__RequestVerificationToken"]').val()
    }, function () {
        popResult('删除成功');
    });
}

function saveCatalog(id) {
    var parent = $('tr[data-catalog="' + id + '"]');
    $.post('/admin/catalog/edit/', {
        id: id,
        __RequestVerificationToken: $('#frmEditCatalog input[name="__RequestVerificationToken"]').val(),
        newId: parent.find('.title').val(),
        title: parent.find('.title-zh').val(),
        order: parent.find('.order').val()
    }, function () {
        parent.find('.d-title').html(parent.find('.title').val());
        parent.find('.d-title-zh').html(parent.find('.title-zh').val());
        parent.find('.d-order').html(parent.find('.order').val());
        parent.find('.editing').hide();
        parent.find('.display').fadeIn();
        popResult('修改成功');
    });
}

function saveConfig() {
    $.post('/admin/index', $('#frmConfig').serialize(), function () {
        popResult('网站配置信息修改成功');
    });
}

function popResult(txt) {
    var msg = $('<div class="msg hide">' + txt + '</div>');
    msg.css('left', '50%');
    $('body').append(msg);
    msg.css('margin-left', '-' + parseInt(msg.outerWidth() / 2) + 'px');
    msg.removeClass('hide');
    setTimeout(function () {
        msg.addClass('hide');
        setTimeout(function () {
            msg.remove();
        }, 400);
    }, 2600);
}