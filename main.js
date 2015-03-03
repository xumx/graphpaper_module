if (Meteor.isClient) {
    var script = 'https://d33t3vvu2t2yu5.cloudfront.net/tv.js';

    Template.tradingview.created = function() {};

    Template.tradingview.rendered = function() {
        this.$('.select-select2').select2();
        this.$('.select-chosen').chosen({
            width: "100%"
        });


        var callback = function() {
            var template = this;
            var square = Squares.findOne(template.data._id);

            if (square && square.data && square.data.container_id == 'tradingview' + square._id) {

                $('.tradingview-container').removeClass('hidden');
                $('.tradingview-settings').addClass('hidden');

                this.chart = new TradingView.widget(square.data);
            }
        }

        callbackBound = _.bind(callback, this);

        if (window.TradingView) {
            callbackBound();
        } else {
            $.getScript(script, function() {
                callbackBound();
            });
        }
    };


    Template.tradingview.events({
        'click .apply': function(event, template) {
            var square = template.data;

            $('.tradingview-container').removeClass('hidden');
            $('.tradingview-settings').addClass('hidden');

            var settings = getSettings(false, template);
            settings.container_id = 'tradingview' + template.data._id;
            if (settings.autosize) {
                settings.height = template.data.height * 100;
                settings.width = template.data.width * 100;
                delete settings.autosize;
            }

            square.update({
                $set: {
                    data: settings
                }
            })

            this.chart = new TradingView.widget(settings);
        }
    });

    function getSettings(explicit, template) {
        var w = parseInt(template.$('input[name="width"]').val(), 10) || 640,
            h = parseInt(template.$('input[name="height"]').val(), 10) || 610,
            symbol = template.$('input[name="symbol"]').val().toUpperCase() || 'FX:SPX500',
            interval = template.$('select[name="interval"]').val() || 'D',
            timezone = template.$('select[name="timezone"]').val() || 'exchange',
            theme = template.$('select[name="theme"]').val() || '',
            style = template.$('select[name="style"]').val() || '',
            toolbar_bg = template.$('input[name="toolbar_bg"]').val() || '#f1f3f6',
            hidetoptoolbar = !template.$('input[name="hidetoptoolbar"]').is(':checked'),
            hidesidetoolbar = !template.$('input[name="hidesidetoolbar"]').is(':checked'),
            // symbolchange = template.$('input[name="symbolchange"]').is(':checked'),
            saveimage = template.$('input[name="saveimage"]').is(':checked'),
            watchlistsymbols = [],
            headlines = template.$('input[name="headlines"]').is(':checked'),
            stocktwits = template.$('input[name="stocktwits"]').is(':checked'),
            details = template.$('input[name="details"]').is(':checked'),
            hotlist = template.$('input[name="hotlist"]').is(':checked'),
            calendar = template.$('input[name="calendar"]').is(':checked'),
            hideideas = template.$('input[name="hideideas"]').is(':checked'),
            hideideasbutton = template.$('input[name="hideideasbutton"]').is(':checked'),
            withdateranges = template.$('input[name="withdateranges"]').is(':checked'),
            studies = template.$('select[name="indicators"]').val();

        var props = {};

        props.autosize = true;
        props.symbol = symbol;
        props.interval = interval;
        props.timezone = timezone;
        props.theme = theme;
        props.style = style;
        props.toolbar_bg = toolbar_bg;
        if (hidetoptoolbar) {
            props.hide_top_toolbar = true;
        } else if (explicit, template) {
            props.hide_top_toolbar = false;
        }
        if (withdateranges) {
            props.withdateranges = !!withdateranges;
        }
        if (!hidesidetoolbar) {
            props.hide_side_toolbar = false;
        } else if (explicit) {
            props.hide_side_toolbar = true;
        }

        if (!saveimage) {
            props.save_image = false;
        } else if (explicit) {
            props.save_image = true;
        }
        if (watchlistsymbols && watchlistsymbols.length) {
            props.watchlist = watchlistsymbols;
        } else if (explicit) {
            props.watchlist = [];
        }
        if (details) {
            props.details = true;
        } else if (explicit) {
            props.details = false;
        }
        if (hotlist) {
            props.hotlist = true;
        } else if (explicit) {
            props.hotlist = false;
        }
        if (calendar) {
            props.calendar = true;
        } else if (explicit) {
            props.calendar = false;
        }
        if (stocktwits || headlines) { // news
            props.news = [];
            if (stocktwits) props.news.push('stocktwits');
            if (headlines) props.news.push('headlines');
        } else if (explicit) {
            props.news = false;
        }

        props.hideideas = true;
        props.hideideasbutton = false;

        if (studies && studies.length) {
            props.studies = studies;
        } else if (explicit) {
            props.studies = [];
        }

        props.allow_symbol_change = true;
        props.show_popup_button = true;
        props.popup_width = 1000;
        props.popup_height = 800;

        return props;
    }


    // Indicators
    var basicStudies = [{
        "id": "studyADR@tv-basicstudies",
        "description": "ADR",
        "shortDescription": "ADR"
    }, {
        "id": "AROON@tv-basicstudies",
        "description": "Aroon",
        "shortDescription": "Aroon"
    }, {
        "id": "ATR@tv-basicstudies",
        "description": "Average True Range",
        "shortDescription": "ATR"
    }, {
        "id": "AwesomeOscillator@tv-basicstudies",
        "description": "Awesome Oscillator",
        "shortDescription": "AO"
    }, {
        "id": "BB@tv-basicstudies",
        "description": "Bollinger Bands",
        "shortDescription": "BB"
    }, {
        "id": "BollingerBandsR@tv-basicstudies",
        "description": "Bollinger Bands %B",
        "shortDescription": "BB %B"
    }, {
        "id": "BollingerBandsWidth@tv-basicstudies",
        "description": "Bollinger Bands Width",
        "shortDescription": "BBW"
    }, {
        "id": "CCI@tv-basicstudies",
        "description": "Commodity Channel Index",
        "shortDescription": "CCI"
    }, {
        "id": "CMF@tv-basicstudies",
        "description": "Chaikin Money Flow",
        "shortDescription": "CMF"
    }, {
        "id": "ChaikinOscillator@tv-basicstudies",
        "description": "Chaikin Oscillator",
        "shortDescription": "Chaikin Osc"
    }, {
        "id": "chandeMO@tv-basicstudies",
        "description": "Chande Momentum Oscillator",
        "shortDescription": "ChandeMO"
    }, {
        "id": "ChoppinessIndex@tv-basicstudies",
        "description": "Choppiness Index",
        "shortDescription": "CHOP"
    }, {
        "id": "CRSI@tv-basicstudies",
        "description": "ConnorsRSI",
        "shortDescription": "CRSI"
    }, {
        "id": "CorrelationCoefficient@tv-basicstudies",
        "description": "Correlation Coefficient",
        "shortDescription": "CC"
    }, {
        "id": "DoubleEMA@tv-basicstudies",
        "description": "Double EMA",
        "shortDescription": "DEMA"
    }, {
        "id": "DM@tv-basicstudies",
        "description": "Directional Movement",
        "shortDescription": "DMI"
    }, {
        "id": "DONCH@tv-basicstudies",
        "description": "Donchian Channels",
        "shortDescription": "DC"
    }, {
        "id": "DetrendedPriceOscillator@tv-basicstudies",
        "description": "Detrended Price Oscillator",
        "shortDescription": "DPO"
    }, {
        "id": "EaseOfMovement@tv-basicstudies",
        "description": "Ease Of Movement",
        "shortDescription": "EOM"
    }, {
        "id": "EFI@tv-basicstudies",
        "description": "Elder's Force Index",
        "shortDescription": "EFI"
    }, {
        "id": "ElliottWave@tv-basicstudies",
        "description": "Elliott Wave",
        "shortDescription": "Elliott"
    }, {
        "id": "ENV@tv-basicstudies",
        "description": "Envelope",
        "shortDescription": "Env"
    }, {
        "id": "MAExp@tv-basicstudies",
        "description": "Moving Average Exponentional",
        "shortDescription": "EMA"
    }, {
        "id": "FisherTransform@tv-basicstudies",
        "description": "Fisher Transform",
        "shortDescription": "Fisher"
    }, {
        "id": "HV@tv-basicstudies",
        "description": "Historical Volatility",
        "shortDescription": "HV"
    }, {
        "id": "hullMA@tv-basicstudies",
        "description": "Hull Moving Average",
        "shortDescription": "HMA"
    }, {
        "id": "IchimokuCloud@tv-basicstudies",
        "description": "Ichimoku Cloud",
        "shortDescription": "Ichimoku"
    }, {
        "id": "KLTNR@tv-basicstudies",
        "description": "Keltner Channels",
        "shortDescription": "KC"
    }, {
        "id": "KST@tv-basicstudies",
        "description": "Know Sure Thing",
        "shortDescription": "KST"
    }, {
        "id": "LinearRegression@tv-basicstudies",
        "description": "Linear Regression",
        "shortDescription": "Lin Reg"
    }, {
        "id": "MACD@tv-basicstudies",
        "description": "MACD",
        "shortDescription": "MACD"
    }, {
        "id": "MAWeighted@tv-basicstudies",
        "description": "Moving Average Weighted",
        "shortDescription": "WMA"
    }, {
        "id": "MOM@tv-basicstudies",
        "description": "Momentum",
        "shortDescription": "Mom"
    }, {
        "id": "MF@tv-basicstudies",
        "description": "Money Flow",
        "shortDescription": "MFl"
    }, {
        "id": "MoonPhases@tv-basicstudies",
        "description": "Moon Phases",
        "shortDescription": "MP"
    }, {
        "id": "OBV@tv-basicstudies",
        "description": "On Balance Volume",
        "shortDescription": "OBV"
    }, {
        "id": "PSAR@tv-basicstudies",
        "description": "Parabolic SAR",
        "shortDescription": "SAR"
    }, {
        "id": "PivotPointsHighLow@tv-basicstudies",
        "description": "Pivot Points High Low",
        "shortDescription": "Pivots HL"
    }, {
        "id": "PivotPointsStandard@tv-basicstudies",
        "description": "Pivot Points Standard",
        "shortDescription": "Pivots"
    }, {
        "id": "PriceOsc@tv-basicstudies",
        "description": "Price Oscillator",
        "shortDescription": "PPO"
    }, {
        "id": "PriceVolumeTrend@tv-basicstudies",
        "description": "Price Volume Trend",
        "shortDescription": "PVT"
    }, {
        "id": "ROC@tv-basicstudies",
        "description": "Rate Of Change",
        "shortDescription": "ROC"
    }, {
        "id": "VigorIndex@tv-basicstudies",
        "description": "Relative Vigor Index",
        "shortDescription": "RVGI"
    }, {
        "id": "VolatilityIndex@tv-basicstudies",
        "description": "Relative Volatility Index",
        "shortDescription": "RVI"
    }, {
        "id": "RSI@tv-basicstudies",
        "description": "Relative Strength Index",
        "shortDescription": "RSI"
    }, {
        "id": "MASimple@tv-basicstudies",
        "description": "Moving Average",
        "shortDescription": "MA"
    }, {
        "id": "SMIErgodicIndicator@tv-basicstudies",
        "description": "SMI Ergodic Indicator",
        "shortDescription": "SMII"
    }, {
        "id": "SMIErgodicOscillator@tv-basicstudies",
        "description": "SMI Ergodic Oscillator",
        "shortDescription": "SMIO"
    }, {
        "id": "Stochastic@tv-basicstudies",
        "description": "Stochastic",
        "shortDescription": "Stoch"
    }, {
        "id": "StochasticRSI@tv-basicstudies",
        "description": "Stochastic RSI",
        "shortDescription": "Stoch RSI"
    }, {
        "id": "TripleEMA@tv-basicstudies",
        "description": "Triple EMA",
        "shortDescription": "TEMA"
    }, {
        "id": "Trix@tv-basicstudies",
        "description": "TRIX",
        "shortDescription": "TRIX"
    }, {
        "id": "UltimateOsc@tv-basicstudies",
        "description": "Ultimate Oscillator",
        "shortDescription": "UO"
    }, {
        "id": "VSTOP@tv-basicstudies",
        "description": "Volatility Stop",
        "shortDescription": "VStop"
    }, {
        "id": "Volume@tv-basicstudies",
        "description": "Volume",
        "shortDescription": "Vol"
    }, {
        "id": "VWAP@tv-basicstudies",
        "description": "VWAP",
        "shortDescription": "VWAP"
    }, {
        "id": "MAVolumeWeighted@tv-basicstudies",
        "description": "VWMA",
        "shortDescription": "VWMA"
    }, {
        "id": "WilliamsAlligator@tv-basicstudies",
        "description": "Williams Alligator",
        "shortDescription": "Alligator"
    }, {
        "id": "WilliamsFractal@tv-basicstudies",
        "description": "Williams Fractal",
        "shortDescription": "Fractal"
    }, {
        "id": "WilliamR@tv-basicstudies",
        "description": "Williams %R",
        "shortDescription": "%R"
    }, {
        "id": "ZigZag@tv-basicstudies",
        "description": "Zig Zag",
        "shortDescription": "Zig Zag"
    }, {
        "id": "ACCD@tv-basicstudies",
        "description": "Accumulation/Distribution",
        "shortDescription": "Accum/Dist"
    }];

    basicStudies.sort(function(a, b) {
        var descriptionA = a.description.toLowerCase(),
            descriptionB = b.description.toLowerCase();
        if (descriptionA < descriptionB)
            return -1;
        if (descriptionA > descriptionB)
            return 1;
        return 0;
    });
}
