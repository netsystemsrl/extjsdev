using System;
using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.F24INTERMEDIARIO
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public sealed class RecordM
    {
        public RecordM()
        {
            TipoRecord = "M";
            Progressivo = "00000001";
            ValutaDelega = "E";
            Valuta = "EURO";
            TipoRecordChiusura = "A";
        }



        [FieldFixedLength(1)]
        public readonly string TipoRecord;

        [FieldFixedLength(16)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscale;

        [FieldFixedLength(8)]
        public string Progressivo;

        [FieldFixedLength(3)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler26to28 = "";

        [FieldFixedLength(25)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler29to53 = "";

        [FieldFixedLength(20)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler54to73 = "";

        [FieldFixedLength(16)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler74to89 = "";

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler90to91 = "";

        [FieldFixedLength(1)]
        public readonly string ValutaDelega;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int EsercizioCavallo;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int FlagVersante;  //Dovrebbe essere 1 

        [FieldFixedLength(16)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscaleVersante;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int TipoVersante;  //Dovrebbe essere 1 

        [FieldFixedLength(24)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CognomeVersante;

        [FieldFixedLength(20)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string NomeVersante;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string SessoVersante = "";

        [FieldFixedLength(8)]
        [FieldAlign(AlignMode.Right, '0')]
        public string DataNascitaVersante = "0";

        [FieldFixedLength(40)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ComuneNascitaVersante = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ProvinciaNascitaVersante = "";

        [FieldFixedLength(40)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ComuneResidenzaVersante = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ProvinciaResidenzaVersante = "";

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CapVersante = "0";

        [FieldFixedLength(35)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string IndirizzoVersante = "";

        //Residenza anagrafica contribuente facoltativo
        [FieldFixedLength(40)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ComuneResidenzaContribuente = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ProvinciaResidenzaContribuente = "";

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CapResidenzaContribuente = "0";

        [FieldFixedLength(35)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string IndirizzoResidenzaContribuente = "";

        [FieldFixedLength(12)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string TelefonoContribuente = "";

        [FieldFixedLength(56)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler382To437 = "";



        //Data anagrafici del contribuente persona fisica

        [FieldFixedLength(24)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CognomeFisica;

        [FieldFixedLength(20)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string NomeFisica;

        [FieldFixedLength(8)]
        [FieldAlign(AlignMode.Right, '0')]
        public string DataNascitaFisica = "0";

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string SessoFisica = "";

        [FieldFixedLength(25)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ComuneNascitaFisica = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ProvinciaNascitaFisica = "";


        //Data anagrafici del contribuente non persona fisica

        [FieldFixedLength(55)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string DenominazioneNonFisica;

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceIdentificativoCoobbligato;

        [FieldFixedLength(16)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscaleCoobbligato;


        [FieldFixedLength(1150)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler591To1740 = "";

        //Conto di addebito

        [FieldFixedLength(27)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Iban = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string TipoTitolareConto;

        [FieldFixedLength(16)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscaleTitolare;


        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string ABI;

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CAB;

        [FieldFixedLength(12)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CONTO;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CIN;

        [FieldFixedLength(60)]
        public readonly string Filler1809To1868 = "";

        //Riepilogo delega

        [FieldFixedLength(4)]
        public readonly string Valuta;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string SaldoDebito;

        [FieldFixedLength(10)]
        [FieldAlign(AlignMode.Left, ' ')]
        [FieldConverter(ConverterKind.Date, "dd-MM-yyyy")]
        public DateTime DataVersamento;

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
