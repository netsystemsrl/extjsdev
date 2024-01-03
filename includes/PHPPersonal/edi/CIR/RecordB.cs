using System;
//using CedHouseSuite.Tracciati.Converters;
using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.DetrazioniFiscali.CIR_2022
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public class RecordB
    {
        [FieldFixedLength(1)]
        public readonly string TipoRecord = "B";

        /// <summary>
        /// RECORD 2<br />
        /// Se il campo 8(TipoSoggetto) assume valore 1 deve essere uguale al campo 9
        /// <br />Se il campo 8(TipoSoggetto) assume valore 2(E il campo 16 non ha valore 2) deve essere uguale al campo 15
        /// <br />Se il campo 8(TipoSoggetto) assume valore 2 e il campo 16 assume il valore 2 deve essere uguale al campo 17
        /// </summary>
        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscaleDichiarante = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Right, '0')]
        public int ProgressivoModulo = 1;

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler26 = "";

        [FieldFixedLength(27), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler27to53 = DateTime.Now.ToString("yyyy/MM/dd HH.mm.ss"); //ADE imposta in questo campo la data in questo formato yyyy/MM/dd HH.mm.ss

        [FieldFixedLength(20), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Utente54to73 = "1"; //ADE imposta in questo campo il valore 1

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public readonly string IdentificativoProduttoreSoftware = Costanti.PIVA_PRODUTTORE_SOFTWARE;

        /// <summary>
        /// Record 8<br />
        /// Valori ammessi: 1, 2
        /// <br />Vale 1 se la comunicazione è relativa ad un solo soggetto beneficiario
        /// <br />Vale 2 se la comunicazione è relativa ad un condominio
        /// </summary>
        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public int TipoSoggetto;

        #region Dati beneficiario

        /// <summary>
        /// Record 9<br />
        /// Dato obbligatorio se il campo 8(TipoSoggetto) assume valore 1
        /// </summary>
        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscaleSoggettoBeneficiario = "";

        /// <summary>
        /// Record 10<br />
        /// Può essere presente solo se presente il campo 9(CodiceFiscaleSoggettoBeneficiario)
        /// <br />Deve essere numerico
        /// </summary>
        [FieldFixedLength(12), FieldAlign(AlignMode.Left, ' ')]
        public string TelefonoSoggettoBeneficiario = "";

        /// <summary>
        /// Record 11<br />
        /// Può essere presente solo se presente il campo 9(CodiceFiscaleSoggettoBeneficiario)
        /// </summary>
        [FieldFixedLength(100), FieldAlign(AlignMode.Left, ' ')]
        public string EmailSoggettoBeneficiario = "";

        /// <summary>
        /// Record 12<br />
        /// Può essere presente solo se presente il campo 9(CodiceFiscaleSoggettoBeneficiario)<br />
        /// Dato obbligatorio se il campo 9(CodiceFiscaleSoggettoBeneficiario) corrisponde ad un codice fiscale di un soggetto diverso da persona fisica
        /// </summary>
        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CFRappresentanteSoggettoBeneficiario = "";

        /// <summary>
        /// Record 13<br />
        /// Obbligatorio se presente il campo 12(CFRappresentanteSoggettoBeneficiario)<br />
        /// Valori ammessi: 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12.
        /// </summary>
        [FieldFixedLength(2), FieldAlign(AlignMode.Right, '0')]
        public int CodiceCaricaRappresentanteSoggettoBeneficiario;

        /// <summary>
        /// Record 14<br />
        /// Dato obbligatorio se presente il campo 9(CodiceFiscaleSoggettoBeneficiario)<br />
        /// Può essere presente solo se presente il campo 9(CodiceFiscaleSoggettoBeneficiario)
        /// </summary>
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string FirmaSoggettoBeneficiarioCB = "";

        #endregion

        #region Condominio

        /// <summary>
        /// Record 15<br />
        /// Dato obbligatorio se il campo 8(TipoSoggetto) assume valore 2 e non è presente il campo 16(CondominioMinimo)
        /// </summary>
        [FieldFixedLength(11), FieldAlign(AlignMode.Right, '0')]
        public string CFCondominio = "";

        /// <summary>
        /// Record 16<br />
        /// Valori ammessi: 1, 2<br />
        /// Può essere presente solo se il campo 8(TipoSoggetto) assume valore 2
        /// <br />Il dato è obbligatorio in caso di assenza del campo 15(CFCondominio)
        /// </summary>
        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public int CondominioMinimo;

        /// <summary>
        /// Record 17<br />
        /// Dato obbligatorio se il campo 8(TipoSoggetto) assume valore 2<br />
        /// Può essere presente se il campo 8(TipoSoggetto) assume valore 2
        /// </summary>
        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CFAmministratoreCondominoIncaricato = "";

        /// <summary>
        /// Record 18<br />
        /// Può essere presente se il campo 8(TipoSoggetto) assume valore 2
        /// </summary>
        [FieldFixedLength(100), FieldAlign(AlignMode.Left, ' ')]
        public string EmailAmministratoreCondominoIncaricato = "";

        /// <summary>
        /// Record 19<br />
        /// Dato obbligatorio se il campo 8(TipoSoggetto) assume valore 2<br />
        /// Può essere presente se il campo 8(TipoSoggetto) assume valore 2
        /// </summary>
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string FirmaAmministratoreCondominoIncaricatoCB = "";

        #endregion

        #region Impegno presentazione telematica

        /// <summary>
        /// Record 20<br />
        /// Dato obbligatorio se il campo 4 del record A è uguale a 10 ed il campo 5 del record A è diverso dal soggetto beneficiario (campo 2 del record B) e dal rappresentante (campo 12 del record B) in caso di codice carica (campo 13 del record B) uguale a 2 o 7.
        /// </summary>
        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string Intermediario_CodiceFiscale = "";

        /// <summary>
        /// Record 21
        /// Dato obbligatorio se presente il campo 20(Intermediario_CodiceFiscale)<br />
        /// Non può essere presente in assenza del campo 20(Intermediario_CodiceFiscale)
        /// </summary>
        [FieldFixedLength(8), FieldAlign(AlignMode.Right, ' '), FieldConverter(typeof(Converters.DateTimeOptionalConverter), "ddMMyyyy", "")]
        public DateTime? Intermediario_DataImpegno = null;

        /// <summary>
        /// Record 22
        /// Dato obbligatorio se presente il campo 20(Intermediario_CodiceFiscale)<br />
        /// Non può essere presente in assenza del campo 20(Intermediario_CodiceFiscale)
        /// </summary>
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string Intermediario_CbFirma = "";

        #endregion

        #region Visto di conformità

        /// <summary>
        /// Record 23<br />
        /// Se presente un campo da 27 a 31 la sezione è obbligatoria altrimenti non deve essere compilata<br />
        /// Deve essere un codice fiscale di persona fisica<br />
        /// Il campo è alternativo al campo 25
        /// </summary>
        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CFResponsabileCAF = "";

        /// <summary>
        /// Record 24<br />
        /// Se presente un campo da 27 a 31 la sezione è obbligatoria altrimenti non deve essere compilata<br />
        /// Il dato è obbligatorio se presente il campo 23 e può essere presente solo se presente il campo 23
        /// </summary>
        [FieldFixedLength(11), FieldAlign(AlignMode.Right, '0')]
        public string CFCAF = "";

        /// <summary>
        /// Record 25<br />
        /// Se presente un campo da 27 a 31 la sezione è obbligatoria altrimenti non deve essere compilata<br />
        /// Deve essere un codice fiscale di persona fisica<br />
        /// Il campo è alternativo al campo 23<br />
        /// Se il campo è presente deve essere uguale al campo 20, se quest’ultimo è presente ed è riferito ad una persona fisica
        /// </summary>
        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CFProfessionistaConformita = "";

        /// <summary>
        /// Record 26<br />
        /// Se presente un campo da 27 a 31 la sezione è obbligatoria altrimenti non deve essere compilata<br />
        /// Il campo può essere presente solo se presenti i campi 23 o 25.<br />
        /// Il dato è obbligatorio se la sezione è presente ed il campo 8 del record B è uguale a '1'<br />
        /// Se il campo 8 del record B è uguale a '2' (Condominio) e il codice fiscale del vistatore (campo 23 o 25) è uguale al campo 17 (amministratore) ovvero al campo 20 (soggetto che assume l'impegno alla trasmissione) il campo 26 è obbligatorio.
        /// </summary>
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string FirmaConformitaCB = "";

        #endregion

        #region Asseverazione efficienza energetica

        /// <summary>
        /// Record 27
        /// </summary>
        [FieldFixedLength(24), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceRicevuta_ENEA = "";

        /// <summary>
        /// Record 28
        /// </summary>
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string PolizzaAssicurativa_ENEA_CB = "";

        #endregion

        #region Asseverazione rischio sismico

        /// <summary>
        /// Record 29
        /// </summary>
        [FieldFixedLength(19), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceIdentificativo_RischioSismico = "";

        /// <summary>
        /// Record 30
        /// </summary>
        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscaleProfessionista_RischioSismico = "";

        /// <summary>
        /// Record 31
        /// </summary>
        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public string PolizzaAssicurativa_RischioSismico_CB = "";

        #endregion

        /// <summary>
        /// Record 32<br />
        /// Facoltativo
        /// </summary>
        [FieldFixedLength(17), FieldAlign(AlignMode.Right, '0')]
        public string IdentificatoAnnullamentoSostituzioneComunicazione;

        /// <summary>
        /// Record 33<br />
        /// Facoltativo
        /// </summary>
        [FieldFixedLength(6), FieldAlign(AlignMode.Right, '0')]
        public int ProgressivoAnnullamentoSostituzioneComunicazione;

        /// <summary>
        /// Record 34<br />
        /// Facoltativo
        /// </summary>
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string FlagAnnullamento_CB = "";

        #region Intervento 

        /// <summary>
        /// Record 35<BR />
        /// Valori ammessi: da 1 a 27<BR />
        /// Non può assumere i valori da 22 a 25 se il campo 8 vale '1' <BR />
        /// Non può assumere i valori da 26 e 27 se il campo 8 vale '2' <BR />
        /// </summary>
        [FieldFixedLength(2), FieldAlign(AlignMode.Right, '0')]
        public string TipologiaIntervento;

        /// <summary>
        /// Record 36<br />
        /// Facoltativo
        /// </summary>
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string SuperbonusIntervento_CB = "";

        /// <summary>
        /// Record 37<br />
        /// Facoltativo
        /// </summary>
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string SuperbonusIntervento_RestrizioniEdilizie_CB = "";

        /// <summary>
        /// Record 38
        /// </summary>
        [FieldFixedLength(3), FieldAlign(AlignMode.Right, '0')]
        public string UnitaImmobiliariCondominio = "";

        /// <summary>
        /// Record 39
        /// </summary>
        [FieldFixedLength(10), FieldAlign(AlignMode.Right, '0')]
        public int ImportoComplessivoSpesaSostenuta;

        /// <summary>
        /// Record 40
        /// </summary>
        [FieldFixedLength(4), FieldAlign(AlignMode.Left, ' ')]
        public string AnnoSostenimentoSpesa_DA = "";

        /// <summary>
        /// Record 41<br />
        /// Valori ammessi: 1,2
        /// </summary>
        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public int? InterventoPeriodo2020;

        /// <summary>
        /// Record 42<br />
        /// In caso di superbonus può assumere i valori da 1 a 3
        /// </summary>
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public int InterventoStatoAvanzamentoLavori;

        /// <summary>
        /// Record 43
        /// </summary>
        [FieldFixedLength(17), FieldAlign(AlignMode.Right, '0')]
        public string PrimaTrasmissioneIdentificativo;

        /// <summary>
        /// Record 44
        /// </summary>
        [FieldFixedLength(6), FieldAlign(AlignMode.Right, '0')]
        public string PrimaTrasmissioneProgressivo;

        /// <summary>
        /// Record 45
        /// </summary>
        [FieldFixedLength(4), FieldAlign(AlignMode.Left, '0')]
        public string PrimoAnnoSostenimentoSpesa_DA = "";

        /// <summary>
        /// Record 46
        /// </summary>
        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public string EdiliziaLibera = "0";

        /// <summary>
        /// E' necessario applicare il filler con gli zeri perché altrimenti lo strumento di controllo versione 1.2.0 del 2022/02/04 genera l'errore "Dati del Frontespizio: - Presenza di carattere SPAZIO non ammesso" anche se da documentazione ammette di essere compilato solo da spazi.
        /// </summary>
        [FieldFixedLength(1326), FieldAlign(AlignMode.Left, '0')]
        public string Filler572to1897 = "";
        //[FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        //public string Filler1898to1898 = "";
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Terminatore = "A";
        //[FieldFixedLength(2), FieldAlign(AlignMode.Left, ' ')]
        //public string Filler1899to1900 = "";

        //[FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        //public readonly string Terminatore = "A";

        #endregion
    }
}