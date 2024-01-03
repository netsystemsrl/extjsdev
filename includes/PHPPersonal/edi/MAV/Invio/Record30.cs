using FileHelpers;

namespace CedHouseSuite.Tracciati.Mav.Invio
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public sealed class Record30
    {
        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1 = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string TipoRecord = "30"; //Contenuto fisso “30”

        [FieldFixedLength(7)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NumeroProgressivo = 0; //Stesso valore presente nel record 14

        [FieldFixedLength(30)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string DescrizioneDebitore1 = ""; //Descrizione del debitore (obbligatoria)

        [FieldFixedLength(30)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string DescrizioneDebitore2 = ""; //Descrizione del debitore (obbligatoria)

        [FieldFixedLength(16)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscale = ""; //Codice fiscale del cliente debitore

        [FieldFixedLength(34)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler87To120 = "";
    }
}
