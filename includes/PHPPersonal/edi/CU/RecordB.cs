using System;
using CedHouseSuite.Tracciati.Converters;
using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.CU.CU_2021
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public class RecordB
    {
        [FieldFixedLength(1)]
        public readonly string TipoRecord = "B";

        /// <summary>
        /// Record 2
        /// </summary>
        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscaleDichiarante = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Right, '0')]
        public int ProgressivoModulo = 1;

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler26 = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler27to34 = "";

        [FieldFixedLength(25), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler35to59 = "";

        [FieldFixedLength(14), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Utente60to73 = "";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public readonly string IdentificativoProduttoreSoftware = Costanti.PIVA_PRODUTTORE_SOFTWARE;

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler90 = "";

        #region Tipo di Dichiarazione
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbFlagAnnullamento = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbFlagSostituzione = "0";
        #endregion

        #region Dati del Contribuente
        [FieldFixedLength(24), FieldAlign(AlignMode.Left, ' ')]
        public string Cognome = "";

        [FieldFixedLength(20), FieldAlign(AlignMode.Left, ' ')]
        public string Nome = "";

        [FieldFixedLength(60), FieldAlign(AlignMode.Left, ' ')]
        public string Denominazione = "";

        [FieldFixedLength(100), FieldAlign(AlignMode.Left, ' ')]
        public string IndirizzoEmail = "";

        [FieldFixedLength(12), FieldAlign(AlignMode.Left, ' ')]
        public string TelefonoFax = "";

        /// <summary>
        /// Record 17
        /// </summary>
        [FieldFixedLength(2), FieldAlign(AlignMode.Right, ' ')]
        public string EventiEccezionali = "";
        #endregion

        #region Firmatario
        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string Firmatario_CodiceFiscale = "";

        /// <summary>
        /// Record 19
        /// </summary>
        [FieldFixedLength(2), FieldAlign(AlignMode.Right, '0')]
        public string Firmatario_CodiceCarica = "";

        [FieldFixedLength(24), FieldAlign(AlignMode.Left, ' ')]
        public string Firmatario_Cognome = "";

        [FieldFixedLength(20), FieldAlign(AlignMode.Left, ' ')]
        public string Firmatario_Nome = "";

        [FieldFixedLength(11), FieldAlign(AlignMode.Right, '0')]
        public string Firmatario_CodiceFiscaleSocieta = "";
        #endregion

        #region Firma della Comunicazione
        // [FieldFixedLength(19), FieldAlign(AlignMode.Left, ' ')] -- yf 2021-02-19
        [FieldFixedLength(18), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler394to401 = string.Empty;

        [FieldFixedLength(8), FieldAlign(AlignMode.Right, '0')]
        public int NumeroCertificazioni_Autonomo = 0;

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public readonly string CbQuadroCT = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public readonly string CbFirma = "1";
        #endregion

        #region Impegno
        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string Intermediario_CodiceFiscale = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public string Intermediario_ImpegnoTrasmissione = "2";

        [FieldFixedLength(8), FieldAlign(AlignMode.Left, '0'), FieldConverter(typeof(DateTimeOptionalConverter), "ddMMyyyy", "")]
        public DateTime? Intermediario_DataImpegno = null;

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public readonly string Intermediario_CbFirma = "1";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public string Filler438 = "";

        [FieldFixedLength(40), FieldAlign(AlignMode.Left, ' ')]
        public string Filler439to478 = "";

        [FieldFixedLength(2), FieldAlign(AlignMode.Left, ' ')]
        public string Filler479to480 = "";

        [FieldFixedLength(5), FieldAlign(AlignMode.Left, ' ')]
        public string Filler481to485 = "";

        [FieldFixedLength(35), FieldAlign(AlignMode.Left, ' ')]
        public string Filler486to520 = "";

        [FieldFixedLength(6), FieldAlign(AlignMode.Left, ' ')]
        public string Filler521to526 = "";

        /// <summary>
        /// Record 37
        /// </summary>
        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public string CasellaCasiParticolari = "";

        [FieldFixedLength(11), FieldAlign(AlignMode.Left, ' ')]
        public string Filler528to538 = "";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string Filler539 = "";

        [FieldFixedLength(1289), FieldAlign(AlignMode.Left, ' ')]
        public string Filler555 = "";

        #endregion

        [FieldFixedLength(20), FieldAlign(AlignMode.Left, ' ')]
        public string Riservato = "";

        [FieldFixedLength(34), FieldAlign(AlignMode.Left, ' ')]
        public string Filler1864to1897 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Terminatore = "A";
    }
}