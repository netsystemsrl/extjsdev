import { memoize } from 'lodash/fp';
import jsbarcode from 'jsbarcode';

const t = (s, data) => s.replace(/\{(\w*)\}/gi, (match, g1) => data[g1] || '');

const gs1FixedAppIdPatterns = [
  '00',
  '01',
  '02',
  '03',
  '04',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '91',
  '99', // ??
  '255',
  '31[0123456]\\d',
  '32\\d\\d',
  '33[01234567]\\d',
  '34\\d\\d',
  '35[01234567]\\d',
  '36\\d\\d',
  '394\\d',
  '402',
  '41[012345]',
  '42[2456]',
  '7001',
  '7003',
  '7006',
  '8001',
  '8005',
  '8006',
  '8017',
  '8018',
  '8100',
  '8111'
];

const getGS1FixedAppIdRegexes = memoize(() =>
  gs1FixedAppIdPatterns.map(pattern => new RegExp(`^${pattern}$`)));

const isGS1FixedLengthAppId = (appId) =>
  getGS1FixedAppIdRegexes().some(fixedAppIdRegex =>
    fixedAppIdRegex.test(appId));

export const renderBarcode = (containerEl, requestedType, requestedValue, includeText, fontSize = 16) => {
  const barcodeCanvas = document.createElement('canvas');
  barcodeCanvas.style.width = `100%`;
  barcodeCanvas.style.height = `100%`;
  containerEl.appendChild(barcodeCanvas);
  let barcodeType = requestedType;
  let barcodeValue = requestedValue;
  let text = barcodeValue;  // preserve raw display value
  let ean128 = undefined;
  if (barcodeType === 'GS1-128') {
    barcodeType = 'CODE128';
    ean128 = true;
    const FNC1 = '\xCF';
    const dataElements = barcodeValue.replace(/\s/g, '').match(/\(\w+\)\w+/g);
    if (dataElements) {
      barcodeValue = dataElements.reduce((outArray, dataElement, ix) => {
        const [ _, appId, dataValue ] = dataElement.match(/\((\w+)\)(\w+)/);
        const appendEndMarker = ix < dataElements.length - 1
            && !isGS1FixedLengthAppId(appId);
        outArray.push(`${appId}${dataValue}${appendEndMarker ? FNC1 : ''}`);
        return outArray;
      }, []).join('');
    }
  }
  const showError = () => {
    containerEl.removeChild(barcodeCanvas);
    containerEl.className += ' jsr-invalid-barcode';
    containerEl.textContent = t('Data not valid for barcode format: {format}',
      { format: requestedType });
  }
  try {
    jsbarcode(barcodeCanvas, barcodeValue, {
      format: barcodeType,
      text,
      displayValue: Boolean(includeText),
      fontSize,
      ean128
    }, (isValid) => {
      if (!isValid) {
        showError();
      }
    });
  } catch (e) {
    showError();
  }
};
