<?php
	require_once ($_SERVER['DOCUMENT_ROOT'].'/includes/var.php');
	WFSendLOG("Login:","START");
	error_reporting(E_ALL);
	ini_set('display_errors', 1);
	$conn->debug=1; 
	
	$pagenumber = 0;
	$filePDF = '469.pdf';
	//$filePNG = '469.png';
	//WFPDFParserPDF2PNG(__dir__ . '\\'. $filePDF, __dir__ . '\\'. $filePNG);
	$filePNG = WFPDFParserPDF2PNG(__dir__ . '\\'. $filePDF);
?>
<!DOCTYPE html>
<html>

<head>
<script type="text/javascript" src="jquery.js"></script>
<script type="text/javascript" src="jquery.blockUI.js"></script>
<script type="text/javascript" src="jquery.Jcrop.js"></script>
</head>

<body>
<div id="5a428066930bc" class="setapdf-demos testPdfReader">
    <form class="demo" action="positionextract.php" method="post" enctype="multipart/form-data" target="tmpIframe">
		<div class="step result">
			<table>
				<tr>
					<td style="border: 1px solid #d3d3d3;">
						<img src="<?php  echo($filePNG); ?>" class="demoImage"/>
					</td>
					<td style="vertical-align: top; padding: 5px;">
						<div class="extractedText"></div>
					</td>
				</tr>
			</table>
			<script type="text/javascript">
				$(function() {
					var rootNode = $('div.setapdf-demos#5a428066930bc'),
						resultNode = $('.result', rootNode),
						form = resultNode.parentsUntil(rootNode, 'form.demo').get(0);

					$.blockUI.defaults.message = '<img src="ajax-loader-big.gif" />';
					$.extend($.blockUI.defaults.css, {
						backgroundColor: 'transparent',
						border: 'none',
						color: '#fff'
					});
					$('a[href="#result"]:first', rootNode).parent().prev().children().click();
					$('.demoImage', resultNode).Jcrop({
						onSelect: function(c) {
							if (resultNode.attr('data-is-loading') == 1) {
								return;
							}
							//ratio = 2.10;
							ratio = 1.05;
							
							c.x = c.x / ratio ;
							c.x2 = c.x2 / ratio ;
							c.y = c.y / ratio ;
							c.y2 = c.y2 / ratio ;
							//x1 = a sx = 0
							//y2 infondo a sx = 0,0
							c.y = 842 - c.y;
							c.y2 = 842 - c.y2;

							$.blockUI();
							resultNode.attr('data-is-loading', 1);
							$.ajax({
								url : form.action,
								type : 'POST',
								cache : false,
								data: 'action=executeScript&file=<?php  echo($filePDF); ?>&data[x1]=' + c.x + '&data[y1]=' + c.y + '&data[x2]=' + c.x2 + '&data[y2]=' + c.y2,
								dataType: "json"
							}).done(function(result) {
								try {
									var extractedText = $('div.extractedText', resultNode);
									extractedText.empty();

									if (result.error != undefined) {
										throw result.error;
									}

									if (result.output != undefined) {
										extractedText.html('<h3>Script Output:</h3><pre>' + result.output + '</pre>');
									}

									if (result.php != undefined) {
										$('a[href="#code"]').removeClass('disabled').addClass('inactive');
										$('div.code', form).html([
											$('<pre class="code" data-lang="php" />').text(result.php)
										]);
									}
								} catch(error) {
									console.log(error);
									resultNode.data('lastData', null);
								}

								$.unblockUI();
								resultNode.attr('data-is-loading', 0);
							}).fail(function(error) {
								console.log(error.responseText);
								$.unblockUI();
								resultNode.attr('data-is-loading', 0);
							});
						},
						onRelease: function() {
							$('a[href="#code"]').addClass('disabled');

							var extractedText = $('div.output .extractedText', form);
							extractedText.empty();
						}
					});
				});
			</script>
		</div>
		<div class="step code"> </div>
    </form>
    
</div>

</div>

<iframe style="display:none;" id="tmpIframe" name="tmpIframe"></iframe>

</body>
</html>