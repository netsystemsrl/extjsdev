Ext.define('Ext.locale.it.pivot.Aggregators', {
    override: 'Ext.pivot.Aggregators',

    customText:                 'Custom',
    sumText:                    'Somma',
    avgText:                    'Media',
    countText:                  'Conteggio',
    minText:                    'Minimo',
    maxText:                    'Massimo',
    groupSumPercentageText:     'Gruppo somma percentuale',
    groupCountPercentageText:   'Gruppo conteggio percentuale',
    varianceText:               'Var',
    variancePText:              'Varp',
    stdDevText:                 'StdDev',
    stdDevPText:                'StdDevp'
});
/**
 * Italian translation by Federico Anzini
 *
 */

Ext.define('Ext.locale.it.pivot.Grid', {
    override: 'Ext.pivot.Grid',

    textTotalTpl:       'Totale ({name})',
    textGrandTotalTpl:  'Totale globale'
});
Ext.define('Ext.locale.it.pivot.plugin.RangeEditor', {
    override: 'Ext.pivot.plugin.RangeEditor',

    textWindowTitle:    'Modifica intervallo',
    textFieldValue:     'Valore',
    textFieldEdit:      'Campo',
    textFieldType:      'Tipo',
    textButtonOk:       'Ok',
    textButtonCancel:   'Cancella',

    updaters: [
        ['percentage', 'Percentuale'],
        ['increment', 'Incremento'],
        ['overwrite', 'Sovrascrivere'],
        ['uniform', 'Uniformare']
    ]
});Ext.define('Ext.locale.it.pivot.plugin.configurator.Column', {
    override: 'Ext.pivot.plugin.configurator.Column',

    sortAscText:                'Ordinamento A to Z',
    sortDescText:               'Ordinamento Z to A',
    sortClearText:              'Ordinamento disabilitato',
    clearFilterText:            'Cancella filtro da "{0}"',
    labelFiltersText:           'Etichetta filtro',
    valueFiltersText:           'Valore filtro',
    equalsText:                 'Uguale...',
    doesNotEqualText:           'Non uquale...',
    beginsWithText:             'Inizia con...',
    doesNotBeginWithText:       'Non inizia con...',
    endsWithText:               'Termina con...',
    doesNotEndWithText:         'Non termina con...',
    containsText:               'Contiene...',
    doesNotContainText:         'Non contiene...',
    greaterThanText:            'Più grande di...',
    greaterThanOrEqualToText:   'Più grande o uguale a...',
    lessThanText:               'Più piccolo di...',
    lessThanOrEqualToText:      'Più piccolo o uguale a...',
    betweenText:                'Compreso tra...',
    notBetweenText:             'Non compreso tra...',
    top10Text:                  'Top 10...',

    equalsLText:                'uguale a',
    doesNotEqualLText:          'non uguale a',
    beginsWithLText:            'inizia con',
    doesNotBeginWithLText:      'non inizia con',
    endsWithLText:              'termina con',
    doesNotEndWithLText:        'non termina con',
    containsLText:              'contiene',
    doesNotContainLText:        'non contiene',
    greaterThanLText:           'è più grande di',
    greaterThanOrEqualToLText:  'è più grande o uguale a',
    lessThanLText:              'è più piccolo di',
    lessThanOrEqualToLText:     'è più piccolo o uguale a',
    betweenLText:               'è compreso tra',
    notBetweenLText:            'non è compreso tra',
    top10LText:                 'Top 10...',
    topOrderTopText:            'Sopra',
    topOrderBottomText:         'Sotto',
    topTypeItemsText:           'Elementi',
    topTypePercentText:         'Percentuale',
    topTypeSumText:             'Somma'

});Ext.define('Ext.locale.it.pivot.plugin.configurator.Panel', {
    override: 'Ext.pivot.plugin.configurator.Panel',

    panelAllFieldsText:     'Inserisci i campi inutilizzati qui',
    panelTopFieldsText:     'Inserisci i campi colonna qui',
    panelLeftFieldsText:    'Inserisci i campi riga qui',
    panelAggFieldsText:     'Inserisci i campi aggregati qui',
    panelAllFieldsTitle:    'Tutti i Campi',
    panelTopFieldsTitle:    'Nome Colonna',
    panelLeftFieldsTitle:   'Nome Riga',
    panelAggFieldsTitle:    'Valore',
    addToText:              'Aggiungi to {0}',
    moveToText:             'Muovi to {0}',
    removeFieldText:        'Rimuovi Campo',
    moveUpText:             'Sposta Su',
    moveDownText:           'Sposta Giu',
    moveBeginText:          'Sposta a Inizio',
    moveEndText:            'Sposta a Fine',
    formatText:             'Formatta',
    fieldSettingsText:      'Imposta Campo'
});Ext.define('Ext.locale.it.pivot.plugin.configurator.window.FieldSettings', {
    override: 'Ext.pivot.plugin.configurator.window.FieldSettings',

    title:              'Imposta Campo',
    formatText:         'Formatta',
    summarizeByText:    'Operazione',
    customNameText:     'Nome',
    sourceNameText:     'Nome Origine',
    alignText:          'Allinea',
    alignLeftText:      'Sinistra',
    alignCenterText:    'Centro',
    alignRightText:     'Destra'
});
Ext.define('Ext.locale.it.pivot.plugin.configurator.window.FilterLabel',{
    override: 'Ext.pivot.plugin.configurator.window.FilterLabel',

    titleText:          'Etichetta filtro ({0})',
    fieldText:          'Visualizza elementi per i quali l\'etichetta',
    caseSensitiveText:  'Sensibile alle maiuscole'
});Ext.define('Ext.locale.it.pivot.plugin.configurator.window.FilterTop',{
    override: 'Ext.pivot.plugin.configurator.window.FilterTop',

    titleText:      'Filtro Top 10 ({0})',
    fieldText:      'Visualizza',
    sortResultsText:'Ordina i risultati'
});Ext.define('Ext.locale.it.pivot.plugin.configurator.window.FilterValue',{
    override: 'Ext.pivot.plugin.configurator.window.FilterValue',

    titleText:      'Valore filtro ({0})',
    fieldText:      'Visualizza elementi per i quali'
});