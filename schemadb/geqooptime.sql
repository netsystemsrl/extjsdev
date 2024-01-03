update anagrafiche set DESCRIZIONE = TRIM(UCASE(DESCRIZIONE));
update anagrafiche set INDIRIZZO = TRIM(UCASE(INDIRIZZO));
update anagrafiche set CITTA = TRIM(UCASE(CITTA));
update anagrafiche set PROVINCIA = TRIM(UCASE(PROVINCIA));
update anagrafiche set CG_CT_CONTROPARTITAPASSIVA = null WHERE CG_CT_CONTROPARTITAPASSIVA = 1;
update anagrafiche set CG_CT_CONTROPARTITAATTIVA = null WHERE CG_CT_CONTROPARTITAATTIVA = 1;

update articoli set DESCRIZIONE = TRIM(UCASE(DESCRIZIONE));
update articoli set CODICE= TRIM(UCASE(CODICE));

update ordmovimenti set DESCRIZIONE = TRIM(UCASE(DESCRIZIONE));
update ordmovimenti set CODICE= TRIM(UCASE(CODICE));
update ddtmovimenti set DESCRIZIONE = TRIM(UCASE(DESCRIZIONE));
update ddtmovimenti set CODICE= TRIM(UCASE(CODICE));
update fatmovimenti set DESCRIZIONE = TRIM(UCASE(DESCRIZIONE));
update fatmovimenti set CODICE= TRIM(UCASE(CODICE));

update cg_contabile set ANAGRAFICHE_DESCRIZIONE = TRIM(UCASE(ANAGRAFICHE_DESCRIZIONE ));
update cg_contabile set ANAGRAFICHE_INDIRIZZO = TRIM(UCASE(ANAGRAFICHE_INDIRIZZO));
update cg_contabile set ANAGRAFICHE_CITTA = TRIM(UCASE(ANAGRAFICHE_CITTA));
update cg_contabile set ANAGRAFICHE_PROVINCIA = TRIM(UCASE(ANAGRAFICHE_PROVINCIA));

update cg_contabile set ANAGRAFICHE_DESCRIZIONE = REPLACE(ANAGRAFICHE_DESCRIZIONE, "&", "");
update cg_contabile set ANAGRAFICHE_DESCRIZIONE = REPLACE(ANAGRAFICHE_DESCRIZIONE, "°", "");
update cg_contabile set ANAGRAFICHE_INDIRIZZO = REPLACE(ANAGRAFICHE_INDIRIZZO, "&", "");
update cg_contabile set ANAGRAFICHE_INDIRIZZO = REPLACE(ANAGRAFICHE_INDIRIZZO, "°", "");
update cg_contabile set ANAGRAFICHE_CITTA = REPLACE(ANAGRAFICHE_CITTA, "&", "");
update cg_contabile set ANAGRAFICHE_CITTA = REPLACE(ANAGRAFICHE_CITTA, "°", "");

update cg_pianoconti set DESCRIZIONE = TRIM(UCASE(DESCRIZIONE));
update cg_pianoconti 
	inner join anagrafiche ON anagrafiche.ID = cg_pianoconti.CT_ANAGRAFICHE
set cg_pianoconti.DESCRIZIONE = anagrafiche.DESCRIZIONE;

UPDATE aaaemail 
			INNER JOIN fat on aaaemail.CT_ID = fat.ID 
		SET aaaemail.VARPOSA = fat.VALORETOTALE,
			aaaemail.VARPOSDOCDATA = fat.DOCDATA,
			aaaemail.VARPOSDOCNUM = fat.DOCNUM
where aaaemail.CT_TABLE = 'fat';


update anagrafiche 
	inner join ddt on ddt.ct_fatturazione = anagrafiche.id
set CRM_VISITALASTDATA = ddt.DOCDATA
where ddt.DOCDATA > CRM_VISITALASTDATA or CRM_VISITALASTDATA  is null;

update anagrafiche 
	inner join fat on fat.ct_fatturazione = anagrafiche.id
set CRM_VISITALASTDATA = fat.DOCDATA
where fat.DOCDATA > CRM_VISITALASTDATA or CRM_VISITALASTDATA  is null;

update anagrafiche 
	inner join ord on ord.ct_fatturazione = anagrafiche.id
set CRM_VISITALASTDATA = ord.DOCDATA
where ord.DOCDATA > CRM_VISITALASTDATA or CRM_VISITALASTDATA  is null;

update anagrafiche 
	inner join pre on pre.ct_fatturazione = anagrafiche.id
set CRM_VISITALASTDATA = pre.DOCDATA
where pre.DOCDATA > CRM_VISITALASTDATA or CRM_VISITALASTDATA  is null;

update ord set CG_CT_CONTABILEESERCIZI  = year(DOCDATA) ;
update ddt set CG_CT_CONTABILEESERCIZI  = year(DOCDATA);
update fat set CG_CT_CONTABILEESERCIZI  = year(DOCDATA);

update cg_contabile set ANAGRAFICHE_DESCRIZIONE = TRIM(UCASE(ANAGRAFICHE_DESCRIZIONE ));
update cg_contabile set ANAGRAFICHE_INDIRIZZO = TRIM(UCASE(ANAGRAFICHE_INDIRIZZO));
update cg_contabile set ANAGRAFICHE_INDIRIZZO2= TRIM(UCASE(ANAGRAFICHE_INDIRIZZO2));
update cg_contabile set ANAGRAFICHE_CITTA = TRIM(UCASE(ANAGRAFICHE_CITTA));
update cg_contabile set ANAGRAFICHE_PROVINCIA= TRIM(UCASE(ANAGRAFICHE_PROVINCIA));

update cg_contabile set COMDATA = IVADATA where IVADATA is not null and COMDATA is null;
update cg_contabile set COMDATA = DATAREG where DATAREG is not null and COMDATA is null;

delete cg_pianoconti.* 
from cg_pianoconti
left join anagrafiche on anagrafiche.ID = cg_pianoconti.CT_ANAGRAFICHE
where CT_ANAGRAFICHE is not null
and anagrafiche.ID is null;

update ddtmovimenti
Set QTARIGA = QTA
WHERE QTAUM IS NULL AND QTA != QTARIGA;

update ddtmovimenti
inner join articoli on articoli.ID = ddtmovimenti.CT_ARTICOLI
Set QTAUM = articoli.UM0
WHERE QTAUM IS NULL;

update fatmovimenti
Set QTARIGA = QTA
WHERE QTAUM IS NULL AND QTA != QTARIGA;

update fatmovimenti
inner join articoli on articoli.ID = fatmovimenti.CT_ARTICOLI
Set QTAUM = articoli.UM0
WHERE QTAUM IS NULL;

update fatmovimenti
set CT_DDTMOVIMENTI = null
where CT_DDTMOVIMENTI= 0;

update anagrafiche set LINGUA = 'IT' WHERE LINGUA is null;

INSERT IGNORE INTO aaagroup (ID, DESCNAME, CT_AAAPROC) VALUES
(1,	'ADMIN',	NULL),
(2,	'RESP',	NULL),
(3,	'USER',	NULL),
(11,	'MED',	NULL),
(12,	'AMMINISTRAZIONE',	NULL),
(13,	'PRODUZIONE',	NULL),
(14,	'COLLAUDO',	NULL),
(15,	'ACQUISTI',	NULL),
(16,	'MAGAZZINO',	1177),
(17,	'COMMERCIALE',	NULL),
(18,	'CAD',	NULL),
(19,	'ContoLavoro',	NULL),
(20,	'SERVICE',	NULL),
(21,	'ELETTRICI',	NULL),
(22,	'QUALITA',	NULL),
(23,	'MANUTENZIONE',	NULL),
(24,	'PROGRAMMAZIONE',	NULL),
(25,	'TERZISTI',	NULL),
(26,	'MARKETING',	NULL),
(27,	'LOGISTICA',	NULL),
(28,	'RICAMBI',	NULL),
(29,	'HR PERSONALE',	NULL),
(30,	'RTLS',	NULL),
(31,	'ECOMMERCE',	NULL),
(32,	'HR_AUTORIZZATORI',	NULL),
(33,	'SPEDIZIONE',	NULL),
(1611398021,	'B2B',	NULL),
(1611398022,	'AGENTI',	NULL),
(1611398023,	'TECNICI',	NULL),
(1611398024,	'RESPONSABILI',	NULL),
(1611398025,	'UTENTI GESTIONE',	NULL),
(1611398026,	'LETTORE',	NULL),
(1611398027,	'PAGHE',	NULL),
(1611646920,	'PROJECT MANAGER',	NULL),
(1611646921,	'INVENTARIO',	NULL),
(1611646922,	'CICLO ATTIVO',	NULL),
(1611646923,	'CICLO PASSIVO',	NULL);


INSERT IGNORE INTO aaamodules (ID, DESCNAME, VISIBLE, NOTE) VALUES
(1,	'cg',	1,	'contabilità generale'),
(2,	'crm',	1,	'CRM Relazioni e commerciale e Formazione'),
(3,	'srm',	1,	'Service Assistenza'),
(4,	'fat',	1,	'Fatture'),
(5,	'ddt',	1,	'Doc Trasporto'),
(6,	'ord',	1,	'Ordini'),
(7,	'pre',	1,	'Preventivi'),
(8,	'adm',	1,	'Administrator'),
(9,	'aff',	1,	'Affitti'),
(11,	'ant',	1,	'Anticipi'),
(12,	'art',	1,	'Articoli'),
(14,	'cbi',	1,	'Banche Flussi'),
(15,	'ces',	1,	'Cespiti'),
(17,	'con',	1,	'Contratti Commesse'),
(20,	'dev',	1,	'Developer'),
(21,	'edi',	1,	'EDI Scambio Dati '),
(28,	'email',	1,	'Email'),
(30,	'export',	1,	'Esportazioni'),
(31,	'ext',	1,	'Esterni'),
(33,	'hre',	1,	NULL),
(34,	'hr',	1,	'Gestione Personale'),
(36,	'import',	1,	'Importazioni'),
(38,	'iot',	1,	'IoT Ind40 Macchine'),
(39,	'lot',	1,	NULL),
(40,	'mes',	1,	'Produzione Esecuzione'),
(43,	'mms',	1,	'Manutenzione Macchine'),
(44,	'mon',	1,	'Monitor'),
(45,	'mps',	1,	'Produzione Programmazione Schedulazione'),
(46,	'mrp',	1,	'Produzione Esplosione Ordini'),
(50,	'plm',	1,	'Palmare Mobile'),
(51,	'pos',	1,	'Ponto Vendita Cassa'),
(52,	'prj',	1,	'Progetti'),
(53,	'promo',	1,	'Promozioni'),
(55,	'rda',	1,	'Richieste Acquisto'),
(56,	'rtls',	1,	'WMS Posizionamento dinamico'),
(57,	'sdi',	1,	'SDI XML Stato'),
(58,	'sgq',	1,	'Sistema Gestione Qualita'),
(60,	'spm',	1,	'Service Part Ricambi'),
(61,	'stat',	1,	NULL),
(62,	'sup',	1,	'Supervisioni impianto'),
(63,	'survey',	1,	'Web Interviste Raccolta dati'),
(64,	'ter',	1,	'Terizisti'),
(65,	'tst',	1,	'Terizista'),
(66,	'udc',	1,	'WMS Magazzino Unita di movimentazione'),
(67,	'web',	1,	'Sito Web'),
(68,	'wms',	1,	'WMS Gestione locazioni'),
(69,	'b2b',	1,	'Ecommerce Business'),
(85,	'b2c',	1,	'Ecommerce Customer'),
(86,	'for',	1,	'Fornitori'),
(88,	'ctr',	1,	'Controlli'),
(89,	'hid',	0,	'Nascosti'),
(95,	'bi',	1,	'Business Intelligence'),
(96,	'act',	1,	'Activity');

INSERT IGNORE INTO aaaglobal (DESCNAME, CT_TABLE, KEYVALUE, NOTA) VALUES
('AMAZON_ANAG_ID',	'',	NULL,	'id dell\'anagrafica di Amazon in geqo per trovare i dati dal relativo listino nelle query di Amazon MWS'),
('AMAZON_AWS_ACCESS_KEY_ID',	NULL,	NULL,	'amazon AWS secret access key'),
('AMAZON_AWS_SECRET_ACCESS_KEY',	NULL,	NULL,	'amazon AWS secret access key'),
('AMAZON_MERCHANT_ID',	NULL,	NULL,	'amazon merchant id'),
('AMAZON_MIN_QTY',	NULL,	NULL,	NULL),
('AMAZON_MWS_ACCESS_KEY_ID',	NULL,	NULL,	'amazon MWS access key'),
('AMAZON_MWS_MERCHANTSHIPPINGGROUPNAME',	'',	NULL,	'Nome del Gruppo di Spedizione configurato in Amazon per i prodotti inviati, lasciare vuoto per default'),
('AMAZON_MWS_SECRET_ACCESS_KEY',	NULL,	NULL,	'amazon MWS secret access key'),
('AMAZON_PARENT_CAT',	'',	NULL,	'Categoria padre di amazon, utilizzata se non viene associata la categoria di geqo a quella di amazon in ADMIN->Conversioni (tabella aaadataconvert)'),
('AMAZON_PRODUCT_TYPE',	NULL,	NULL,	'Scegli uni tra:\nClothingAccessories,Clothing,Miscellaneous,CameraPhoto,Home,Sports,HomeImprovement,Tools,FoodAndBeverages,Gourmet,Jewelry,Health,CE,Computers,SoftwareVideoGames,Wireless,Beauty,Office,MusicalInstruments,AutoAccessory,PetSupplies,ToysBaby..'),
('AMAZON_SELLER_ID',	NULL,	NULL,	'amazon seller id'),
('CBI_CID',	NULL,	NULL,	NULL),
('CBI_CUC',	NULL,	NULL,	NULL),
('CBI_SIA',	NULL,	NULL,	NULL),
('CG_ABBUONOATTIVO',	'cg_pianoconti',	NULL,	NULL),
('CG_ABBUONOPASSIVO',	'cg_pianoconti',	NULL,	NULL),
('CG_ACQIVA',	'cg_pianoconti',	NULL,	NULL),
('CG_ANAGRAFICAAZIENDA',	'anagrafiche',	NULL,	NULL),
('CG_ANAGRAFICADICHIARANTE',	'anagrafiche',	NULL,	NULL),
('CG_ANAGRAFICAINTERMEDIARIO',	'anagrafiche',	NULL,	NULL),
('CG_ANAGRAFICAREVISORE',	'anagrafiche',	NULL,	''),
('CG_ANAGRAFICASCONTRINO',	'anagrafiche',	NULL,	''),
('CG_ARTICOLOANTICIPO',	'articoli',	NULL,	''),
('CG_ARTICOLODESCRITTIVO',	'articoli',	NULL,	NULL),
('CG_AUTOFATTURE_ALIQUOTA',	'aliquote',	NULL,	NULL),
('CG_AUTOFATTURE_CAUSALEATTIVO',	'causali',	NULL,	NULL),
('CG_AUTOFATTURE_CAUSALEPASSIVO',	'causali',	NULL,	NULL),
('CG_AUTOFATTURE_CONTABILEMODELLIATTIVO',	'cg_contabilemodelli',	NULL,	NULL),
('CG_AUTOFATTURE_CONTABILEMODELLIGIROCONTO',	'cg_contabilemodelli',	NULL,	NULL),
('CG_AUTOFATTURE_SEZ',	'sezionali',	NULL,	NULL),
('CG_BANCAINT',	'cg_pianoconti',	NULL,	NULL),
('CG_CARICAINTERMEDIARIO',	'',	NULL,	NULL),
('CG_CAUSALESCONTRINO',	'causali',	NULL,	''),
('CG_CONTOACQUISTI',	'cg_pianoconti',	NULL,	NULL),
('CG_CONTOCASSA',	'cg_pianoconti',	NULL,	NULL),
('CG_CONTOEFFETTIATTIVI',	'cg_pianoconti',	NULL,	NULL),
('CG_CONTOEFFETTIPASSIVI',	'cg_pianoconti',	NULL,	NULL),
('CG_CONTOIVAACQ',	'cg_pianoconti',	NULL,	NULL),
('CG_CONTOIVAVEN',	'cg_pianoconti',	NULL,	NULL),
('CG_CONTOVENDITE',	'cg_pianoconti',	NULL,	NULL),
('CG_CONTOACQUISTI',	'cg_pianoconti',	NULL,	NULL),
('CG_DATACALC',	NULL,	NULL,	NULL),
('CG_ERARIOIVA',	'pianoconti',	NULL,	NULL),
('CG_ESERCIZIOCORRENTE',	'',	NULL,	''),
('CG_FINEANNOECONOMICO',	'cg_pianoconti',	NULL,	''),
('CG_FINEANNOMODELLIAPERTURABILANCIO',	'cg_contabilemodelli',	NULL,	NULL),
('CG_FINEANNOMODELLICHIUSURABILANCIO',	'cg_contabilemodelli',	NULL,	''),
('CG_FINEANNOPATRIMONIALEAPERTURA',	'cg_pianoconti',	NULL,	''),
('CG_FINEANNOPATRIMONIALECHIUSURA',	'cg_pianoconti',	NULL,	''),
('CG_FINEANNORISULTATO',	'cg_pianoconti',	NULL,	''),
('CG_FORZADATAREG',	'',	NULL,	''),
('CG_GRUPPOAMMORTAMENTI',	'cg_pianoconti',	NULL,	NULL),
('CG_GRUPPOAMMORTAMENTIFONDO',	'cg_pianoconti',	NULL,	NULL),
('CG_GRUPPOBANCHE',	'cg_pianoconti',	NULL,	NULL),
('CG_GRUPPOCLIENTI',	'cg_pianoconti',	NULL,	NULL),
('CG_GRUPPOFORNITORI',	'cg_pianoconti',	NULL,	NULL),
('CG_LIQUIDAZIONEACCONTOTIPO',	'',	NULL,	''),
('CG_LIQUIDAZIONEMENSILE',	'',	NULL,	NULL),
('CG_MODELLIATTIVO',	'cg_contabilemodelli',	NULL,	NULL),
('CG_MODELLICORRISPETTIVI',	'cg_contabilemodelli',	NULL,	''),
('CG_MODELLIEFFETTI',	'cg_contabilemodelli',	NULL,	NULL),
('CG_MODELLIGIROCONTO',	'cg_contabilemodelli',	NULL,	NULL),
('CG_MODELLIPAGAMENTOATTIVO',	'cg_contabilemodelli',	NULL,	NULL),
('CG_MODELLIPAGAMENTOPASSIVO',	'cg_contabilemodelli',	NULL,	NULL),
('CG_MODELLIPASSIVO',	'cg_contabilemodelli',	NULL,	NULL),
('CG_MODELLISPESA',	'cg_contabilemodelli',	NULL,	NULL),
('CG_PERSCONTRINO',	'',	NULL,	''),
('CG_SEMPLIFICATA',	NULL,	NULL,	NULL),
('CG_VENIVA',	'cg_pianoconti',	NULL,	NULL),
('CRM_EMAILAUTOSPAM',	NULL,	NULL,	NULL),
('CRM_EMAILAUTOSUSPEND',	NULL,	NULL,	NULL),
('CRM_EMAILMAX',	NULL,	NULL,	NULL),
('CRM_EMAILSENDER',	NULL,	NULL,	NULL),
('CRM_EMAILSLEEP',	NULL,	NULL,	NULL),
('EDI_FTP',	NULL,	NULL,	NULL),
('EDI_FTPIN',	NULL,	NULL,	NULL),
('EDI_FTPOUT',	NULL,	NULL,	NULL),
('EDI_FTPPWD',	NULL,	NULL,	NULL),
('EDI_FTPUSER',	NULL,	NULL,	NULL),
('EDI_ID',	NULL,	NULL,	NULL),
('GRUPPOBANCHE',	NULL,	NULL,	NULL),
('HR_RITARDO',	NULL,	NULL,	'minuti oltre il quale passa alla mezzora successiva'),
('HR_RITARDODOWN',	NULL,	NULL,	'minuti oltre il quale passa alla mezzora successiva'),
('HR_RITARDOUP',	NULL,	NULL,	'tempo oltre il quale passa alla mezzora successiva'),
('HR_STRMAXANNUO',	NULL,	NULL,	'massimo ore annuale di straordinario'),
('HR_STRMAXMENSILE',	NULL,	NULL,	'massimo ore mensile di straordinario'),
('HR_STRMAXSETTIMANALE',	NULL,	NULL,	'massimo ore lavoro settimanali'),
('IBS_ANAG_ID',	NULL,	NULL,	'id dell\'anagrafica di IBS in geqo per trovare i dati dal relativo listino nelle query di esportazione IBS'),
('IMP_ATTRIBUTISTRUTTURA',	'',	NULL,	'come gestire l\'importazione degli attributi, valori gestiti:0, WpAllImport'),
('IMP_BRANDIDCOLONNA',	'',	NULL,	'Imposta l\'ID della colonna BRAND nel file XLS/CSV, il conteggio inizia da 0 (zero) il quale vale anche false'),
('IMP_CATEGORIAIDCOLONNA',	'',	NULL,	'Imposta l\'ID della colonna CATEGORIA nel file XLS/CSV, il conteggio inizia da 0 (zero) il quale vale anche false'),
('IMP_CATEGORIANONNOIDCOLONNA',	'',	NULL,	'Imposta l\'ID della colonna CATEGORIA NONNO (se multiFieldsCategorie) nel file XLS/CSV, il conteggio inizia da 0 (zero) il quale vale anche false'),
('IMP_CATEGORIAPADREIDCOLONNA',	'',	NULL,	'Imposta l\'ID della colonna CATEGORIA PADRE (se multiFieldsCategorie) nel file XLS/CSV, il conteggio inizia da 0 (zero) il quale vale anche false'),
('IMP_CATEGORIEMULTIFIELDS',	'',	NULL,	'0 se albero categorie in un solo campo, 1 se albero categorie in campi diversi (stile osCommerce import)'),
('IMP_CODFORNITOREIDCOLONNA',	'',	NULL,	'Imposta l\'ID della colonna CODFORNITORE nel file XLS/CSV, il conteggio inizia da 0 (zero) il quale vale anche false'),
('IMP_CODICEIDCOLONNA',	'',	NULL,	'identifica l\'ID COLONNA del csv/excel che contiene il CODICE ARTICOLO'),
('IMP_CODICEPADREIDCOLONNA',	'',	NULL,	'Imposta l\'ID della colonna CODICEPADRE (inserito in CT_SOSTITUITODA) nel file XLS/CSV, il conteggio inizia da 0 (zero) il quale vale anche false'),
('IMP_CODPRODUTTOREIDCOLONNA',	'',	NULL,	'Imposta l\'ID della colonna CODPRODUTTORE nel file XLS/CSV, il conteggio inizia da 0 (zero) il quale vale anche false'),
('IMP_CSVDELIMITER',	'',	NULL,	'Imposta il delimitatore quando si importa da CSV'),
('IMP_CSVENCLOSURE',	'',	NULL,	'Imposta il delimitatore di testo per l\'importazione dei file CSV'),
('IMP_DESCRIDCOLONNA',	'',	NULL,	'Imposta l\'ID della colonna DESCRIZIONE nel file XLS/CSV, il conteggio inizia da 0 (zero) il quale vale anche false'),
('IMP_DESCRWEBIDCOLONNA',	'',	NULL,	'Imposta l\'ID della colonna DESCRIZIONE WEB nel file XLS/CSV, il conteggio inizia da 0 (zero) il quale vale anche false'),
('IMP_FILETYPE',	'',	NULL,	'Imposta il tipo di file da cui importare'),
('IMP_GIACENZAIDCOLONNA',	'',	NULL,	'Imposta l\'ID della colonna GIACENZA nel file XLS/CSV, il conteggio inizia da 0 (zero) il quale vale anche false'),
('IMP_HEADERSINFIRSTROW',	'',	NULL,	'1 per true, 0 per false'),
('IMP_IMMAGINEIDCOLONNA',	'',	NULL,	'Imposta l\'ID della colonna IMMAGINE nel file XLS/CSV, il conteggio inizia da 0 (zero) il quale vale anche false'),
('IMP_LISTINOVENDITACONIVAIDCOLONNA',	NULL,	NULL,	'Imposta l\'ID della colonna LISTINOVENDITACONIVA nel file XLS/CSV, il conteggio inizia da 0 (zero) il quale vale anche false'),
('IMP_LISTINOVENDITAIDCOLONNA',	'',	NULL,	'Imposta l\'ID della colonna LISTINOVENDITA nel file XLS/CSV, il conteggio inizia da 0 (zero) il quale vale anche false'),
('IMP_PRODUTTOREIDCOLONNA',	'',	NULL,	'Imposta l\'ID della colonna PRODUTTORE nel file XLS/CSV, il conteggio inizia da 0 (zero) il quale vale anche false'),
('IMP_STATOIDCOLONNA',	'',	NULL,	'Imposta l\'ID della campo status nel file, il conteggio inizia da 0 (zero) il quale vale anche false'),
('IMP_TIPOIDCOLONNA',	NULL,	NULL,	'Imposta l\'ID della colonna TYPE (tipo articolo) nel file XLS/CSV, il conteggio inizia da 0 (zero) il quale vale anche false'),
('IMP_TITOLOWEBIDCOLONNA',	'',	NULL,	'Imposta l\'ID della colonna DESCRIZIONE WEB nel file XLS/CSV, il conteggio inizia da 0 (zero) il quale vale anche false'),
('INTESTAZIONERIGA1',	NULL,	NULL,	NULL),
('INTESTAZIONERIGA2',	NULL,	NULL,	NULL),
('INTESTAZIONERIGA3',	NULL,	NULL,	NULL),
('INTESTAZIONERIGA4',	NULL,	NULL,	NULL),
('INTESTAZIONERIGA5',	NULL,	NULL,	NULL),
('INTESTAZIONERIGA6',	NULL,	NULL,	NULL),
('INTESTAZIONERIGA7',	NULL,	NULL,	NULL),
('LINGUA',	NULL,	NULL,	NULL),
('LIS_DATA',	NULL,	NULL,	NULL),
('MAGAZZINO',	'magazzini',	NULL,	NULL),
('MMS_CAUSALEINTERVENTI',	'causali',	NULL,	''),
('MPS_MINTIMEFASE',	NULL,	NULL,	NULL),
('MPS_SCHEDULEDAYBEFOREEND',	'',	NULL,	''),
('MPS_SCHEDULEFROM',	NULL,	NULL,	'END or START'),
('MPS_UM',	'angum',	NULL,	NULL),
('MRP_CAUSALEACQUISTO',	'causali',	NULL,	NULL),
('MRP_CAUSALEAUTOPRODUZIONE',	'causali',	NULL,	NULL),
('MRP_CAUSALEPRENOTAZIONE',	'causali',	NULL,	'Causale ddt prenotazione da ordini di produzione'),
('MRP_CAUSALEVENDITA',	'causali',	NULL,	NULL),
('MRP_EMAILALERT',	NULL,	NULL,	NULL),
('MRP_ESPLOSIONECRITERIO',	'magazzino',	NULL,	'MAGAGIACENTE > 1\'; //$CondWhere = \'MAGADISPONIBILE > 1\'; $CondWhere = \'MRP_FASE'),
('MRP_MAGAZZINO',	'magazzini',	NULL,	NULL),
('ORD_CONFERMAAUTO',	NULL,	NULL,	NULL),
('PIEPAGINARIGA1',	NULL,	NULL,	NULL),
('POS_IVAINCLUSA',	'',	NULL,	''),
('POS_PREZZOMOLTIPLICA',	'',	NULL,	''),
('PREBOLLA',	'causali',	NULL,	''),
('repository',	NULL,	NULL,	NULL),
('SDI_ALLEGATI',	NULL,	NULL,	NULL),
('SDI_ANAGRAFICAERRORI',	NULL,	NULL,	NULL),
('SDI_CAUSALEATTIVA',	'causali',	NULL,	NULL),
('SDI_CAUSALEATTIVANC',	'causali',	NULL,	NULL),
('SDI_CAUSALEPASSIVA',	'causali',	NULL,	NULL),
('SDI_CAUSALEPASSIVANC',	'causali',	NULL,	NULL),
('SDI_DRIVER',	NULL,	NULL,	NULL),
('SDI_EMAIL',	NULL,	NULL,	NULL),
('SDI_EMAILFROM',	NULL,	NULL,	NULL),
('SDI_EMAILGROUP',	'',	NULL,	''),
('SDI_EMAILIMAP',	NULL,	NULL,	NULL),
('SDI_EMAILIMAPFOLDER',	NULL,	NULL,	NULL),
('SDI_EMAILIMAPPORT',	NULL,	NULL,	NULL),
('SDI_EMAILIMAPSECURE',	NULL,	NULL,	NULL),
('SDI_EMAILPASSWORD',	NULL,	NULL,	NULL),
('SDI_EMAILSMTP',	NULL,	NULL,	NULL),
('SDI_EMAILSMTPPORT',	NULL,	NULL,	NULL),
('SDI_EMAILSMTPSECURE',	NULL,	NULL,	NULL),
('SDI_EMAILTO',	NULL,	NULL,	NULL),
('SDI_ENERJ_B2BPWD',	NULL,	NULL,	NULL),
('SDI_ENERJ_B2BUSER',	NULL,	NULL,	NULL),
('SDI_ENERJ_B2PAPWD',	NULL,	NULL,	NULL),
('SDI_ENERJ_B2PAUSER',	NULL,	NULL,	NULL),
('SDI_ENERJ_COMPANY',	NULL,	NULL,	NULL),
('SDI_ENERJ_PA2BPWD',	NULL,	NULL,	NULL),
('SDI_ENERJ_PA2BUSER',	NULL,	NULL,	NULL),
('SDI_ID',	NULL,	NULL,	NULL),
('SDI_PECEMAIL',	NULL,	NULL,	NULL),
('SDI_PECEMAILFROM',	NULL,	NULL,	NULL),
('SDI_PECEMAILTO',	NULL,	NULL,	NULL),
('SDI_PECIMAP',	NULL,	NULL,	NULL),
('SDI_PECIMAPFOLDER',	NULL,	NULL,	NULL),
('SDI_PECIMAPPORT',	NULL,	NULL,	NULL),
('SDI_PECIMAPSECURE',	NULL,	NULL,	NULL),
('SDI_PECPASSWORD',	NULL,	NULL,	NULL),
('SDI_PECSMTP',	NULL,	NULL,	NULL),
('SDI_PECSMTPPORT',	NULL,	NULL,	NULL),
('SDI_PECSMTPSECURE',	NULL,	NULL,	NULL),
('SDI_RIFINRIGA',	'',	NULL,	'mette riferimenti ddt e ordine in riga'),
('SDI_USERCF',	'',	NULL,	''),
('SDI_USERPIN',	'',	NULL,	''),
('SDI_USERPWD',	'',	NULL,	''),
('SRM_ARTICOLODESCRITTIVO',	'articoli',	NULL,	''),
('SRM_ARTICOLODIRCHIAMATA',	'articoli',	NULL,	''),
('SRM_ARTICOLOKM',	'articoli',	NULL,	''),
('SRM_ARTICOLOORE',	'articoli',	NULL,	''),
('SRM_ARTICOLOPASTO',	'articoli',	NULL,	''),
('SRM_TICKETMININTERVAL',	NULL,	NULL,	NULL),
('SRM_VISIRUN',	NULL,	NULL,	NULL),
('TER_CAUSALECONTOLAV',	'causali',	NULL,	NULL),
('TER_CAUSALECONTOLAVIN',	'causali',	NULL,	NULL),
('TER_CAUSALECONTOLAVOUT',	'causali',	NULL,	NULL),
('TER_CAUSALECONTOLAVPROD',	'causali',	NULL,	'TER_MAGAZZINOPRESSO'),
('WEB_ARTICOLI_GRIGLIA_SELEZRIGA',	'',	NULL,	'abilita se diverso da 0, la checkbox di selezione riga nella griglia articoli (layout web_comp_catalogogriglia)'),
('WEB_BASEURL_SITO',	NULL,	NULL,	'Url utilizzata per reindirizzamenti all\'eshop, utile per Paypal, Nexi, sitemap.xml ed affini'),
('WEB_CATEGORIE_FLAT',	NULL,	NULL,	'se zero la pagina categoria dell\'eshop partirà dalle categorie con PARENT_ID = 0, altrimenti mostra in pagina tutte le categorie'),
('WEB_CHECKUOT_DATA_CONSEGNA',	NULL,	NULL,	'se diverso da 0 (TRUE) abilita il campo DATA CONSEGNA nella pagina CHECKOUT di eshop'),
('WEB_NEXI_ALIAS',	NULL,	NULL,	'credenziale ALIAS per NEXI'),
('WEB_NEXI_ALIAS_TEST',	NULL,	NULL,	'Area Test: credenziale ALIAS per NEXI'),
('WEB_NEXI_MAC',	NULL,	NULL,	'credenziale per calcolo mac di NEXI'),
('WEB_NEXI_MAC_TEST',	NULL,	NULL,	'Area Test: credenziale per calcolo mac di NEXI'),
('WEB_NEXI_MODE',	NULL,	NULL,	'imposta a \'live\' per metterlo in produzione, altrimenti lavora in area test'),
('WEB_PAYPAL_CLIENTID',	NULL,	NULL,	'chiave cliente paypal'),
('WEB_PAYPAL_CLIENTSECRET',	NULL,	NULL,	'chiave segreta paypal'),
('WEB_PAYPAL_MODE',	NULL,	NULL,	'imposta a \'live\' per metterlo in produzione, altrimenti lavora in sandbox'),
('WEB_PAYPAL_SANDBOX_CLIENTID',	NULL,	NULL,	'test: chiave client per test'),
('WEB_PAYPAL_SANDBOX_CLIENTSECRET',	NULL,	NULL,	'test paypal: chiave segreta'),
('WEB_SOCIAL_FB',	NULL,	NULL,	NULL),
('WEB_SOCIAL_IG',	NULL,	NULL,	NULL),
('WEB_SOCIAL_TWITTER',	NULL,	NULL,	NULL),
('WEB_SOCIAL_YOUTUBE',	NULL,	NULL,	NULL),
('WEB_CONTAINER_CLASS',	NULL,'container-fluid','classe standard assegnata al div contenitore in tutte le pagine'),
('WEB_SITO_TIPO',	NULL,	'eshop', 'configurazione del template del sito pubblico: eshop (defualt), formazione, ricambi'),
('WEB_URL',	NULL,	NULL, 'url di pubblicazione del sito pubblico'),
('WEB_HOMESLIDES_SOURCE',	NULL,	'web_slides', 'definisce la tabella sorgente dello slider in home: web_slides (defualt), web_news, web_approfondimenti'),
('WMS_CAUSALEINVENTARIO',	'causali',	NULL,	NULL),
('WMS_COLLICALC',	'',				NULL,	''),
('MRP_LAYOUTNR',	'aaalayout',	'90222',	NULL),
('MRP_LAYOUTCRT',	'aaalayout',	'90221',	NULL),
('MRP_LAYOUTPAL',	'aaalayout',	'1599490223',	NULL),
('MRP_PRELIEVOCALDB',	''         ,		   1,	'> 0 //MONTVAL (componenti) == 0 //PILOMAT (padri)'),
('WEB_ARTICOLO_ALTERNATIVE','',	1,	'prodotti stessa categoria'),
('WEB_ARTICOLO_FAQ',	'',		1,	'FAQ Domande Risposte'),
('WEB_ARTICOLO_RICAMBI',	'',	1,	'schede ricambi che contengono quell articolo'),
('WEB_ARTICOLO_VARIANTI',	'',	1,	'prodotti con gestione varianti'),
('WEB_ARTICOLO_FORMAZIONE',	NULL, '2278903', 'articolo generico per mettere in un ordine i corsi edizione mettendo il tabella ordmovimenti - campo CODICE l ID dell edizione collegata\nil KEYVALUE è l\'ID articolo FORMAZIONE GENERICO'),
('WEB_SPM_GRIDUPDOWN',		'',		1,	'2 only map, 1 grid up , 0 grid down'),
('WEB_ARTICOLO_VARIANTI',	'',		0,	'prodotti con gestione varianti	'),
('WEB_ARTICOLO_FORMAZIONE',	'',		2278903,	'articolo generico per mettere in un ordine i corsi edizione mettendo il tabella ordmovimenti - campo CODICE lID dell edizione collegata'),
('WEB_PAYMANUALE',				'pagamenti',	NULL,	'ID pagamento manuale 51'),
('WEB_SCORPOROIVA',	'',		0,	'gestisce se scorporare o meno l\'iva. 0 falso, 1 vero'),
('WEB_REGISTRAZ_COMPORTAM',	'',		'regular',	'gestisce il comportamento della form di registrazione. - solopiva: permette la sola creazione di aziende (anagrafiche e user) - solopivanonew: permette la sola associazione di user ad aziende'),
('WEB_FORMANAG_COMPORTAM',	'',		'regular',	'gestisce il comportamento della form anagrafica utente:\nregular: regular\nreadonly: campi readonly e bottone submit nascosto'),
('WEB_FORMCOLLAB_COMPORTAM',	'',		'regular',	'gestisce il comportamento della form collaboratori:\nregular: regular\nreadonly: campi readonly e bottone submit nascosto'),
('WEB_EMAILSENDER_ORD',			'',			NULL,	'param email from e to per ordini (B2C e B2B)'),
('WEB_CHECKUOT_B2B_DATA_ORDINE', '', 'current',	'imposta data ordine e data consegna\n- se current o vuoto\n-\n- se next Monday prende il lunedi di inizio settimana'),
('WEB_HEADER_LOGO_HEIGHT',		'',			'50px',	'altezza logo in header'),
('SDI_ANDXOR_COMPANY',			'',			NULL,	'andxor fatture'),
('SDI_ANDXOR_B2BUSER',			'',			NULL,	'andxor fatture'),
('SDI_ANDXOR_B2BPWD',			'',			NULL,	'andxor fatture'),
('SDI_FTP_FOLDERRX',			'',			NULL,	'ftp fatture'),
('SDI_FTP_FOLDERTX',			'',			NULL,	'ftp fatture'),
('SDI_FTP_PWD',					'',			NULL,	'ftp fatture'),
('SDI_FTP_SERVER',				'',			NULL,	'ftp fatture'),
('SDI_FTP_USER',				'',			NULL,	'ftp fatture'),
('SRM_ARTICOLOPERNOTTAMENTO',	'articoli',	NULL,	'service articolo pernottamento'),
('SRM_ARTICOLOTRASFERTAKM',		'articoli',	NULL,	'service articolo costo per km di viaggio'),
('SRM_ARTICOLOTRASFERTAHH',		'articoli',	NULL,	'service articolo costo per h di viaggio');

UPDATE `aaaglobal` SET `KEYVALUE` = NULL WHERE `DESCNAME` = 'SDI_ANDXOR_COMPANY' and `KEYVALUE` = 0;