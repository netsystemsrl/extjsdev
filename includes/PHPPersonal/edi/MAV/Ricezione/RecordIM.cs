using System;
using FileHelpers;

namespace CedHouseSuite.Tracciati.Mav.Ricezione
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public sealed class RecordIM
    {
        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1 = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string TipoRecord = "IM"; //Contenuto fisso “IM”

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string SiaMittente; //Codice SIA del cliente mittente

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Right, '0')]
        public string AbiRicevente; //Codice ABI della banca a cui sono destinate le disposizioni

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(ConverterKind.Date, "ddMMyy")]
        public DateTime DataCreazione; //Data di creazione del flusso da parte dell’azienda mittente nel formato GGMMAA

        [FieldFixedLength(20)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string NomeSupporto; //Campo di libera composizione da parte dell’azienda mittente. Deve essere univoco nell’ambito della data di creazione e a parità di mittente e ricevente

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CampoADisposizione; //Campo a disposizione dell’azienda mittente

        [FieldFixedLength(59)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler46To104 = "";

        [FieldFixedLength(7)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string QualificatoreFlusso; //Campo a disposizione dell’azienda mittente

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler112To113 = "";

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Divisa = "E"; //Divisa: valorizzare con “E”

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler115 = "";

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string CampoNonDisponibile = "";
    }
}
