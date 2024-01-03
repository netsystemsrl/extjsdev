using System;
using CedHouseSuite.Tracciati.Converters;
using FileHelpers;

namespace CedHouseSuite.Tracciati.Mav.Ricezione
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public sealed class RecordEF
    {
        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1 = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string TipoRecord = "EF"; //Contenuto fisso “EF”

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string SiaMittente; //Stessi dati presenti sul record di testa

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Right, '0')]
        public string AbiRicevente; //Stessi dati presenti sul record di testa

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(ConverterKind.Date, "ddMMyy")]
        public DateTime DataCreazione; //Stessi dati presenti sul record di testa

        [FieldFixedLength(20)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string NomeSupporto; //Stessi dati presenti sul record di testa

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CampoADisposizione; //Campo a disposizione dell’azienda mittente

        [FieldFixedLength(7)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NumeroDisposizioni = 0; //Numero delle richieste di incasso M.AV. contenute nel flusso

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal TotImportiNegativi = 0; //Importo totale delle disposizioni contenute nel flusso

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal TotImportiPositivi = 0; //Valorizzato con “zeri”

        [FieldFixedLength(7)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NumeroRecord = 0; //Numero dei record che compongono il flusso, compresi i record di testa e coda

        [FieldFixedLength(24)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler90To113 = "";

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Divisa = "E"; //Divisa: valorizzare con “E”

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string CampoNonDisponibile = "";
    }
}
