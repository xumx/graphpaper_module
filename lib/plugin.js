RegExp.quote = function(str) {
    return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};

arrayObjectIndexOf = function(myArray, searchTerm, property) {
    for (var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}

rotateColor = function(current) {
    var colorList = ["text-primary", "text-danger", "text-warning", "text-success", "text-info", "text-muted", "text-light", "text-dark", "text-black"];
    var index = colorList.indexOf(current) + 1;
    if (index < colorList.length) return colorList[index];
    return colorList[0];
}

has = function(object, keypath) {
    var segments = toSegments(keypath);
    var result = _.every(segments, function(key) {
        if (_.has(object, key)) {
            object = object[key];
            return true;
        } else {
            return false
        }
    });

    return result;
}

getParams = function() {
    var result = {};

    var params = window.location.search.split(/\?|\&/);

    params.forEach(function(it) {
        if (it) {
            var param = it.split("=");
            result[param[0]] = param[1];
        }
    });

    return result;
}

serializeForm = function(form) {
    return _.object(_.map(form.serializeArray(), function(item) {
        return [item.name, item.value]
    }));
}

detectDevice = function() {
    var ua = navigator.userAgent;

    var type = (function() {
        if (!ua || ua === '') {
            // No user agent
            return options.emptyUserAgentDeviceType || 'desktop';
        }

        if (ua.match(/GoogleTV|SmartTV|Internet TV|NetCast|NETTV|AppleTV|boxee|Kylo|Roku|DLNADOC|CE\-HTML/i)) {
            // if user agent is a smart TV - http://goo.gl/FocDk
            return 'tv';
        } else if (ua.match(/Xbox|PLAYSTATION 3|PLAYSTATION 4|Wii/i)) {
            // if user agent is a TV Based Gaming Console
            return 'tv';
        } else if (ua.match(/iP(a|ro)d/i) || (ua.match(/tablet/i) && !ua.match(/RX-34/i)) || ua.match(/FOLIO/i)) {
            // if user agent is a Tablet
            return 'tablet';
        } else if (ua.match(/Linux/i) && ua.match(/Android/i) && !ua.match(/Fennec|mobi|HTC Magic|HTCX06HT|Nexus One|SC-02B|fone 945/i)) {
            // if user agent is an Android Tablet
            return 'tablet';
        } else if (ua.match(/Kindle/i) || (ua.match(/Mac OS/i) && ua.match(/Silk/i))) {
            // if user agent is a Kindle or Kindle Fire
            return 'tablet';
        } else if (ua.match(/GT-P10|SC-01C|SHW-M180S|SGH-T849|SCH-I800|SHW-M180L|SPH-P100|SGH-I987|zt180|HTC( Flyer|_Flyer)|Sprint ATP51|ViewPad7|pandigital(sprnova|nova)|Ideos S7|Dell Streak 7|Advent Vega|A101IT|A70BHT|MID7015|Next2|nook/i) || (ua.match(/MB511/i) && ua.match(/RUTEM/i))) {
            // if user agent is a pre Android 3.0 Tablet
            return 'tablet';
        } else if (ua.match(/BOLT|Fennec|Iris|Maemo|Minimo|Mobi|mowser|NetFront|Novarra|Prism|RX-34|Skyfire|Tear|XV6875|XV6975|Google Wireless Transcoder/i)) {
            // if user agent is unique mobile User Agent
            return 'phone';
        } else if (ua.match(/Opera/i) && ua.match(/Windows NT 5/i) && ua.match(/HTC|Xda|Mini|Vario|SAMSUNG\-GT\-i8000|SAMSUNG\-SGH\-i9/i)) {
            // if user agent is an odd Opera User Agent - http://goo.gl/nK90K
            return 'phone';
        } else if ((ua.match(/Windows (NT|XP|ME|9)/) && !ua.match(/Phone/i)) && !ua.match(/Bot|Spider|ia_archiver|NewsGator/i) || ua.match(/Win( ?9|NT)/i)) {
            // if user agent is Windows Desktop
            return 'desktop';
        } else if (ua.match(/Macintosh|PowerPC/i) && !ua.match(/Silk/i)) {
            // if agent is Mac Desktop
            return 'desktop';
        } else if (ua.match(/Linux/i) && ua.match(/X11/i) && !ua.match(/Charlotte/i)) {
            // if user agent is a Linux Desktop
            return 'desktop';
        } else if (ua.match(/CrOS/)) {
            // if user agent is a Chrome Book
            return 'desktop';
        } else if (ua.match(/Solaris|SunOS|BSD/i)) {
            // if user agent is a Solaris, SunOS, BSD Desktop
            return 'desktop';
        } else if (ua.match(/curl|Bot|B-O-T|Crawler|Spider|Spyder|Yahoo|ia_archiver|Covario-IDS|findlinks|DataparkSearch|larbin|Mediapartners-Google|NG-Search|Snappy|Teoma|Jeeves|Charlotte|NewsGator|TinEye|Cerberian|SearchSight|Zao|Scrubby|Qseero|PycURL|Pompos|oegp|SBIder|yoogliFetchAgent|yacy|webcollage|VYU2|voyager|updated|truwoGPS|StackRambler|Sqworm|silk|semanticdiscovery|ScoutJet|Nymesis|NetResearchServer|MVAClient|mogimogi|Mnogosearch|Arachmo|Accoona|holmes|htdig|ichiro|webis|LinkWalker|lwp-trivial/i) && !ua.match(/mobile|Playstation/i)) {
            // if user agent is a BOT/Crawler/Spider
            return options.botUserAgentDeviceType || 'bot';
        } else {
            // Otherwise assume it is a mobile Device
            return options.unknownUserAgentDeviceType || 'phone';
        }
    })();

    return type;
}

function toSegments(keypath) {
    "use strict";
    if (typeof keypath === "object" && keypath.constructor.name === "Array") {
        return keypath;
    }
    if (typeof keypath === "string") {
        // issue #1 https://github.com/jeeeyul/underscore-keypath/issues/1
        var transformed = keypath.replace(/\['(([^']|\')+)'\]/g, ".$1");
        transformed = transformed.replace(/\["(([^"]|\")+)"\]/g, ".$1");
        transformed = transformed.replace(/([$A-Za-z_][0-9A-Za-z_$]*)\(\)/, "$1");
        return transformed.split(".");
    }
    throw new Error("keypath must be an array or a string");
}

if (Meteor.isClient) {

    // Created by STRd6
    // MIT License
    // jquery.paste_image_reader.js
    (function($) {
        var defaults;
        $.event.fix = (function(originalFix) {
            return function(event) {
                event = originalFix.apply(this, arguments);
                if (event.type.indexOf('copy') === 0 || event.type.indexOf('paste') === 0) {
                    event.clipboardData = event.originalEvent.clipboardData;
                }
                return event;
            };
        })($.event.fix);
        defaults = {
            callback: $.noop,
            matchType: /image.*/
        };
        return $.fn.pasteImageReader = function(options) {
            if (typeof options === "function") {
                options = {
                    callback: options
                };
            }
            options = $.extend({}, defaults, options);
            return this.each(function() {
                var $this, element;
                element = this;
                $this = $(this);
                return $this.bind('paste', function(event) {
                    var clipboardData, found;
                    found = false;
                    clipboardData = event.clipboardData;
                    return Array.prototype.forEach.call(clipboardData.types, function(type, i) {
                        var file, reader;
                        if (found) {
                            return;
                        }
                        if (type.match(options.matchType) || clipboardData.items[i].type.match(options.matchType)) {
                            file = clipboardData.items[i].getAsFile();
                            reader = new FileReader();
                            reader.onload = function(evt) {
                                return options.callback.call(element, {
                                    dataURL: evt.target.result,
                                    event: evt,
                                    file: file,
                                    name: file.name
                                });
                            };
                            reader.readAsDataURL(file);
                            event.stopPropagation();
                            return found = true;
                        }
                    });
                });
            });
        };
    })(jQuery);
}
