using System;
using CedHouseSuite.Tracciati.Converters;
using FileHelpers;

namespace CedHouseSuite.Tracciati.TD896.Ricezione
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    //[FixedLengthRecord(FixedMode.AllowLessChars)]

    public sealed class Record896
    {
        //[FieldFixedLength(8)]
        //[FieldAlign(AlignMode.Right, '0')]
        //public int ProgressivoCaricamento;

        [FieldFixedLength(3)]
        [FieldAlign(AlignMode.Right, '0')]
        public int IdentificativoBobina; // 3 crt - identificativo bobina;

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Right, '0')]
        public int ProgressivoBobina; // 5 crt - progressivo all’interno della bobina.

        [FieldFixedLength(7)]
        [FieldAlign(AlignMode.Right, '0')]
        public int ProgressivoSelezione;

        [FieldFixedLength(12)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CCBeneficiario;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(DateTimeOptionalConverter), "yyMMdd", "      ")]
        public DateTime DataAccettazione; // Data di pagamento del bollettino nel formato AAMMGG

        /*
        247 = premarcati Mav;
        896 = premarcati fatturatori;
        674 = premarcati non fatturatori;
        451 = bianchi personalizzati;
        123 = bianchi 
         */
        [FieldFixedLength(3)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string TipoDocumento;

        [FieldFixedLength(10)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal Importo = 0;

        [FieldFixedLength(3)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Provincia;

        [FieldFixedLength(3)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Ufficio;

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Sportello;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int Divisa; // ‘2’ = Euro

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(DateTimeOptionalConverter), "yyMMdd", "      ")]
        public DateTime DataContabile; // Data di accreditamento AAMMGG

        [FieldFixedLength(16)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceCliente; // Dati del IV campo

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CIN; // Codice di controllo del IV Campo (Modulo 93)

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string TipologiaAccettazione; // CC = Bollettino Cartaceo / AV = AVDS / DP = Dematerializzato Premarcato / DI = Dematerializzato con Immagine

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string BollettinoSostitutivo; // ‘S’ - Bollettino sostitutivo / ‘N’ - Bollettino originale

        [FieldFixedLength(118)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Filler;

    }
}