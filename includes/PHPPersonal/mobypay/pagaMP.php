
<?php
include_once '../autoloader.php';
include_once 'MobypayApi.php';

include_once 'statsCollect.php';

include_once 'utilSpesa.php';
$user=unserialize($_SESSION['user']);
$userid=$user->id;
global $StatoPagamentoRata;
global $residui;
global $rate;
global $rateids;

class rata {
	public $Id;
	public $totrata;
	public $Intestatario;
	public $DescrizioneBreve;
	public $dataScadenza;
	public $MobyPayBill ;

}


function init()
{
	global $StatoPagamentoRata;
	$StatoPagamentoRata['Pagata']=0;
	$StatoPagamentoRata['DaPagare']=1;
	$StatoPagamentoRata['Scaduta']=2;
	$StatoPagamentoRata['InScadenza']=3;
	$StatoPagamentoRata['CreditoDisponibile']=4;
	$StatoPagamentoRata['CreditoDisponibileParziale']=5;
	$StatoPagamentoRata['CreditoFinito']=6;
	
	
}

function GetStatoPagamentoRata($rata)
{
	global $residui;
	global $StatoPagamentoRata;
	
	if ($rata->totrata==0) return "";
	if ($rata->totrata<0)
	{
		if ($residui[$rata->Id]==0) return $StatoPagamentoRata['CreditoFinito'];
		if ($residui[$rata->Id]>$rata->totrata) return $StatoPagamentoRata['CreditoDisponibileParziale'];
		return $StatoPagamentoRata['CreditoDisponibile'];
	}
	if ($residui[$rata->Id]==0) return $StatoPagamentoRata['Pagata'];
	$dataScad=new DateTime($rata->dataScadenza);
	$oggi=new DateTime();
	$datadiff=($dataScad->diff($oggi))->format('%a');
	if ($rata->dataScadenza<date("Y-m-d")) return $StatoPagamentoRata['Scaduta'];
	if ($datadiff<30 && $rata->dataScadenza>date("Y-m-d")) return $StatoPagamentoRata['InScadenza'];
	return $StatoPagamentoRata['DaPagare'];
	
}

function EliminaRataMobypay($rata)
{
	global $StatoPagamentoRata;
	global $studio;
	//echo "get ".GetStatoPagamentoRata($rata);
	if (GetStatoPagamentoRata($rata) == $StatoPagamentoRata['Pagata']) return true;
	if ($rata->MobyPayBill == '') return true;
	if (!SetAccessToken($studio,$_SESSION['Id_installazione'])) return false;
	$deleteBillResult=DeleteBill($rata->Id);
	$sql="update rata set MobyPayBill=null, MobyPayPaymentResult=null,MobyPayAmount=0 where id='".$rata->Id."'";
	$stmt = dbConn::run($sql);
	
	return true;
}


function getContoCorrente(&$gest,&$cond)
{
	$sql="SELECT distinct(Contocorrente.id),Paese,CinNumerico,Cin,Abi,Cab,NumeroConto,Predefinito from ContoCorrente,fondo where fondo.ContoCorrente=contocorrente.id  and (fondo.Condominio='{$cond}') and COALESCE(ContoCorrenteChiuso,0)<>1 order by Predefinito desc" ;
	//return $sql;
	try
	{
		$stmtcc = dbConn::run($sql);
		while ($cc = $stmtcc->fetch()) {
			$banche[$cc['id']]=$cc['Paese'].$cc['CinNumerico'].$cc['Cin'].$cc['Abi'].$cc['Cab'].$cc['NumeroConto'];
			if ($cc['Predefinito']) $banche['Predefinito']=$cc['id'];
		}
		$sql="select distinct(gestione.id),Gestione.ContoCorrenteAssociato  cc from Gestione where id='{$gest}'";
		$stmtcc = dbConn::run($sql);
		$cc = $stmtcc->fetch();
		$ccg=$cc['cc'];
		if ($ccg=="") $ccg='Predefinito';
		$ret=$banche[$ccg];
		return $ret; //torna l'iban della gestione O il predefinito
		
	} catch (Exception $e)
	{
		return " Errore - Impossibile determinare l'iban del conto corrente associato alla gestione - getContoCorrente";
	}
}
	
	


function getStudioFromCondominio(&$cond)
{
	$sql="select id  from StudioAmministratori where id in (select studio from condominio where id='{$cond}')";
	//return $sql;
		try
		{
			$stmt2 = dbConn::run($sql);
			if (!($s=$stmt2->fetch()))  return " Errore - Impossibile determinare lo studio dell'Amministratore";
			$id=$s['id'];
			return $id;
		} catch (Exception $e)
		{
			return " Errore - Impossibile determinare lo studio dell'Amministratore - getStudioFromCondominio";
		}
}
function verificaCondominio (&$gest,&$cond)
{
	$sql="select condominio  from gestione where id ='{$gest}'";
	//return $sql;
		try
		{
			$stmt2 = dbConn::run($sql);
			$s=$stmt2->fetch();
			if ($s['condominio']!=$cond) return " Errore - Impossibile determinare il Condominio";
			
			return $cond;
		} catch (Exception $e)
		{
			return " Errore - Impossibile determinare il condominio- verificaCondominio";
		}
}


function verificaUnicaGestione ()
{
	global $rateids;
	$sql="select distinct id  from gestione where id in (select gestione from IntestatarioUnitaImmobiliare where id in (select intestatario from rata where id in (".$rateids.")))";
	//return $sql;
		try
		{
			$stmt2 = dbConn::run($sql);
			$s=$stmt2->fetchAll();
			if (count($s)==0) return " Errore - Impossibile determinare la gestione associata alle rate";
			if (count($s)>1) return " Errore - Non è possibile eseguire un unico pagamento perche presenti conti correnti diversi, o rate appartenenti a gestioni differenti. Selezionare solo rate appartenenti alla stessa gestione.";
			$id=($s[0])['id'];
			return $id;
		} catch (Exception $e)
		{
			return " Errore - Impossibile determinare la gestione- verificaUnicaGestione";
		}
}


function verificaUnicoSoggetto ()
{
	global $rate;
	global $rateids;
	foreach ($rate as $t)
	{
		$sql="select distinct id  from soggetto where id in (select soggetto from IntestatarioUnitaImmobiliare where id in (select intestatario from rata where id in (".$rateids.")))";
		//return $sql;
		try
		{
			$stmt2 = dbConn::run($sql);
			$s=$stmt2->fetchAll();
			if (count($s)!=1) return " Errore - Impossibile determinare il soggetto";
			$id=($s[0])['id'];
			$sql="select denominazione, WebEmail from soggetto where id='{$id}'";
			$stmt2 = dbConn::run($sql);
			$e=$stmt2->fetch();
			if (!$e['WebEmail']) return " Errore - Per completare il pagamento inserire un indirizzo email nella vostra utenza web.";
			return $id;
		} catch (Exception $e)
		{
			return " Errore - Impossibile determinare il soggetto- verificaUnicoSoggetto";
		}
		
		
	}
}

function PagaRateMoby()
{
	$residuo=0;
	global $rate;
	global $residui;
	global $studio;
	$conf=new MPConfig;
	$user=unserialize($_SESSION['user']);
	try
	{
		foreach ($rate as $t)
		{
			$sql="SELECT sum(Importo) as importoPag FROM RipartizioneVersamento,Versamento where Rata='{$t->Id}' and Versamento.Id=RipartizioneVersamento.Versamento";
			$stmt2 = dbConn::run($sql);
			$p=$stmt2->fetch();
			$residuo+=$t->totrata-$p['importoPag'];
			$residui[$t->Id]=$t->totrata-$p['importoPag'];
		}
	} catch (Exception $e)
	{
			return " Errore - Residuo da pagare non determinabile";
	}
	if ($residuo>0) //ok Moby
	{
		//controlli preliminari
		$unicoSoggetto=verificaUnicoSoggetto();
		if (strpos($unicoSoggetto,"Errore")>0) return( $unicoSoggetto);
		
		$unicagestione=verificaUnicaGestione();
		if (strpos($unicagestione,"Errore")>0) return( $unicagestione);
		
		$condominio=verificaCondominio($unicagestione,$_SESSION['selectedCond']);
		if (strpos($unicagestione,"Errore")>0) return( $condominio);
		
	    $studio=getStudioFromCondominio($condominio);
		$cc=getContoCorrente($unicagestione,$condominio);
		
		
		
		/*echo "Soggetto: ".$unicoSoggetto."\r\n";
		echo "Gestione: ".$unicagestione."\r\n";
		echo "Condominio: ".$condominio."\r\n";
		echo "Studio: ".$studio."\r\n";
		echo "Contocorrente: ".$cc."\r\n";*/
		
		foreach ($rate as $t) 
		{
			if (!EliminaRataMobypay($t))
			{
				return "Errore - E' stato impossibile eliminare la bolletta da mobypay per la rata {$t->DescrizioneBreve}";
			}
			
		}
		$web_hook_endpoint = $conf->WebhookEndpoint."?db_name=".$_SESSION['DB_NAME'];
		
		if (!SetAccessToken($studio,$_SESSION['Id_installazione']))  return "Errore - Credenziali non valide";
		
		$my_payment = new MobyPayCreateRequestItem;
		$my_payment->webhook_url=$web_hook_endpoint;
		$my_payment->return_url="";
		
		$cf_pi = $user->get_cf();
		if (!$cf_pi) $cf_pi = $user->get_piva();
		//cf_pi = (cf_pi ?? "").Trim(); // 22/09/2020 se null lo sostituisco con blank
		
		$payer_id = $user->get_id();
		$lst_checkouts= [];
		$checkout=new MobypayCheckout;
		
		$sql="Select Via,Civico,Localita,Cap,SiglaProvincia,Comune FROM Indirizzo,Soggetto where Soggetto.Indirizzo=Indirizzo.id ";
		$stmt = dbConn::run($sql);
		$p=$stmt->fetch();
		$IndDescr=$p['Via'] ." ".$p['Civico']." - ".$p['Cap']." ".$p['Comune']." (".$p['SiglaProvincia'].")";
		
		// ---------- impostazione del PAYER ----------
		$my_payer = new MobypayPayer;
	
		$my_payer->address = $IndDescr;
		$my_payer->business_number = "";
		$my_payer->email = $user->get_email();
		$my_payer->fiscal_code = $cf_pi;
		$my_payer->mobile_number = "";
		$my_payer->name = $user->get_denominazione();;
		$my_payer->payer_id = $payer_id;
		$my_payer->phone_number = "";
		$my_payer->totp_authentication = true;
		
		$checkout->payer=$my_payer;
		
		
		$descrizione="";
		
		$r0=current($rate);
		$totImporto=0;
		$dm=date_create($r0->dataScadenza);
		foreach($rate as $r)
		{
			$totImporto+=$r->totrata;
			$dm0=date_create($r->dataScadenza);
			if ($dm0<$dm) $dm=$dm0;
			$descrizione = $descrizione.$r->DescrizioneBreve." ~ ";
		}
        $descrizione = substr($descrizione,0,strlen($descrizione)-3);
		//$totImporto = $totaleResiduo;
		$sql="SELECT NEWID() AS Result";
		$stmt = dbConn::run($sql);
		$ext_number=$stmt->fetchColumn();
		
		$mobypay_new_bill = new MobyPayBill;
        $mobypay_new_bill->Id = $ext_number;
		
		$my_bill = new MbpayBill;

		$my_bill->amount = $totImporto;
		$my_bill->bank_account = $cc;
		$my_bill->currency = "EU";
		$my_bill->due_date = date_format($dm,"Y-m-d");
		$my_bill->checkout_reference = $ext_number;
		$my_bill->statement_descriptor = $descrizione;
		$my_bill->ui_icon = "";
		$my_bill->ui_title = $descrizione;
		
		$my_info_array= []; 
		foreach ($rate as $rata)
		{
			$my_info_item = new MobypayUiInfo;
			$my_info_item->label = "Importo:";
			$my_info_item->value = number_format($rata->totrata, 2);
			array_push($my_info_array,$my_info_item);

			$rata->MobyPayBill = $mobypay_new_bill->Id;
			$rata->MobyPayAmount = $rata->totrata;
			$rata->MobyPayPaymentResult = "to_pay";
			$sql="update rata set MobyPayBill='".$mobypay_new_bill->Id."', MobyPayAmount=".$rata->totrata.",MobyPayPaymentResult='to_pay' where id='".$rata->Id."'";
			$stmtRR = dbConn::run($sql);
		
		}
		$my_bills= []; 
		$my_bill->ui_info_array = $my_info_array;
		array_push($my_bills,$my_bill);
       
	    $checkout->bills = $my_bills;
		array_push($lst_checkouts,$checkout);
     
        $my_payment->checkouts =$lst_checkouts;
		$paymentRequestSerialized = json_encode($my_payment);
        $mobypay_new_bill->json_sent = $paymentRequestSerialized;
        $sql="insert into MobyPayBill (Id,JsonSent,State,BillNumber,PayerId,ErrorMessage,CreatedDate,CheckoutUrl,WebHookResponse,ReceiptUrl,Importo,MobyPayPaymentResult) values (?,?,?,?,?,?,?,?,?,?,?,?)";
		$par=array($mobypay_new_bill->Id,$mobypay_new_bill->json_sent,$mobypay_new_bill->state,$mobypay_new_bill->bill_number,$mobypay_new_bill->payer_id,$mobypay_new_bill->error_message,$mobypay_new_bill->created_date,$mobypay_new_bill->checkout_url,$mobypay_new_bill->webhook_response,$mobypay_new_bill->receipt_url,$mobypay_new_bill->importo,$mobypay_new_bill->mobyPayPaymentResult);
		$stmt = dbConn::run($sql,$par);
		
		$paymentResponse=CreateBill($my_payment);
		$pRdecode=json_decode($paymentResponse);
		//echo "\r\nRisultato della CreateBill -------------";
		//	print_r($pRdecode);
		//echo "\r\n";
		$received_bill = ($pRdecode->item)->bills[0];
        if ($received_bill->error_message!=''){
			$error=$received_bill->error_message;
			return "Errore -".$error;
		}			
		
		$checkout_url= $received_bill->checkout_url;
		$sql="update MobyPayBill set State=?,BillNumber=?,PayerId=?,ErrorMessage=?,CreatedDate=?,CheckoutUrl=?,Importo=? where id=?";
		$par=array($received_bill->state,$received_bill->bill_number,$received_bill->payer_id,$received_bill->error_message,$received_bill->created_date,$received_bill->checkout_url,$totImporto,$mobypay_new_bill->Id);
		$stmt = dbConn::run($sql,$par);
		
		usleep(100);
		
		return $checkout_url;
			
		
		
		
		
		
	}else //effettua pagamento locale
	{
	
	}
	return "ok";
}


init();
$tmp="'".str_replace("||","','",substr($_POST['ids'],0,strlen($_POST['ids'])));
$rateids=substr($tmp,0,strlen($tmp)-2);

$sql="select Id,importo+arrotondamenti+conguaglio as totrata,Intestatario,DescrizioneBreve,dataScadenza,MobyPayBill  from rata where id in (".$rateids.")";
$stmt = dbConn::run($sql);
$rate;
while ($r=$stmt->fetch())
{
	$rata=new rata();
	$rata->Id=$r['Id'];
	$rata->totrata=$r['totrata'];
	$rata->Intestatario=$r['Intestatario'];
	$rata->DescrizioneBreve=$r['DescrizioneBreve'];
	$rata->dataScadenza=$r['dataScadenza'];
	$rata->MobyPayBill=$r['MobyPayBill'];
	$rate[$r['Id']]=$rata;
}
//echo "rate: ".print_r($rate);
echo PagaRateMoby();





		
	



?>


