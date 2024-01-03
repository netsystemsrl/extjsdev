using System;
using CedHouseSuite.Tracciati.Converters;
using FileHelpers;

namespace CedHouseSuite.Tracciati.TD896.Ricezione
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public sealed class Record999
    {
        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CUAS;

        [FieldFixedLength(12)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CCBeneficiario;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(DateTimeOptionalConverter), "yyMMdd", "      ")]
        public DateTime? DataContabile;

        [FieldFixedLength(14)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Filler1;

        [FieldFixedLength(3)]
        [FieldAlign(AlignMode.Right, '0')]
        public string IdentificativoRiepilogo; // Valorizzato con “999”.

        [FieldFixedLength(8)]
        [FieldAlign(AlignMode.Right, '0')]
        public int TotaleDocumenti;

        [FieldFixedLength(12)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoTotale = 0;

        [FieldFixedLength(8)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NrDocumentiEsatti;

        [FieldFixedLength(12)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDocumentiEsatti = 0;

        [FieldFixedLength(8)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NrDocumentiErrati;

        [FieldFixedLength(12)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDocumentiErrati = 0;

        [FieldFixedLength(104)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string Filler2;

    }
}