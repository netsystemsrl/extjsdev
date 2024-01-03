/**
 @class Robo.widget.RedoButton

 A subclass of ExtJS split button, integrated with the {@link Robo.Manager} and reflecting the current list of Robo transactions,
 available for "redo".

 See the base class for a list of available config options.

 */
Ext.define('Robo.widget.RedoButton', {
    extend : 'Robo.widget.UndoButton',

    alias : 'widget.roboredobutton',

    iconCls : Ext.baseCSSPrefix + 'fa fa-repeat fa-redo', // fa-redo is available in 7.0

    type : 'redo',

    text : 'Redo'
});
