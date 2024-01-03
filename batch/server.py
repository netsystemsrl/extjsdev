from opcua import Server
from random import randint
import datetime
import time


server = Server()


url = "opc.tcp://192.168.4.113:4840"
server.set_endpoint(url)


name = "OPCUA_SIMULATION_SERVER"
addspace = server.register_namespace(name)


node = server.get_objects_node()


Param = node.add_object(addspace, "Parameters")


Temp = Param.add_variable(addspace, "Temperature", 0)
Press = Param.add_variable(addspace, "Pressure", 0)
Time = Param.add_variable(addspace, "Time", 0)


Temp.set_writable()
Press.set_writable()
Time.set_writable()


server.start()
print("Server started at {}".format(url))

Pressure = randint(200,999)
Press.set_value(Pressure)

while True:
    
    Temperature = randint(10,50)
    TIME = datetime.datetime.now()
    Temp.set_value(Temperature)
    Time.set_value(TIME)
    
    print(Temperature, Pressure, TIME)
    
    
    time.sleep(2)