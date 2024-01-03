import time
import keyboard
from opcua import Client
from random import randint

#url = "opc.tcp://192.168.4.113:4840"
url = "opc.tcp://192.168.4.126:4840"

client= Client(url)

client.connect()
print("Client Connected")
client.load_type_definitions()

root = client.get_root_node()
print("Root node is: ", root)
print("Children of root are: ", root.get_children())

objects = client.get_objects_node()
print("Objects node is: ", objects)


while True:
	HourlyProductionObj = client.get_node("ns=4;s=HourlyProduction")
	HourlyProduction = HourlyProductionObj.get_value()
	print(HourlyProduction)

	CurrentTemp1Obj = client.get_node("ns=4;s=CurrentTemp1")
	CurrentTemp1 = CurrentTemp1Obj.get_value()
	print(CurrentTemp1)
	
	if (1==2):
		Temp = client.get_node("ns=2;i=2")
		Temperature = Temp.get_value()
		print(Temperature)

		Press = client.get_node("ns=2;i=3")
		Pressure = Press.get_value()
		print(Pressure)
		
		PressureNew = randint(200,999)
		Press.set_value(PressureNew)

		TIME = client.get_node("ns=2;i=4")
		Time = TIME.get_value()
		print(Time)

	time.sleep(1)
	
	if keyboard.is_pressed("q"):
		print("q pressed, ending loop")
		client.disconnect()
		break