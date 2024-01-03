/**
 * @class Gnt.feature.LabelEditor
 * @protected
 * @extends Ext.Editor
 *
 * Internal class used by the Gantt chart internals allowing inline editing of the task labels.
 */
Ext.define("Gnt.feature.LabelEditor", {
    extend : "Ext.Editor",

    /**
     * @cfg {String} labelPosition Identifies which side of task this editor is used for. Possible values: 'left', 'right', 'top' or 'bottom'.
     * @property
     */
    labelPosition : '',

    triggerEvent    : 'dblclick',

    // private, must be supplied
    delegate        : null,

    // The field name to edit - private, must be supplied
    dataIndex       : null,
    shadow          : false,
    completeOnEnter : true,
    cancelOnEsc     : true,
    ignoreNoChange  : true,
    ganttView       : null,

    constructor     : function (ganttView, config) {
        this.ganttView = ganttView;
        this.ganttView.on({
            afterrender : this.onGanttRender,
            destroy     : this.onGanttDestroy,
            scope       : this
        });

        // In 6.2.0 we make normal column unfocusable thus we need
        // to manually close editor on click in view
        if (Ext.getVersion().isGreaterThan('6.2.0')) {
            this.ganttView.on({
                itemclick   : this.onGanttItemClick,
                scope       : this
            });
        }

        Ext.apply(this, config);

        if (this.labelPosition === 'left') {
            this.alignment = 'r-r';
        } else if (this.labelPosition === 'right') {
            this.alignment = 'l-l';
        } else {
            // default for editor is c-c? (constrained)
            // which dosen't work in our case
            this.alignment = 'c-c';
        }

        this.delegate = '.sch-gantt-label-' + this.labelPosition;

        this.callParent([config]);
    },

    onGanttItemClick : function () {
        this.completeEdit();
    },

    // Programmatically enter edit mode
    // Will use first instance of event
    edit : function (record) {

        if (!record.isEditable(this.dataIndex)) {
            return;
        }

        var elements = this.ganttView.getElementsFromEventRecord(record),
            eventEl = elements && elements[0];

        if (eventEl) {
            var wrap = eventEl.up(this.ganttView.eventWrapSelector);

            this.record = record;

            if (!this.rendered) {
                this.render(this.ganttView.getEl());
            }

            this.startEdit(wrap.down(this.delegate), this.dataIndex ? record.get(this.dataIndex) : '');
        }
    },

    onGanttRender : function (ganttView) {

        if (!this.field.width) {
            this.autoSize = 'width';
        }

        this.on({
            beforestartedit : function (editor, el, value) {
                return ganttView.fireEvent('labeledit_beforestartedit', ganttView, this.record, value, editor);
            },
            beforecomplete  : function (editor, value, original) {
                return ganttView.fireEvent('labeledit_beforecomplete', ganttView, value, original, this.record, editor);
            },
            complete        : function (editor, value, original) {
                this.record.set(this.dataIndex, value);
                ganttView.fireEvent('labeledit_complete', ganttView, value, original, this.record, editor);
            },
            scope           : this
        });

        ganttView.el.on(this.triggerEvent, function (e, t) {
            this.edit(ganttView.resolveTaskRecord(t));
        }, this, {
            delegate : this.delegate
        });
    },

    onGanttDestroy : function () {
        this.destroy();
    }
});
