using CedHouseSuite.Tracciati.Converters;
using FileHelpers;
using System;

namespace CedHouseSuite.Tracciati.AgenziaEntrate.F24INTERMEDIARIO
{
    [FixedLengthRecord(FixedMode.ExactLength)]
    public sealed class RecordV
    {
        public RecordV()
        {
            TipoRecord = "V";
            TipoModello = "A";
            TipoRecordChiusura = "A";
        }



        [FieldFixedLength(1)]
        public readonly string TipoRecord;

        [FieldFixedLength(16)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceFiscale;

        [FieldFixedLength(8)]
        [FieldAlign(AlignMode.Right, '0')]
        public int Progressivo;

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
        public readonly string TipoModello;

        //Sezione erario

        [FieldFixedLength(3)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceUfficio;

        [FieldFixedLength(11)]
        [FieldAlign(AlignMode.Right, '0')]
        public int CodiceAtto;

        //Riga 1
        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceTributo1;

        [FieldFixedLength(16)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string NumeroCertificazione1;

        [FieldFixedLength(4)]
        [FieldConverter(typeof(AlignIfNotEmptyAttribute), AlignMode.Right, 4, '0')]
        public string RateRegioneProv1;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public int AnnoRif1;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebito1;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCredito1;

        //Riga 2
        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceTributo2;

        [FieldFixedLength(16)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string NumeroCertificazione2;

        [FieldFixedLength(4)]
        [FieldConverter(typeof(AlignIfNotEmptyAttribute), AlignMode.Right, 4, '0')]
        public string RateRegioneProv2;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public int AnnoRif2;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebito2;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCredito2;

        //Riga 3
        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceTributo3;

        [FieldFixedLength(16)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string NumeroCertificazione3;

        [FieldFixedLength(4)]
        [FieldConverter(typeof(AlignIfNotEmptyAttribute), AlignMode.Right, 4, '0')]
        public string RateRegioneProv3;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public int AnnoRif3;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebito3;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCredito3;


        //Riga 4
        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceTributo4;

        [FieldFixedLength(16)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string NumeroCertificazione4;

        [FieldFixedLength(4)]
        [FieldConverter(typeof(AlignIfNotEmptyAttribute), AlignMode.Right, 4, '0')]
        public string RateRegioneProv4;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public int AnnoRif4;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebito4;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCredito4;


        //Riga 5
        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceTributo5;

        [FieldFixedLength(16)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string NumeroCertificazione5;

        [FieldFixedLength(4)]
        [FieldConverter(typeof(AlignIfNotEmptyAttribute), AlignMode.Right, 4, '0')]
        public string RateRegioneProv5;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public int AnnoRif5;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebito5;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCredito5;


        //Riga 6
        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceTributo6;

        [FieldFixedLength(16)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string NumeroCertificazione6;

        [FieldFixedLength(4)]
        [FieldConverter(typeof(AlignIfNotEmptyAttribute), AlignMode.Right, 4, '0')]
        public string RateRegioneProv6;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public int AnnoRif6;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebito6;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCredito6;

        //Totali sezione erario

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal TotaleDebitoErario;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal TotaleCreditoErario;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string SegnoSaldoErario;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal SaldoErario;


        //Sezione INPS 1

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceSedeInps1;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CausaleContributoInps1;

        [FieldFixedLength(17)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string MatricolaInps1;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        public string PeriodoDaInps1;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        public string PeriodoAInps1;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebitoInps1;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCreditoInps1;

        //Sezione INPS 2

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceSedeInps2;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CausaleContributoInps2;

        [FieldFixedLength(17)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string MatricolaInps2;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        public string PeriodoDaInps2;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        public string PeriodoAInps2;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebitoInps2;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCreditoInps2;


        //Sezione INPS 3

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceSedeInps3;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CausaleContributoInps3;

        [FieldFixedLength(17)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string MatricolaInps3;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        public string PeriodoDaInps3;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        public string PeriodoAInps3;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebitoInps3;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCreditoInps3;


        //Sezione INPS 4

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceSedeInps4;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CausaleContributoInps4;

        [FieldFixedLength(17)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string MatricolaInps4;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        public string PeriodoDaInps4;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        public string PeriodoAInps4;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebitoInps4;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCreditoInps4;


        //Totali sezione Inps

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal TotaleDebitoInps;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal TotaleCreditoInps;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string SegnoSaldoInps;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal SaldoInps;


        //Sezione Regioni 1

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceRegione1;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceTributoRegione1;

        [FieldFixedLength(4)]
        [FieldConverter(typeof(AlignIfNotEmptyAttribute), AlignMode.Right, 4, '0')]
        public string RateazioneRegione1;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public string AnnoRifRegione1;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebitoRegione1;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCreditoRegione1;

        //Sezione Regioni 2

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceRegione2;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceTributoRegione2;

        [FieldFixedLength(4)]
        [FieldConverter(typeof(AlignIfNotEmptyAttribute), AlignMode.Right, 4, '0')]
        public string RateazioneRegione2;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public string AnnoRifRegione2;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebitoRegione2;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCreditoRegione2;

        //Sezione Regioni 3

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceRegione3;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceTributoRegione3;

        [FieldFixedLength(4)]
        [FieldConverter(typeof(AlignIfNotEmptyAttribute), AlignMode.Right, 4, '0')]
        public string RateazioneRegione3;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public string AnnoRifRegione3;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebitoRegione3;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCreditoRegione3;

        //Sezione Regioni 4

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceRegione4;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceTributoRegione4;

        [FieldFixedLength(4)]
        [FieldConverter(typeof(AlignIfNotEmptyAttribute), AlignMode.Right, 4, '0')]
        public string RateazioneRegione4;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public string AnnoRifRegione4;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebitoRegione4;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCreditoRegione4;



        //Totali sezione Regioni

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal TotaleDebitoRegioni;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal TotaleCreditoRegioni;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string SegnoSaldoRegioni;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal SaldoRegioni;


        //Sezione IMU e altri tributi

        [FieldFixedLength(18)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string IdentificativoImu;

        //Riga 1 Imu
        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceEnteImu1;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int FlagRavvImu1;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int FlagImmobiliImu1;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int FlagAccontoImu1;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int FlagSaldoImu1;

        [FieldFixedLength(3)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NumeroImmobiliImu1;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal DetrazioneAbitazioneImu1;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceTributoImu1;

        [FieldFixedLength(4)]
        [FieldConverter(typeof(AlignIfNotEmptyAttribute), AlignMode.Right, 4, '0')]
        public string RateazioneImu1;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public string AnnoRifImu1;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebitoImu1;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCreditoImu1;

        //Riga 2 Imu
        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceEnteImu2;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int FlagRavvImu2;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int FlagImmobiliImu2;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int FlagAccontoImu2;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int FlagSaldoImu2;

        [FieldFixedLength(3)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NumeroImmobiliImu2;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal DetrazioneAbitazioneImu2;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceTributoImu2;

        [FieldFixedLength(4)]
        [FieldConverter(typeof(AlignIfNotEmptyAttribute), AlignMode.Right, 4, '0')]
        public string RateazioneImu2;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public string AnnoRifImu2;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebitoImu2;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCreditoImu2;

        //Riga 3 Imu
        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceEnteImu3;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int FlagRavvImu3;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int FlagImmobiliImu3;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int FlagAccontoImu3;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int FlagSaldoImu3;

        [FieldFixedLength(3)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NumeroImmobiliImu3;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal DetrazioneAbitazioneImu3;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceTributoImu3;

        [FieldFixedLength(4)]
        [FieldConverter(typeof(AlignIfNotEmptyAttribute), AlignMode.Right, 4, '0')]
        public string RateazioneImu3;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public string AnnoRifImu3;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebitoImu3;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCreditoImu3;

        //Riga 4 Imu
        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceEnteImu4;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int FlagRavvImu4;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int FlagImmobiliImu4;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int FlagAccontoImu4;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Right, '0')]
        public int FlagSaldoImu4;

        [FieldFixedLength(3)]
        [FieldAlign(AlignMode.Right, '0')]
        public int NumeroImmobiliImu4;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal DetrazioneAbitazioneImu4;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceTributoImu4;

        [FieldFixedLength(4)]
        [FieldConverter(typeof(AlignIfNotEmptyAttribute), AlignMode.Right, 4, '0')]
        public string RateazioneImu4;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public string AnnoRifImu4;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebitoImu4;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCreditoImu4;

        //Totali sezione Imu

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal TotaleDebitoImu;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal TotaleCreditoImu;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string SegnoSaldoImu;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal SaldoImu;



        //Sezione Inail 1

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceSedeInail1;

        [FieldFixedLength(8)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceDittaInail1;

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceControlloDittaInail1;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        public string NumeroRifInail1;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CausaleInail1;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebitoInail1;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCreditoInail1;

        //Sezione Inail 2

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceSedeInail2;

        [FieldFixedLength(8)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceDittaInail2;

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceControlloDittaInail2;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        public string NumeroRifInail2;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CausaleInail2;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebitoInail2;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCreditoInail2;

        //Sezione Inail 3

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceSedeInail3;

        [FieldFixedLength(8)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceDittaInail3;

        [FieldFixedLength(2)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceControlloDittaInail3;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        public string NumeroRifInail3;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CausaleInail3;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebitoInail3;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCreditoInail3;

        //Totali sezione Inail

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal TotaleDebitoInail;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal TotaleCreditoInail;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string SegnoSaldoInail;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal SaldoInail;


        //Sezione Altri Enti

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodiceEnteAltri;

        //Sezione Altri Enti Riga 1

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceSedeAltri1;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CausaleContributoAltri1;

        [FieldFixedLength(9)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodicePosizioneAltri1;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        public string PeriodoRifDaAltri1;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        public string PeriodoRifAAltri1;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebitoAltri1;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCreditoAltri1;

        //Sezione Altri Enti Riga 2

        [FieldFixedLength(5)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CodiceSedeAltri2;

        [FieldFixedLength(4)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string CausaleContributoAltri2;

        [FieldFixedLength(9)]
        [FieldAlign(AlignMode.Right, '0')]
        public string CodicePosizioneAltri2;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        public string PeriodoRifDaAltri2;

        [FieldFixedLength(6)]
        [FieldAlign(AlignMode.Right, '0')]
        public string PeriodoRifAAltri2;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoDebitoAltri2;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal ImportoCreditoAltri2;

        //Totali sezione Altri Enti

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal TotaleDebitoAltri;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal TotaleCreditoAltri;

        [FieldFixedLength(1)]
        [FieldAlign(AlignMode.Left, ' ')]
        public string SegnoSaldoAltri;

        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal SaldoAltri;


        [FieldFixedLength(50)]
        public readonly string Filler1743To1792 = "";






        [FieldFixedLength(15)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(typeof(TwoDecimalConverter))]
        public decimal SaldoFinaleF24;

        [FieldFixedLength(8)]
        [FieldAlign(AlignMode.Right, '0')]
        [FieldConverter(ConverterKind.Date, "ddMMyyyy")]
        public DateTime DataVersamento;

        [FieldFixedLength(82)]
        public readonly string Filler1816To1897 = "";

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
