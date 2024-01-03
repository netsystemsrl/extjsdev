/*
 * @class Sch.model.TimeAxisTick
 * @extends Sch.model.Range
 *
 * A simple model with a start/end date interval defining a 'tick' on the time axis.
 */
Ext.define('Sch.model.TimeAxisTick', {
    extend         : 'Sch.model.Range',

    isTimeAxisTickModel : true,

    startDateField : 'start',
    endDateField   : 'end'
});
