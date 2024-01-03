Ext.define('Robo.util.Array', {
    singleton : true,

    reduce : function (array, reduceFn, initialValue) {
        array = Object(array);
        //<debug>
        if (!Ext.isFunction(reduceFn)) {
            Ext.raise('Invalid parameter: expected a function.');
        }
        //</debug>

        var index   = 0,
            length  = array.length >>> 0,
            reduced = initialValue;

        if (arguments.length < 3) {
            while (true) {
                if (index in array) {
                    reduced = array[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError('Reduce of empty array with no initial value');
                }
            }
        }

        for (; index < length; ++index) {
            if (index in array) {
                reduced = reduceFn(reduced, array[index], index, array);
            }
        }

        return reduced;
    }
});
