﻿using FileHelpers;

namespace CedHouseSuite.Tracciati.Mav.Invio
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public sealed class Record50
    {
        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1 = "";

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string TipoRecord = "50"; //Contenuto fisso “50”

        [FieldFixedLength(7)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NumeroProgressivo = 0; //Stesso valore presente nel record 14

        [FieldFixedLength(40)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string RiferimentiAlDebito1 = ""; //Riferimenti al debito

        [FieldFixedLength(40)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string RiferimentiAlDebito2 = ""; //Riferimenti al debito

        [FieldFixedLength(30)]
        [FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler91To120 = "";
    }
}
