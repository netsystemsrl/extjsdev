from pymodbus.constants import Endian
from pymodbus.payload import BinaryPayloadDecoder
from pymodbus.payload import BinaryPayloadBuilder
from pymodbus.client.sync import ModbusTcpClient as ModbusClient
from struct import *

# --------------------------------------------------------------------------- #
# configure the client logging
# --------------------------------------------------------------------------- #
import logging
FORMAT = ('%(asctime)-15s %(threadName)-15s '
          '%(levelname)-8s %(module)-15s:%(lineno)-8s %(message)s')
logging.basicConfig(format=FORMAT)
log = logging.getLogger()
log.setLevel(logging.DEBUG)


# ------------------------------------------------------------------------#
UNIT = 2  # default according to the manual, see below
client = ModbusClient('172.16.10.221', port=502)
client.connect()

result = client.read_holding_registers(0x339, 2, unit=UNIT) 
decoder = BinaryPayloadDecoder.fromRegisters(result.registers, Endian.Big, wordorder=Endian.Big)
print ("" + str(decoder.decode_16bit_int()))

result = client.read_holding_registers(0x301, 4, unit=UNIT) 
decoder = BinaryPayloadDecoder.fromRegisters(result.registers, Endian.Big, wordorder=Endian.Big)
print ("" + str(decoder.decode_32bit_int()))

result = client.read_holding_registers(0x305, 4, unit=UNIT) 
decoder = BinaryPayloadDecoder.fromRegisters(result.registers, Endian.Big, wordorder=Endian.Big)
print ("" + str(decoder.decode_32bit_int()))


#	('string', decoder.decode_string(len(strng))),
#	('bits', decoder.decode_bits()),
#	 ('8int', decoder.decode_8bit_int()),
#	 ('8uint', decoder.decode_8bit_uint()),
#	('16int', decoder.decode_16bit_int()),
#	 ('16uint', decoder.decode_16bit_uint()),
#	 ('32int', decoder.decode_32bit_int()),
#	('32uint', decoder.decode_32bit_uint()),
#	 ('16float', decoder.decode_16bit_float()),
#	  ('16float2', decoder.decode_16bit_float()),
#	 ('32float', decoder.decode_32bit_float()),
#	 ('32float2', decoder.decode_32bit_float()),
#	 ('64int', decoder.decode_64bit_int()),
#	 ('64uint', decoder.decode_64bit_uint()),
#	 ('ignore', decoder.skip_bytes(8)),
#	('64float', decoder.decode_64bit_float()),
#	('64float2', decoder.decode_64bit_float()),

# ----------------------------------------------------------------------- #
# close the client
# ----------------------------------------------------------------------- #
client.close()
