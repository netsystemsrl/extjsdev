Ext.define('dynamicounter', {
    alias: 'widget.dynamicounter',
    
    extend: 'Ext.form.TimeField',
    counter: 0,
    counterTask: null,
    initComponent: function () {
        var me = this;

        me.callParent(arguments);

        me.setValue(me.secondsToHHMMSS(me.counter));

        me.counterTask = Ext.TaskManager.start({
            run: function () {
                me.counter++;
                me.setValue(me.secondsToHHMMSS(me.counter));
            },
            interval: 1000
        });
    },

    onDestroy: function () {
        var me = this;

        if (me.counterTask) {
            Ext.TaskManager.stop(me.counterTask);
            me.counterTask = null;
        }

        me.callParent();
    },

    secondsToHHMMSS: function (totalSeconds) {
        var hours = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
        var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

        // round seconds
        seconds = Math.round(seconds * 100) / 100

        var result = (hours < 10 ? "0" + hours : hours);
        result += ":" + (minutes < 10 ? "0" + minutes : minutes);
        result += ":" + (seconds < 10 ? "0" + seconds : seconds);
        return result;
    }
});