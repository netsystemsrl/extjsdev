using System;
using CedHouseSuite.Common;
using CedHouseSuite.Core.Logging;
using FileHelpers;

namespace CedHouseSuite.Tracciati.Mav.Ricezione
{
    public sealed class TracciatoMav
    {
        private static ILog Log = LogProvider.GetCurrentClassLogger();

        public object[] LeggiFile(string nomeFile)
        {

            MultiRecordEngine engine;

            engine = new MultiRecordEngine(typeof(RecordIM), typeof(Record10), typeof(Record14), typeof(Record16), typeof(Record20), typeof(Record30), typeof(Record40), typeof(Record50), typeof(Record51), typeof(Record59), typeof(Record70), typeof(RecordEF));
            engine.RecordSelector = new RecordTypeSelector(CustomSelector);

            object[] res = engine.ReadFile(nomeFile);
            return res;
        }

        private static Type CustomSelector(MultiRecordEngine engine, string record)
        {
            Log.InfoFormat("Riga = {0}", engine.LineNumber);

            switch(record.Substring(0,3))
            {
                case " IM":
                    return typeof(RecordIM);
                case " 14":
                    return typeof(Record14);
                case " 16":
                    return typeof(Record16);
                case " 20":
                    return typeof(Record20);
                case " 30":
                    return typeof(Record30);
                case " 40":
                    return typeof(Record40);
                case " 50":
                    return typeof(Record50);
                case " 51":
                    return typeof(Record51);
                case " 59":
                    return typeof(Record59);
                case " 70":
                    return typeof(Record70);
                case " 10":
                    return typeof(Record10);
                case " EF":
                    return typeof(RecordEF);
                default:
                    throw new Exception("File non conforme!");
            }
        }
    }
}
