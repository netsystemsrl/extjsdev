// For RTL, cell editor misaligns when editing in the tree column
Ext.define('Gnt.patches.CellEditor', {
    extend : 'Sch.util.Patch',

    target     : 'Ext.grid.CellEditor',

    overrides : {
        realign: function(autoSize) {
            var me = this,
                boundEl = me.boundEl,
                innerCell = boundEl.dom.querySelector(me.context.view.innerSelector),
                innerCellTextNode = innerCell.firstChild,
                width = boundEl.getWidth(),
                grid = me.grid,
                xOffset,
                v = '',
                // innerCell is empty if there are no children, or there is one text node, and it contains whitespace
                isEmpty = !innerCellTextNode || (innerCellTextNode.nodeType === 3 && !(Ext.String.trim(v = innerCellTextNode.data).length));
            if (me.isForTree) {
                // When editing a tree, adjust the width and offsets of the editor to line
                // up with the tree cell's text element
                xOffset = me.getTreeNodeOffset(innerCell);
                width -= Math.abs(xOffset);
            }
            if (grid.columnLines) {
                // Subtract the column border width so that the editor displays inside the
                // borders. The column border could be either on the left or the right depending
                // on whether the grid is RTL - using the sum of both borders works in both modes.
                width -= boundEl.getBorderWidth('rl');
            }
            if (autoSize === true) {
                me.field.setWidth(width);
            }
            // https://sencha.jira.com/browse/EXTJSIV-10871 Ensure the data bearing element has a height from text.
            if (isEmpty) {
                innerCell.innerHTML = 'X';
            }
            me.alignTo(boundEl, me.alignment);

            // alignTo does not handle offsets WRT RTL, so
            // we offset the editor's X position here.
            if (xOffset) {
                me.setX(me.getX() + xOffset);
            }
            if (isEmpty) {
                innerCell.firstChild.data = v;
            }
        }
    }
});
