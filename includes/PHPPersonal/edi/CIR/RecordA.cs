using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.DetrazioniFiscali.CIR_2022
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public class RecordA
    {
        [FieldFixedLength(1)]
        public string TipoRecord = "A";
        [FieldFixedLength(14)]
        public readonly string Filler2to15 = "";

        [FieldFixedLength(5)]
        public readonly string CodiceFornitura = "CIR20";

        /// <summary>
        /// RECORD 4<br />
        /// "01" - Soggetto beneficiario o condominio<br />
        /// "02" - Aministratore di condominio con abilitazione Entratel M10 o M11<br />
        /// "10" - Intermediario
        /// </summary>
        [FieldFixedLength(2), FieldAlign(AlignMode.Right, '0')]
        public readonly string TipoFornitore = "10";

        /// <summary>
        /// Se il tipo fornitore è '01' e il codice carica (campo 13 del record B) è diverso da '2' e da '7' il codice fiscale del fornitore deve essere uguale al codice fiscale del soggetto beneficiario o condominio o condomino incaricato (campo 2 del record B)
        /// <br />Se il tipo fornitore è '01' e il codice carica (campo 13 del record B) è uguale a '2' o '7'  il codice fiscale del fornitore deve essere uguale al codice fiscale del rappresentante (campo 12 del record B)
        /// <br />Se il tipo fornitore è '02' il codice fiscale del fornitore deve essere uguale al codice fiscale dell'amministratore di condominio  (campo 17 del record B)
        /// </summary>
        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscaleFornitore = "";

        [FieldFixedLength(483), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler39to521 = "";

        [FieldFixedLength(4), FieldAlign(AlignMode.Left, '0')]
        public readonly string Filler522to525 = "";

        [FieldFixedLength(4), FieldAlign(AlignMode.Left, '0')]
        public readonly string Filler526to529 = "";

        [FieldFixedLength(100), FieldAlign(AlignMode.Left, ' ')]
        public string Utente530to629 = "";

        [FieldFixedLength(1068), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler630to1697 = "";

        [FieldFixedLength(200), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Riservato = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Terminatore = "A";
    }
}