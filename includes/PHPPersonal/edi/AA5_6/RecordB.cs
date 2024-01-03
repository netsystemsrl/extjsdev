using System;
using CedHouseSuite.Tracciati.Converters;
using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.AA5_6._2022
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public class RecordB
    {
        /// <summary>
        /// Field 1
        /// </summary>
        [FieldFixedLength(1)] 
        private readonly string TipoRecord = "B";

        /// <summary>
        /// Field 2
        /// </summary>
        [FieldFixedLength(11), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscaleIdentificativo = "";

        /// <summary>
        /// Field 3
        /// </summary>
        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public int TipoDichiarazione = 1;

        /// <summary>
        /// Field 4
        /// </summary>
        [FieldFixedLength(8), FieldAlign(AlignMode.Left, '0'),
         FieldConverter(typeof(DateTimeOptionalConverter), "ddMMyyyy", "")]
        public DateTime? DataDichiarazione = null;

        /// <summary>
        /// Field 5
        /// </summary>
        [FieldFixedLength(11), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscale = "";

        /// <summary>
        /// Field 6
        /// </summary>
        [FieldFixedLength(150), FieldAlign(AlignMode.Left, ' ')]
        public string Denominazione = "";

        /// <summary>
        /// Field 7
        /// </summary>
        [FieldFixedLength(2), FieldAlign(AlignMode.Right, '0')]
        public string NaturaGiuridica = "";

        /// <summary>
        /// Field 8
        /// </summary>
        [FieldFixedLength(15), FieldAlign(AlignMode.Left, ' ')]
        public string Sigla = "";

        /// <summary>
        /// Field 9
        /// </summary>
        [FieldFixedLength(4), FieldAlign(AlignMode.Right, '0')]
        public string TermineApprovazioneBilancio = "";

        /// <summary>
        /// Field 10
        /// </summary>
        [FieldFixedLength(6), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceAttività = "";

        [FieldFixedLength(76)]
        [FieldConverter(typeof(AddressConverter))]
        public readonly Address SedeLegale = new Address();

        [FieldFixedLength(76)]
        [FieldConverter(typeof(AddressConverter))]
        public readonly Address DomicilioFiscale = new Address();

        [FieldFixedLength(139)]
        [FieldConverter(typeof(RappresentanteConverter))]
        public readonly Rappresentante Rappresentante = new Rappresentante();

        [FieldFixedLength(588)]
        [FieldConverter(typeof(QuadroDConverter))]
        private readonly QuadroD QuadroD = new QuadroD();

        [FieldFixedLength(3), FieldAlign(AlignMode.Right, '0')]
        public string NumeroPagine = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Right, '0')]
        public string DataPresentazione = "";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CFPresentazione = "";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CFIntermediario = "";

        [FieldFixedLength(5), FieldAlign(AlignMode.Left, '0')]
        public string NumeroCAF = "";

        /// <summary>
        /// Record 76
        /// </summary>
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public string ImpegnoATrasmettere = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Left, '0'), FieldConverter(typeof(DateTimeOptionalConverter), "ddMMyyyy", "")]
        public DateTime? DataImpegno ;


        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CFProduttoreSoftware = "";

        [FieldFixedLength(2339), FieldAlign(AlignMode.Left, ' ')]
        private readonly string Filler = "";

        [FieldFixedLength(3), FieldAlign(AlignMode.Left, ' ')]
        private readonly string ControlChars = "F" + '\u000D' + '\u000A';
    }

    [FixedLengthRecord(FixedMode.ExactLength)]
    public class Address
    {
        [FieldFixedLength(35), FieldAlign(AlignMode.Left, ' ')]
        public string Indirizzo = "";

        [FieldFixedLength(5), FieldAlign(AlignMode.Left, '0')]
        public string Cap = "";

        [FieldFixedLength(4), FieldAlign(AlignMode.Left, ' ')]
        private string Filler = "";

        [FieldFixedLength(30), FieldAlign(AlignMode.Left, ' ')]
        public string Comune = "";

        [FieldFixedLength(2), FieldAlign(AlignMode.Left, ' ')]
        public string Provincia = "";
    }

    [FixedLengthRecord(FixedMode.ExactLength)]
    public class Rappresentante
    {
        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscale = "";

        [FieldFixedLength(2), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceCarica = "";

        [FieldFixedLength(40), FieldAlign(AlignMode.Left, ' ')]
        public string Cognome = "";

        [FieldFixedLength(40), FieldAlign(AlignMode.Left, ' ')]
        public string Nome = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public string Sesso = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Left, '0'),
         FieldConverter(typeof(DateTimeOptionalConverter), "ddMMyyyy", "")]
        public DateTime? DataNascita ;

        [FieldFixedLength(30), FieldAlign(AlignMode.Left, ' ')]
        public string ComuneNascita = "";

        [FieldFixedLength(2), FieldAlign(AlignMode.Left, ' ')]
        public string ProvinciaNascita = "";

    }

    [FixedLengthRecord(FixedMode.ExactLength)]
    public class QuadroD
    {
        [FieldFixedLength(3), FieldAlign(AlignMode.Left, '0')]
        private string NotUsedInt = "";

        [FieldFixedLength(341), FieldAlign(AlignMode.Left, '0')]
        private string NotUsedCF = "";

        [FieldFixedLength(152), FieldAlign(AlignMode.Left, ' ')]
        private string NotUsedChars = "";

        [FieldFixedLength(35), FieldAlign(AlignMode.Left, ' ')]
        private string NotUsedAddress = "";
        [FieldFixedLength(5), FieldAlign(AlignMode.Left, '0')]
        private string NotUsedCap = "";
        [FieldFixedLength(36), FieldAlign(AlignMode.Left, ' ')]
        private string NotUsedfld = "";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        private string NotUsedothercF = "";
    }

    public class AddressConverter : ConverterBase
    {
        public override object StringToField(string @from)
        {
            throw new NotImplementedException();
        }

        public override string FieldToString(object @from)
        {

            var engine = new FixedFileEngine(typeof(Address));
            return engine.WriteString(new[] { @from });
        }
    }
    public class RappresentanteConverter : ConverterBase
    {
        public override object StringToField(string @from)
        {
            throw new NotImplementedException();
        }

        public override string FieldToString(object @from)
        {

            var engine = new FixedFileEngine(typeof(Rappresentante));
            return engine.WriteString(new[] { @from });
        }
    }
    public class QuadroDConverter : ConverterBase
    {
        public override object StringToField(string @from)
        {
            throw new NotImplementedException();
        }

        public override string FieldToString(object @from)
        {

            var engine = new FixedFileEngine(typeof(QuadroD));
            var result = engine.WriteString(new[] { @from });
            return result;
        }
    }
}