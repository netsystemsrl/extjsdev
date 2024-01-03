<?php
	error_reporting(E_ALL); 
	ini_set('display_startup_errors', 1);
	ini_set('display_errors', 1);
	error_reporting(-1);
	
// require __DIR__ . '/../vendor/autoload.php';

interface Request{
    public function parse(string $binaryData);
    public function getRequest();
    public function getUri(): string;
}

use ModbusTcpClient\Exception\InvalidArgumentException;
abstract class RegisterAddress implements Address{
    /** @var int */
    protected $address;

    /** @var string */
    protected $type;

    public function __construct(int $address, string $type){
        $this->address = $address;
        $this->type = $type;

        if (!in_array($type, $this->getAllowedTypes(), true)) {
            throw new InvalidArgumentException("Invalid address type given! type: '{$type}', address: {$address}");
        }
    }

    public function getAddress(): int    {
        return $this->address;
    }

    public function getSize(): int{
        $size = 1;
        switch ($this->type) {
            case Address::TYPE_INT32:
            case Address::TYPE_UINT32:
            case Address::TYPE_FLOAT:
                $size = 2;
                break;
            case Address::TYPE_INT64:
            case Address::TYPE_UINT64:
                $size = 4;
                break;
        }
        return $size;
    }

    public function getType(): string
    {
        return $this->type;
    }
}

abstract class AddressSplitter{
    const UNIT_ID_PREFIX = '||unitId=';

    const MAX_REGISTERS_PER_MODBUS_REQUEST = 124;
    const MAX_COILS_PER_MODBUS_REQUEST = 2048; // response has 1 byte field for count - so 256 * 8 is max

    protected function getMaxAddressesPerModbusRequest(): int{
        return static::MAX_REGISTERS_PER_MODBUS_REQUEST;
    }

    abstract protected function createRequest(string $uri, array $addressesChunk, int $startAddress, int $quantity, int $unitId);

    /**
     * @param Address[] $addresses
     * @return array
     */
    public function split(array $addresses): array    {
        $result = [];
        foreach ($addresses as $modbusPath => $addrs) {
            $pathParts = explode(static::UNIT_ID_PREFIX, $modbusPath);
            $uri = $pathParts[0];
            $unitId = $pathParts[1];
            // sort by address and size to help chunking
            usort($addrs, function (Address $a, Address $b) {
                $aAddr = $a->getAddress();
                $bAddr = $b->getAddress();
                if ($aAddr === $bAddr) {
                    $sizeCmp = $a->getSize() <=> $b->getSize();
                    return $sizeCmp !== 0 ? $sizeCmp : $a->getType() <=> $b->getType();
                }
                return $aAddr <=> $bAddr;

            });

            $startAddress = null;
            $quantity = null;
            $chunk = [];
            $previousAddress = null;
            $maxAvailableRegister = null;
            foreach ($addrs as $currentAddress) {
                /** @var Address $currentAddress */
                $currentStartAddress = $currentAddress->getAddress();
                if ($startAddress === null) {
                    $startAddress = $currentStartAddress;
                }

                $nextAvailableRegister = $currentStartAddress + $currentAddress->getSize();

                // in case next address is smaller than previous address with its size we need to make sure that quantity does not change
                // as those addresses overlap
                if ($maxAvailableRegister === null || $nextAvailableRegister > $maxAvailableRegister) {
                    $maxAvailableRegister = $nextAvailableRegister;
                } else if ($nextAvailableRegister < $maxAvailableRegister) {
                    $nextAvailableRegister = $maxAvailableRegister;
                }
                $previousQuantity = $quantity;
                $quantity = $nextAvailableRegister - $startAddress;
                if ($this->shouldSplit($currentAddress, $quantity, $previousAddress, $previousQuantity)) {
                    $result[] = $this->createRequest($uri, $chunk, $startAddress, $previousQuantity, $unitId);

                    $chunk = [];
                    $maxAvailableRegister = null;
                    $startAddress = $currentStartAddress;
                    $quantity = $currentAddress->getSize();
                }
                $chunk[] = $currentAddress;
                $previousAddress = $currentAddress;
            }

            if (!empty($chunk)) {
                $result[] = $this->createRequest($uri, $chunk, $startAddress, $quantity, $unitId);
            }
        }
        return $result;
    }

    protected function shouldSplit(Address $currentAddress, int $currentQuantity, Address $previousAddress = null, int $previousQuantity = null): bool{
        return $currentQuantity >= $this->getMaxAddressesPerModbusRequest();
    }

}

interface Request{
    public function parse(string $binaryData);
    public function getRequest();
    public function getUri(): string;
}

interface Address{
    const TYPE_BIT = 'bit';
    const TYPE_BYTE = 'byte';
    const TYPE_INT16 = 'int16';
    const TYPE_UINT16 = 'uint16';
    const TYPE_INT32 = 'int32';
    const TYPE_UINT32 = 'uint32';
    const TYPE_INT64 = 'int64';
    const TYPE_UINT64 = 'uint64';
    const TYPE_FLOAT = 'float';
    const TYPE_STRING = 'string';
    const TYPES = [
        Address::TYPE_BIT,
        Address::TYPE_BYTE,
        Address::TYPE_INT16,
        Address::TYPE_UINT16,
        Address::TYPE_INT32,
        Address::TYPE_UINT32,
        Address::TYPE_UINT64,
        Address::TYPE_INT64,
        Address::TYPE_FLOAT,
        Address::TYPE_STRING,
    ];
    public function getSize(): int;
    public function getAddress(): int;
}

require '../src/';
require_once dirname(__FILE__) . '/../Phpmodbus/ModbusMaster.php';

use ModbusTcpClient\Network\BinaryStreamConnection;
use ModbusTcpClient\Packet\ModbusFunction\ReadHoldingRegistersRequest;
use ModbusTcpClient\Packet\ModbusFunction\ReadHoldingRegistersResponse;
use ModbusTcpClient\Packet\ResponseFactory;
use ModbusTcpClient\Utils\Endian;

$returnJson = filter_var($_GET['json'] ?? false, FILTER_VALIDATE_BOOLEAN);

// if you want to let others specify their own ip/ports for querying data create file named '.allow-change' in this directory
// NB: this is a potential security risk!!!
$canChangeIpPort = file_exists('.allow-change');

$ip = '192.168.100.1';
$port = 502;
if ($canChangeIpPort) {
    $ip = filter_var($_GET['ip'] ?? '', FILTER_VALIDATE_IP) ? $_GET['ip'] : $ip;
    $port = (int)($_GET['port'] ?? $port);
}

$unitId = (int)($_GET['unitid'] ?? 0);
$startAddress = (int)($_GET['address'] ?? 256);
$quantity = (int)($_GET['quantity'] ?? 12);
$endianess = (int)($_GET['endianess'] ?? Endian::BIG_ENDIAN_LOW_WORD_FIRST);
Endian::$defaultEndian = $endianess;

$log = [];
$log[] = "Using: ip: {$ip}, port: {$port}, address: {$startAddress}, quantity: {$quantity}, endianess: {$endianess}";

$connection = BinaryStreamConnection::getBuilder()
    ->setPort($port)
    ->setHost($ip)
    ->build();


$packet = new ReadHoldingRegistersRequest($startAddress, $quantity, $unitId);
$log[] = 'Packet to be sent (in hex): ' . $packet->toHex();

$startTime = round(microtime(true) * 1000,3);
$result = [];
try {
    $binaryData = $connection->connect()->sendAndReceive($packet);

    $log[] = 'Binary received (in hex):   ' . unpack('H*', $binaryData)[1];

    /** @var $response ReadHoldingRegistersResponse */
    $response = ResponseFactory::parseResponseOrThrow($binaryData)->withStartAddress($startAddress);

    foreach ($response as $address => $word) {
        $doubleWord = isset($response[$address + 1]) ? $response->getDoubleWordAt($address) : null;
        $quadWord = null;
        if (isset($response[$address + 3])) {
            $quadWord = $response->getQuadWordAt($address);
            try {
                $UInt64 = $quadWord->getUInt64(); // some data can not be converted to unsigned 64bit int due PHP memory limitations
            } catch (Exception $e) {
                $UInt64 = '-';
            }
            try {
                $Int64 = $quadWord->getInt64();
            } catch (Exception $e) {
                $Int64 = '-';
            }

        }

        $highByteAsInt = $word->getHighByteAsInt();
        $lowByteAsInt = $word->getLowByteAsInt();
        $result[$address] = [
            'highByte' => '0x' . str_pad(dechex($highByteAsInt), 2, '0') . ' / ' . $highByteAsInt . ' / "&#' . $highByteAsInt . ';"',
            'lowByte' => '0x' . str_pad(dechex($lowByteAsInt), 2, '0') . ' / ' . $lowByteAsInt . ' / "&#' . $lowByteAsInt . ';"',
            'highByteBits' => sprintf('%08d', decbin($highByteAsInt)),
            'lowByteBits' => sprintf('%08d', decbin($lowByteAsInt)),
            'int16' => $word->getInt16(),
            'UInt16' => $word->getUInt16(),
            'int32' => $doubleWord ? $doubleWord->getInt32() : null,
            'UInt32' => $doubleWord ? $doubleWord->getUInt32() : null,
            'float' => $doubleWord ? $doubleWord->getFloat() : null,
            'Int64' => $quadWord ? $Int64 : null,
            'UInt64' => $quadWord ? $UInt64 : null,
        ];
    }

} catch (Exception $exception) {
    $result = null;
    $log[] = 'An exception occurred';
    $log[] = $exception->getMessage();
    $log[] = $exception->getTraceAsString();
} finally {
    $connection->close();
}
$elapsed = round(microtime(true) * 1000) - $startTime;

if ($returnJson) {
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');
    http_response_code($result !== null ? 200 : 500);
    echo json_encode(
        [
            'data' => $result,
            'debug' => $log,
            'time_ms' => $elapsed
        ],
        JSON_PRETTY_PRINT
    );

    exit(0);
}

?>

<h2>Example FC3 request</h2>
<form>
    IP: <input type="text" name="ip" value="<?php echo $ip; ?>" <?php if (!$canChangeIpPort) { echo 'disabled'; } ?>><br>
    Port: <input type="number" name="port" value="<?php echo $port; ?>"><br>
    UnitID (SlaveID): <input type="number" name="unitid" value="<?php echo $unitId; ?>"><br>
    Address: <input type="number" name="address" value="<?php echo $startAddress; ?>"><br>
    Quantity: <input type="number" name="quantity" value="<?php echo $quantity; ?>"><br>
    Endianess: <select name="endianess">
        <option value="1" <?php if ($endianess === 1) { echo 'selected'; } ?>>BIG_ENDIAN</option>
        <option value="5" <?php if ($endianess === 5) { echo 'selected'; } ?>>BIG_ENDIAN_LOW_WORD_FIRST</option>
        <option value="2" <?php if ($endianess === 2) { echo 'selected'; } ?>>LITTLE_ENDIAN</option>
        <option value="6" <?php if ($endianess === 6) { echo 'selected'; } ?>>LITTLE_ENDIAN_LOW_WORD_FIRST</option>
    </select><br>
    <button type="submit">Send</button>
</form>
<h2>Debug info</h2>
<pre>
<?php
foreach ($log as $m) {
    echo $m . PHP_EOL;
}
?>
</pre>
<h2>Result</h2>
<table border="1">
    <tr>
        <td rowspan="2">WORD<br>address</td>
        <td colspan="6">Word</td>
        <td colspan="3">Double word (from this address)</td>
        <td>Quad word</td>
    </tr>
    <tr>
        <td>high byte<br>Hex / Dec / Ascii</td>
        <td>low byte<br>Hex / Dec / Ascii</td>
        <td>high bits</td>
        <td>low bits</td>
        <td>int16</td>
        <td>UInt16</td>
        <td>int32</td>
        <td>UInt32</td>
        <td>float</td>
        <td>int64</td>
        <td>UInt64</td>
    </tr>
    <?php foreach ($result ?? [] as $address => $values) { ?>
        <tr>
            <td><?php echo $address ?></td>
            <td><?php echo implode('</td><td>', $values) ?></td>
        </tr>
    <?php } ?>
</table>
Time <?php echo $elapsed ?> ms
</br>
Page generated: <?php echo date('c') ?>
