using System;
using CedHouseSuite.Tracciati.Converters;
using FileHelpers;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.M770.M770_2022
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public class RecordB
    {
        public RecordB()
        {

        }

        [FieldFixedLength(1)]
        public readonly string TipoRecord = "B";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscaleDichiarante = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Right, '0')]
        public int ProgressivoModulo = 1;

        [FieldFixedLength(3), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Utente26to28 = "";

        [FieldFixedLength(25), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler29to53 = "";

        [FieldFixedLength(20), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Utente54to73 = "";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')] 
        public readonly string IdentificativoProduttoreSoftware = Costanti.PIVA_PRODUTTORE_SOFTWARE;

        //posizione 90
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbFlagConferma = "1";

        #region Tipo di Dichiarazione
        //I due campi seguenti sono relativi al Protocollo dichiarazione inviata in gestione separata
        //[FieldFixedLength(17), FieldAlign(AlignMode.Right, '0')]
        //public int IdentificativoInvio = 0;

        //[FieldFixedLength(6), FieldAlign(AlignMode.Right, '0')]
        //public int ProgressivoTelematico = 0;

        [FieldFixedLength(23), FieldAlign(AlignMode.Right, '0')]
        public string ProtocolloDichiarazioneGestSep = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public string CbDichiarazioneCorrettiva = "0";
        
        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public string CbDichiarazioneIntegrativa = "0";
     
        #endregion

        #region Dati del Contribuente
        [FieldFixedLength(24), FieldAlign(AlignMode.Left, ' ')]
        public string Cognome = "";

        [FieldFixedLength(20), FieldAlign(AlignMode.Left, ' ')]
        public string Nome = "";

        [FieldFixedLength(60), FieldAlign(AlignMode.Left, ' ')]
        public string Denominazione = "";

        [FieldFixedLength(40), FieldAlign(AlignMode.Left, ' ')]
        public string ComuneNascita = "";

        [FieldFixedLength(2), FieldAlign(AlignMode.Left, ' ')]
        public string ProvinciaNascita = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Left, '0'), FieldConverter(typeof(DateTimeOptionalConverter), "ddMMyyyy", "")]
        public DateTime? DataNascita = null;

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public string Sesso = "";

        [FieldFixedLength(5), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler271to275 = "";

        [FieldFixedLength(2), FieldAlign(AlignMode.Right, '0')]
        public int EventiEccezionali = 0;

        // tipo rec B riga 22 
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler262 = "0";     

        [FieldFixedLength(6), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceAttivita = "";

        [FieldFixedLength(100), FieldAlign(AlignMode.Left, ' ')]
        public string IndirizzoEmail = "";

        [FieldFixedLength(12), FieldAlign(AlignMode.Left, ' ')]
        public string Telefono = "";

        [FieldFixedLength(79), FieldAlign(AlignMode.Left, ' ')]
        public string Filler381to459 = "";

        [FieldFixedLength(3), FieldAlign(AlignMode.Left, '0')]
        public string CodicePaeseEstero = "000";

        [FieldFixedLength(24), FieldAlign(AlignMode.Left, ' ')]
        public string NumeroIdetificazioneFiscaleEstero = "";
        #endregion

        #region Dati Anagrafici Persona Giuridica
        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public string Stato = "";

        [FieldFixedLength(2), FieldAlign(AlignMode.Right, '0')]
        public string NaturaGiuridica = "";               

        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public string Situazione = "";

        [FieldFixedLength(11), FieldAlign(AlignMode.Right, '0')]
        public string CodiceFiscalediscastero = "";

        [FieldFixedLength(41), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler518to558 = "";

        [FieldFixedLength(127), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler559to687 = "";

        [FieldFixedLength(111), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler686to796 = "";
        #endregion

        #region Firmatario
        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string Firmatario_CodiceFiscale = "";

        [FieldFixedLength(2), FieldAlign(AlignMode.Right, '0')]
        public string Firmatario_CodiceCarica = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Left, '0'), FieldConverter(typeof(DateTimeOptionalConverter), "ddMMyyyy", "")]
        public DateTime? Firmatario_DataCarica = null;

        [FieldFixedLength(11), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler823to833 = "";

        [FieldFixedLength(60), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler834to893 = "";

        [FieldFixedLength(24), FieldAlign(AlignMode.Left, ' ')]
        public string Firmatario_Cognome = "";

        [FieldFixedLength(20), FieldAlign(AlignMode.Left, ' ')]
        public string Firmatario_Nome = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public string Firmatario_Sesso = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Left, '0'), FieldConverter(typeof(DateTimeOptionalConverter), "ddMMyyyy", "")]
        public DateTime? Firmatario_DataNascita = null;

        [FieldFixedLength(40), FieldAlign(AlignMode.Left, ' ')]
        public string Firmatario_ComuneNascita = "";

        [FieldFixedLength(2), FieldAlign(AlignMode.Left, ' ')]
        public string Firmatario_SiglaProvinciaNascita = "";

        [FieldFixedLength(3), FieldAlign(AlignMode.Left, '0')]
        public string Firmatario_CodiceStatoEstero = "";

        [FieldFixedLength(24), FieldAlign(AlignMode.Left, ' ')]
        public string Firmatario_StatoFederato = "";

        [FieldFixedLength(24), FieldAlign(AlignMode.Right, '0')]
        public string Firmatario_LocalitaResidenza = "";

        [FieldFixedLength(35), FieldAlign(AlignMode.Left, ' ')]
        public string Firmatario_IndirizzoEstero = "";

        [FieldFixedLength(12), FieldAlign(AlignMode.Left, ' ')]
        public string Firmatario_Telefono = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Left, '0'), FieldConverter(typeof(DateTimeOptionalConverter), "ddMMyyyy", "")]
        public DateTime? Firmatario_DataAperturaFallimento = null;

        [FieldFixedLength(11), FieldAlign(AlignMode.Right, '0')]
        public string Firmatario_CodiceFiscaleEnteDichiarante = "";

        [FieldFixedLength(8), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1106to1113 = "";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1114to1129 = "";
        #endregion
        

        #region Caselle 770 semplificato

        //Posizione 1130


        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string TipologiaInvio = "1";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbProspettoSF = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbProspettoSG = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbProspettoSH = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbProspettoSI = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbProspettoSK = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbProspettoSL = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbProspettoSM = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbProspettoSO = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbProspettoSP = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbProspettoSQ = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbProspettoST = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbProspettoSV = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbProspettoSX = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbProspettoSY = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbProspettoSS = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbProspettoDI = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbDipendente = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbAutonomo = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbCapitali = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbLocazioniBrevi = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbAltreRitenute = "0";

        #endregion

        #region Gestione Separata
        //Posizione 1152

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string AltroIncaricato_CodiceFiscale = "";

        // 2021
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string GS_1_SostGesSep = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string GS_1_CbDipendente = "0";
        
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string GS_1_CbAutonomo = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string GS_1_CbCapitali = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string GS_1_CbLocazioniBrevi = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string GS_1_CbAltreRitenute = "0";


        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string AltroIncaricato_2_CodiceFiscale = "";

        //2021
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string GS_1_SostGesSep2 = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string GS_2_CbDipendente = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string GS_2_CbAutonomo = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string GS_2_CbCapitali = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string GS_2_CbLocazioniBrevi = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string GS_2_CbAltreRitenute = "0";

        //2021
        //[FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        //public readonly string Filler1194to1195 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1195to1196 = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public readonly int NonTrasmis_ST_SV_SX = 0;

        #endregion

        #region Firma della dichiarazione 

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbFirmaDelDichiarante = "0";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscaleIncaricato = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public string Soggetto = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbFirmaIncaricato = "0";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string FirmaSoggetto_1_CodiceFiscale = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public string FirmaSoggetto_1_Tipo = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string FirmaSoggetto_1_Firma = "0";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string FirmaSoggetto_2_CodiceFiscale = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public string FirmaSoggetto_2_Tipo = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string FirmaSoggetto_2_Firma = "0";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string FirmaSoggetto_3_CodiceFiscale = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public string FirmaSoggetto_3_Tipo = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string FirmaSoggetto_3_Firma = "0";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string FirmaSoggetto_4_CodiceFiscale = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public string FirmaSoggetto_4_Tipo = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string FirmaSoggetto_4_Firma = "0";

        //2021
        //[FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        //public readonly string Filler1288to1289 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CasellaAttestazione = "0";
        #endregion

        #region Spazio non utilizzato
        [FieldFixedLength(123), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1292to1414 = "";       

        [FieldFixedLength(24), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1415to1438 = "";

        [FieldFixedLength(20), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1439to1458 = "";

        [FieldFixedLength(40), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1459to1488 = "";

        [FieldFixedLength(2), FieldAlign(AlignMode.Right, '0')]
        public readonly int CodiceSituazioniParticolari = 0;

        [FieldFixedLength(4), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1501to1504 = "";

        [FieldFixedLength(5), FieldAlign(AlignMode.Left, '0')]
        public readonly string Filler1505to1509 = "";

        [FieldFixedLength(15), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1510to1524 = "";

        [FieldFixedLength(35), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1525to1559 = "";

        [FieldFixedLength(10), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1560to1569 = "";

        [FieldFixedLength(35), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1570to1604 = "";

        [FieldFixedLength(24), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1605to1628 = "";

        [FieldFixedLength(3), FieldAlign(AlignMode.Right, '0')]
        public readonly string Filler1629to1631 = "";

        [FieldFixedLength(83), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1632to1714 = "";       
        #endregion               

        #region Avviso Telematico
        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbInvioTelematicoIntermediario = "0";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string CbRicezioneAvvisoTelematico = "0";
        #endregion

        #region Intermediario
        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string Intermediario_CodiceFiscale = "";

        [FieldFixedLength(5), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1731to1736 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Right, '0')]
        public string Intermediario_ImpegnoTrasmissione = "2";

        [FieldFixedLength(8), FieldAlign(AlignMode.Left, '0'), FieldConverter(typeof(DateTimeOptionalConverter), "ddMMyyyy", "")]
        public DateTime? Intermediario_DataImpegno = null;

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string Intermediario_CbFirma = "0";
        #endregion

        #region Conformita
        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string Conformita_CodiceFiscaleRappresentanteCAF = "";

        [FieldFixedLength(11), FieldAlign(AlignMode.Left, '0')]
        public string Conformita_CodiceFiscaleCAF = "";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public string Conformita_CodiceFiscaleProfessionista = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public string Conformita_CbFirma = "0";

        [FieldFixedLength(16), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1792to1807 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1808 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, '0')]
        public readonly string Filler1809 = "0";

        [FieldFixedLength(7), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1810to1816 = "";

        [FieldFixedLength(29), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1817to1843 = "";

        [FieldFixedLength(20), FieldAlign(AlignMode.Left, ' ')]
        public readonly string SpazioServizioTelematico = "";

        [FieldFixedLength(7), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1864to1870 = "";

        [FieldFixedLength(3), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1871to1873 = "";

        [FieldFixedLength(3), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1874to1876 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1877 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1878 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1879 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1880 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1881 = "";

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1882 = "";

        [FieldFixedLength(15), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Filler1883to1897 = "";        

        [FieldFixedLength(1), FieldAlign(AlignMode.Left, ' ')]
        public readonly string Terminatore = "A";
        #endregion
    }
}