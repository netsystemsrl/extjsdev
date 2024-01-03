Ext.define('Sch.data.util.recurrence.DayRuleEncoder', {

    singleton : true,

    dayParseRegExp : /^([+-]?[0-9])?(SU|MO|TU|WE|TH|FR|SA)$/,

    decodeDay : function (rawDay) {
        var parsedDay,
            result;

        if ((parsedDay = this.dayParseRegExp.exec(rawDay))) {

            result = [];

            // parse day name
            switch (parsedDay[2]) {
                case "SU": result.push(0); break;
                case "MO": result.push(1); break;
                case "TU": result.push(2); break;
                case "WE": result.push(3); break;
                case "TH": result.push(4); break;
                case "FR": result.push(5); break;
                case "SA": result.push(6); break;
            }

            // optional position number
            if (result) {
                if (parsedDay[1]) parsedDay[1] = parseInt(parsedDay[1], 10);
                result.push(parsedDay[1]);
            }
        }

        return result;
    },

    encodeDay : function (day) {
        var position;

        // support decodeDay() result format
        if (Ext.isArray(day)) {
            day      = day[0];
            position = day[1];
        }

        var result = position ? position.toString() : '';

        switch (day) {
            case 0: result += "SU"; break;
            case 1: result += "MO"; break;
            case 2: result += "TU"; break;
            case 3: result += "WE"; break;
            case 4: result += "TH"; break;
            case 5: result += "FR"; break;
            case 6: result += "SA"; break;
        }

        return result;
    },

    // Turns days values provided as an array of strings (like ["-1MO", "SU", "+3FR"])
    // into an array of [ dayIndex, position ] elements, where:
    //
    // - `dayIndex` - zero-based week day index value (0 - Sunday, 1 - Monday, 2 - Tuesday, etc.)
    // - `position` - (optional) 1-based position of the day (integer value (can be both positive and negative))
    decode : function (rawDays) {
        var result = [],
            parsedDay;

        if (rawDays) {
            for (var i = 0; i < rawDays.length; i++) {
                if ((parsedDay = this.decodeDay(rawDays[i]))) {
                    result.push(parsedDay);
                }
            }
        }

        return result;
    },

    encode : function (days) {
        var result = [],
            day;

        if (days) {
            for (var i = 0; i < days.length; i++) {
                if ((day = this.encodeDay(days[i]))) {
                    result.push(day);
                }
            }
        }

        return result;
    }
});