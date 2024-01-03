using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.F24INTERMEDIARIO
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public sealed class RecordA
    {
        public RecordA()
        {
            TipoRecord = "A";
            CodiceFornitura = "F24A0";
            TipoFornitore = "14";
            Progressivo = "001";
            Invii = "001";
            TipoRecordChiusura = "A";
        }



        [FieldFixedLength(1)]
        public readonly string TipoRecord;

        [FieldFixedLength(14)]
        public readonly string Filler1 = "";

        [FieldFixedLength(5)]
        public string CodiceFornitura;

        [FieldFixedLength(2)]
        public string TipoFornitore;

        [FieldFixedLength(16)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscale;

        [FieldFixedLength(24)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CognomeFisica;

        [FieldFixedLength(20)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string NomeFisica;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string SessoFisica = "";

        [FieldFixedLength(8)]
        [FieldAlign(AlignMode.Right, '0')]
        public string DataNascitaFisica = "0";

        [FieldFixedLength(40)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ComuneNascitaFisica = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ProvinciaNascitaFisica = "";

        [FieldFixedLength(40)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ComuneResidenzaFisica = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ProvinciaResidenzaFisica = "";

        [FieldFixedLength(35)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string IndirizzoFisica = "";

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CapFisica = "0";



        [FieldFixedLength(60)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string DenominazioneNonFisica;

        [FieldFixedLength(40)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ComuneNonFisica = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ProvinciaNonFisica = "";

        [FieldFixedLength(35)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string IndirizzoNonFisica = "";

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CapNonFisica = "0";

        [FieldFixedLength(40)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ComuneDomicilioNonFisica = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ProvinciaDomicilioNonFisica = "";

        [FieldFixedLength(35)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string IndirizzoDomicilioNonFisica = "";

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CapDomicilioNonFisica = "0";


        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string FlagOrigine = "";

        [FieldFixedLength(14)]
        public readonly string Filler441To454 = "";

        [FieldFixedLength(12)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string TelefonoIntermediario = "";

        [FieldFixedLength(55)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string EmailIntermediario = "";

        [FieldFixedLength(3)]
        public readonly string Progressivo;

        [FieldFixedLength(3)]
        public string Invii;

        [FieldFixedLength(100)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler528To627 = "";

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string FlagAccettazione = "";

        [FieldFixedLength(1269)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler629To1897 = "";

        [FieldFixedLength(1)]
        public readonly string TipoRecordChiusura;


        //[FieldFixedLength(13)]
        //[FieldAlign(AlignMode.Right, '0')]
        //[FieldConverter(typeof(TwoDecimalConverter))]
        //public decimal Importo;

        //[FieldFixedLength(7)]
        //[FieldAlign(AlignMode.Right, '0')]
        //public int ProtocolloDelega;

    }
}
