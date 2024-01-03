/**
@class Sch.preset.Manager
@singleton

Provides a registry of the possible view presets that any instance of a Panel with {@link Sch.mixin.SchedulerPanel} mixin can use.

See the {@link Sch.preset.ViewPreset} and {@link Sch.preset.ViewPresetHeaderRow} classes for a description of the view preset properties.

Available presets are:

- `secondAndMinute` - creates 2 level header - minute and seconds within it: {@img scheduler/images/secondAndMinute.png}
- `minuteAndHour` - creates 2 level header - hour and minutes within it: {@img scheduler/images/minuteAndHour.png}
- `hourAndDay` - creates 2 level header - day and hours within it: {@img scheduler/images/hourAndDay.png}
- `dayAndWeek` - creates 2 level header - week and days within it: {@img scheduler/images/dayAndWeek.png}
- `weekAndDay` - just like `dayAndWeek` but with different formatting: {@img scheduler/images/weekAndDay.png}
- `weekAndMonth` - creates 2 level header - month and weeks within it: {@img scheduler/images/weekAndMonth.png}

- `monthAndYear` - creates 2 level header - year and months within it: {@img scheduler/images/monthAndYear.png}
- `year` - creates 2 level header - year and quarters within it: {@img scheduler/images/year-preset.png}
- `manyYears` - creates 2 level header - 5-years and year within it: {@img scheduler/images/manyYears.png}
- `weekAndDayLetter` - creates 2 level header - with weeks and day letters within it: {@img scheduler/images/weekAndDayLetter.png}
- `weekDateAndMonth` - creates 2 level header - month and weeks within it (weeks shown by first day only): {@img scheduler/images/weekDateAndMonth.png}

You can register your own preset with the {@link #registerPreset} call or pass a preset configuration in the scheduler panel.

*/
Ext.define('Sch.preset.Manager', {
    extend: 'Ext.util.MixedCollection',
    requires: [
        'Sch.util.Date',
        'Sch.preset.ViewPreset'
    ],
    mixins: ['Sch.mixin.Localizable'],

    singleton: true,

    defaultPresets : {
        secondAndMinute : {
            timeColumnWidth     : 30,   // Time column width (used for rowHeight in vertical mode)
            rowHeight           : 24,    // Only used in horizontal orientation
            resourceColumnWidth : 100,   // Only used in vertical orientation
            displayDateFormat   : 'G:i:s', // Controls how dates will be displayed in tooltips etc
            shiftIncrement      : 10,     // Controls how much time to skip when calling shiftNext and shiftPrevious.
            shiftUnit           : 'MINUTE',// Valid values are "MILLI", "SECOND", "MINUTE", "HOUR", "DAY", "WEEK", "MONTH", "QUARTER", "YEAR".
            defaultSpan         : 24,    // By default, if no end date is supplied to a view it will show 24 hours
            timeResolution      : {      // Dates will be snapped to this resolution
                unit        : 'SECOND',  // Valid values are "MILLI", "SECOND", "MINUTE", "HOUR", "DAY", "WEEK", "MONTH", "QUARTER", "YEAR".
                increment   : 5
            },
            headerConfig        : {      // This defines your header, you must include a "middle" object, top/bottom are optional. For each row you can define "unit", "increment", "dateFormat", "renderer", "align", and "scope"
                middle  : {
                    unit        : 'SECOND',
                    increment   : 10,
                    align       : 'center',
                    dateFormat  : 's'
                },
                top     : {
                    unit        : 'MINUTE',
                    align       : 'center',
                    dateFormat  : 'D, d g:iA'
                }
            }
        },
        minuteAndHour : {
            timeColumnWidth     : 100,   // Time column width (used for rowHeight in vertical mode)
            rowHeight           : 24,    // Only used in horizontal orientation
            resourceColumnWidth : 100,   // Only used in vertical orientation
            displayDateFormat   : 'G:i', // Controls how dates will be displayed in tooltips etc
            shiftIncrement      : 1,     // Controls how much time to skip when calling shiftNext and shiftPrevious.
            shiftUnit           : 'HOUR',// Valid values are "MILLI", "SECOND", "MINUTE", "HOUR", "DAY", "WEEK", "MONTH", "QUARTER", "YEAR".
            defaultSpan         : 24,    // By default, if no end date is supplied to a view it will show 24 hours
            timeResolution      : {      // Dates will be snapped to this resolution
                unit        : 'MINUTE',  // Valid values are "MILLI", "SECOND", "MINUTE", "HOUR", "DAY", "WEEK", "MONTH", "QUARTER", "YEAR".
                increment   : 30
            },
            headerConfig        : {      // This defines your header, you must include a "middle" object, top/bottom are optional. For each row you can define "unit", "increment", "dateFormat", "renderer", "align", and "scope"
                middle  : {
                    unit        : 'MINUTE',
                    increment   : '30',
                    align       : 'center',
                    dateFormat  : 'i'
                },
                top     : {
                    unit        : 'HOUR',
                    align       : 'center',
                    dateFormat  : 'D, gA/d'
                }
            }
        },
        hourAndDay : {
            timeColumnWidth     : 60,
            rowHeight           : 24,
            resourceColumnWidth : 100,
            displayDateFormat   : 'G:i',
            shiftIncrement      : 1,
            shiftUnit           : 'DAY',
            defaultSpan         : 24,
            timeResolution      : {
                unit        : 'MINUTE',
                increment   : 30
            },
            headerConfig        : {
                middle      : {
                    unit        : 'HOUR',
                    align       : 'center',
                    dateFormat  : 'G:i'
                },
                top         : {
                    unit        : 'DAY',
                    align       : 'center',
                    dateFormat  : 'D d/m'
                }
            }
        },
        dayAndWeek : {
            timeColumnWidth     : 100,
            rowHeight           : 24,
            resourceColumnWidth : 100,
            displayDateFormat   : 'Y-m-d G:i',
            shiftUnit           : 'DAY',
            shiftIncrement      : 1,
            defaultSpan         : 5,
            timeResolution      : {
                unit        : 'HOUR',
                increment   : 1
            },
            headerConfig        : {
                middle      : {
                    unit        : 'DAY',
                    align       : 'center',
                    dateFormat  : 'D d M'
                },
                top : {
                    unit        : 'WEEK',
                    align       : 'center',
                    renderer    : function(start, end, cfg) {
                        return Sch.util.Date.getShortNameOfUnit('WEEK') + '.' + Ext.Date.format(start, 'W M Y');
                    }
                }
            }
        },

        weekAndDay : {
            timeColumnWidth     : 100,
            rowHeight           : 24,
            resourceColumnWidth : 100,
            displayDateFormat   : 'Y-m-d',
            shiftUnit           : 'WEEK',
            shiftIncrement      : 1,
            defaultSpan         : 1,
            timeResolution      : {
                unit        : 'DAY',
                increment   : 1
            },
            headerConfig        : {
                bottom : {
                    unit        : 'DAY',
                    align       : 'center',
                    increment   : 1,
                    dateFormat  : 'd/m'
                },
                middle : {
                    unit        : 'WEEK',
                    dateFormat  : 'D d M'
                }
            }
        },

        weekAndMonth : {
            timeColumnWidth     : 100,
            rowHeight           : 24,
            resourceColumnWidth : 100,
            displayDateFormat   : 'Y-m-d',
            shiftUnit           : 'WEEK',
            shiftIncrement      : 5,
            defaultSpan         : 6,
            timeResolution      : {
                unit        : 'DAY',
                increment   : 1
            },
            headerConfig        : {
                middle      : {
                    unit    : 'WEEK',
                    align   : 'center',
                    renderer: function(start, end, cfg) {
                        return Ext.Date.format(start, 'd M');
                    }
                },
                top         : {
                    unit        : 'MONTH',
                    align       : 'center',
                    dateFormat  : 'M Y'
                }
            }
        },

        monthAndYear : {
            timeColumnWidth     : 110,
            rowHeight           : 24,
            resourceColumnWidth : 100,
            displayDateFormat   : 'Y-m-d',
            shiftIncrement      : 3,
            shiftUnit           : 'MONTH',
            defaultSpan         : 12,
            timeResolution      : {
                unit        : 'DAY',
                increment   : 1
            },
            headerConfig        : {
                middle      : {
                    unit        : 'MONTH',
                    align       : 'center',
                    dateFormat  : 'M Y'
                },
                top         : {
                    unit        : 'YEAR',
                    align       : 'center',
                    dateFormat  : 'Y'
                }
            }
        },
        year : {
            timeColumnWidth     : 100,
            rowHeight           : 24,
            resourceColumnWidth : 100,
            displayDateFormat   : 'Y-m-d',
            shiftUnit           : 'YEAR',
            shiftIncrement      : 1,
            defaultSpan         : 1,
            timeResolution      : {
                unit        : 'MONTH',
                increment   : 1
            },
            headerConfig        : {
                middle      : {
                    unit        : 'QUARTER',
                    align       : 'center',
                    renderer    : function(start, end, cfg) {
                        return Ext.String.format(Sch.util.Date.getShortNameOfUnit('QUARTER').toUpperCase() + '{0}', Math.floor(start.getMonth() / 3) + 1);
                    }
                },
                top         : {
                    unit        : 'YEAR',
                    align       : 'center',
                    dateFormat  : 'Y'
                }
            }
        },
        manyYears : {
            timeColumnWidth     : 50,
            rowHeight           : 24,
            resourceColumnWidth : 100,
            displayDateFormat   : 'Y-m-d',
            shiftUnit           : 'YEAR',
            shiftIncrement      : 1,
            defaultSpan         : 1,
            timeResolution      : {
                unit        : 'YEAR',
                increment   : 1
            },
            headerConfig        : {
                middle      : {
                    unit        : 'YEAR',
                    align       : 'center',
                    dateFormat  : 'Y',
                    increment   : 5
                },
                // smallest zoom level looked back
                // we have to specify increments here since 'increment' in zoomLevel affects only bottom header
                bottom      : {
                    unit        : 'YEAR',
                    align       : 'center',
                    dateFormat  : 'y',
                    increment   : 1
                }
            }
        },
        weekAndDayLetter : {
            timeColumnWidth     : 20,
            rowHeight           : 24,
            resourceColumnWidth : 100,
            displayDateFormat   : 'Y-m-d',
            shiftUnit           : 'WEEK',
            shiftIncrement      : 1,
            defaultSpan         : 10,
            timeResolution      : {
                unit        : 'DAY',
                increment   : 1
            },
            headerConfig        : {
                bottom  : {
                    unit        : 'DAY',
                    align       : 'center',
                    renderer    : function(start) {
                        return Ext.Date.dayNames[start.getDay()].substring(0, 1);
                    },
                    verticalColumnWidth: 25
                },
                middle          : {
                    unit        : 'WEEK',
                    dateFormat  : 'D d M Y',
                    verticalColumnWidth: 115
                }
            }
        },
        weekDateAndMonth : {
            timeColumnWidth     : 30,
            rowHeight           : 24,
            resourceColumnWidth : 100,
            displayDateFormat   : 'Y-m-d',
            shiftUnit           : 'WEEK',
            shiftIncrement      : 1,
            defaultSpan         : 10,
            timeResolution      : {
                unit        : 'DAY',
                increment   : 1
            },
            headerConfig : {
                middle      : {
                    unit        : 'WEEK',
                    align       : 'center',
                    dateFormat  : 'd'
                },
                top         : {
                    unit        : 'MONTH',
                    dateFormat  : 'Y F'
                }
            }
        },

        minute : {
            timeRowHeight       : 40,
            displayDateFormat   : 'G:i',
            shiftIncrement      : 1,
            shiftUnit           : 'WEEK',
            defaultSpan         : 60,
            timeResolution      : {
                unit        : 'MINUTE',
                increment   : 15
            },
            columnLinesFor      : 'bottom',
            headerConfig        : {
                bottom  : {
                    unit        : 'MINUTE',
                    increment   : 15,
                    align       : 'center',
                    renderer    : function (value) {
                        return Ext.String.format(
                            '<div class="sch-calendarcolumn-ct">' +
                            '<span class="sch-calendarcolumn-hours">{0}</span>' +
                            '<span class="sch-calendarcolumn-minutes {2}">{1}</span>' +
                            '</div>',
                    
                            value.getMinutes() ? '' : Ext.Date.format(value, 'H'),
                            Ext.Date.format(value, 'i'),
                            value.getMinutes() ? 'sch-calendarcolumn-minutes-non-zero' : ''
                        );
                    }
                },
                middle  : {
                    unit        : 'DAY',
                    align       : 'center',
                    dateFormat  : 'D d',
                    splitUnit   : 'DAY'
                }
            }
        },
        
        day : {
            timeRowHeight       : 40,
            displayDateFormat   : 'G:i',
            shiftIncrement      : 1,
            shiftUnit           : 'DAY',
            defaultSpan         : 1,
            timeResolution      : {
                unit        : 'MINUTE',
                increment   : 30
            },
            columnLinesFor      : 'bottom',
            headerConfig        : {
                bottom  : {
                    unit        : 'HOUR',
                    align       : 'center',
                    renderer    : function (value) {
                        return Ext.String.format(
                            '<div class="sch-calendarcolumn-ct"><span class="sch-calendarcolumn-hours">{0}</span>' +
                            '<span class="sch-calendarcolumn-minutes">{1}</span></div>',
                            Ext.Date.format(value, 'H'),
                            Ext.Date.format(value, 'i')
                        );
                    }
                },
                middle  : {
                    unit        : 'DAY',
                    align       : 'center',
                    dateFormat  : 'D d/m',
                    splitUnit   : 'DAY'
                }
            }
        },

        week : {
            timeRowHeight       : 40,
            displayDateFormat   : 'G:i',
            shiftIncrement      : 1,
            shiftUnit           : 'WEEK',
            defaultSpan         : 24,
            timeResolution      : {
                unit        : 'MINUTE',
                increment   : 30
            },
            columnLinesFor      : 'bottom',
            headerConfig        : {
                bottom  : {
                    unit        : 'HOUR',
                    align       : 'center',
                    dateFormat  : 'H:i',    // will be overridden by renderer
                    renderer    : function (value) {
                        return Ext.String.format(
                            '<div class="sch-calendarcolumn-ct">' +
                                '<span class="sch-calendarcolumn-hours">{0}</span>' +
                                '<span class="sch-calendarcolumn-minutes">{1}</span>' +
                            '</div>',

                            Ext.Date.format(value, 'H'),
                            Ext.Date.format(value, 'i')
                        );
                    }
                },
                middle  : {
                    unit        : 'WEEK',
                    align       : 'center',
                    dateFormat  : 'D d',
                    splitUnit   : 'DAY'
                }
            }
        }
    },

    constructor : function() {
        this.callParent(arguments);
        this.registerDefaults();
    },

    onLocalized : function () {
        var me = this;

        this.eachKey(function (name, preset) {
            if (me.l10n[name]) {
                var locale  = me.L(name);

                locale.displayDateFormat && (preset.displayDateFormat = locale.displayDateFormat);
                locale.middleDateFormat && (preset.headerConfig.middle.dateFormat = locale.middleDateFormat);
                locale.topDateFormat && (preset.headerConfig.top.dateFormat = locale.topDateFormat);
                locale.bottomDateFormat && (preset.headerConfig.bottom.dateFormat = locale.bottomDateFormat);
            }
        });
    },

    /**
    * Registers a new view preset to be used by any scheduler grid or tree on the page.
    * @param {String} name The unique name identifying this preset
    * @param {Object} config The configuration properties of the view preset (see {@link Sch.preset.ViewPreset} for more information)
    */
    registerPreset : function(name, cfg) {

        cfg.name = name;

        var preset = new Sch.preset.ViewPreset(cfg);

        if (preset.isValid()) {
            if (this.containsKey(name)) this.removeAtKey(name);

            this.add(name, preset);
        } else {
            throw 'Invalid preset, please check your configuration';
        }
    },

    /**
    * Fetches a view preset from the global cache
    * @param {String} name The name of the preset
    * @return {Object} The view preset, see {@link Sch.preset.ViewPreset} for more information
    */
    getPreset : function(name) {
        return this.get(name);
    },

    /**
    * Deletes a view preset
    * @param {String} name The name of the preset
    */
    deletePreset : function(name) {
        this.removeAtKey(name);
    },

    registerDefaults : function() {
        var pm = this,
            vp = this.defaultPresets;

        for (var p in vp) {
            pm.registerPreset(p, vp[p]);
        }
    }
});
