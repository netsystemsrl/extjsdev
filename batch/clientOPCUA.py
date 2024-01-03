import time
import keyboard
from opcua import Client,ua
from random import randint
import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="root",
  password="xxxxx",
  database="dbname"
)

mycursor = mydb.cursor(dictionary=True)
while True:
	mycursor.execute("SELECT * FROM iot WHERE LIBRARY = 'OPCUA'")
	recordsIOT = mycursor.fetchall()

	for recordIOT in recordsIOT:
		print("IOT:" + recordIOT['DESCNAME'])
		
		mycursor.execute(	"SELECT * "+
							"FROM iotcontact "+
							"WHERE (" +
										"(AUTOUPDATE > 0 AND TIMESTAMPADD(SECOND,AUTOUPDATE,SC) < NOW()) " +
										" OR SC IS NULL OR VALUE IS NULL"+
										" OR COMMAND IS NOT NULL"+
								")" +
								" AND CT_IOT = " + str(recordIOT["ID"]))
		recordsIOTContact = mycursor.fetchall()
		connected = False
		measure = False
		measureField = ""
		measureValue = ""
		for recordIOTContact in recordsIOTContact:
			if (connected == False):
				try:
					url = "opc.tcp://" + recordIOT["IP"] +":" + recordIOT["PORT"]
					clientOPCUA = Client(url)
					clientOPCUA.connect()
					connected = True
					print("clientOPCUA Connected " + recordIOT["DESCNAME"])
					clientOPCUA.load_type_definitions()
				except:
					print("clientOPCUA not Connected")
					

			if connected:
				try:
					FieldObj = clientOPCUA.get_node(recordIOTContact["FIELDNAME"])
				except:
					print("var OPCUA not exist: " + recordIOTContact["FIELDNAME"])
				else:
					#WRITE
					if (recordIOTContact["COMMAND"] == 'WRITE'):
						#try:
							print("***** WRITE *****" )
							#FieldObj.set_value(recordIOTContact["VALUE"])
							FieldVal = float(recordIOTContact["VALUE"])
							FieldObj.set_value(ua.DataValue(ua.Variant(FieldVal, ua.VariantType.Float)))
							mycursor.execute("UPDATE iotcontact SET COMMAND = '', SC = NOW() WHERE ID = " + str(recordIOTContact["ID"]))
						#except:
						#	print("var Error in UPDATE: " + recordIOTContact["FIELDNAME"] + " VAL:" + recordIOTContact["VALUE"])
					#READ
					try:
						FieldVal = FieldObj.get_value()
						mycursor.execute("UPDATE iotcontact SET VALUE = " + str(FieldVal) + ", SC = NOW() WHERE ID = " + str(recordIOTContact["ID"]))
						mydb.commit()
						print(recordIOTContact["DESCNAME"]  + ' ' + str(FieldVal))
					
						if (recordIOTContact["AUTOMEASURE"]) :
							measureField = measureField + str(recordIOTContact["AUTOMEASURE"]) + ","
							measureValue = measureValue + str(FieldVal) + ","
							measure = True
					except:
						print("var Error in READ: " + recordIOTContact["FIELDNAME"] + " VAL:" + recordIOTContact["VALUE"])
			else:
				break
				
		if connected:
			mycursor.execute("UPDATE iot SET SC = NOW() WHERE ID = " + str(recordIOT["ID"]))
			mydb.commit()
			if measure:
				mycursor.execute(	"SELECT STATOMES_CT_PLANNING " +
									" FROM mes_resourcesiot " + 
										" INNER JOIN mps_resources ON mps_resources.ID = mes_resourcesiot.MPS_CT_RESOURCES " + 
									" WHERE mes_resourcesiot.CT_IOT = " + str(recordIOT["ID"]))
				recordsPlanning = mycursor.fetchall()
				for recordPlanning in recordsPlanning:
					planningID = str(recordPlanning["STATOMES_CT_PLANNING"])
					mycursor.execute("INSERT INTO iotmeasure   (DATATIME,CT_PLANNING, "      + measureField + "CT_IOT) "+
														"VALUES(NOW(),  " + planningID + "," + measureValue + str(recordIOT["ID"]) + ")")
					mydb.commit()
					print(recordIOTContact["DESCNAME"] + ' Log' + measureField )
					measure = False
			if measure:
				mycursor.execute("INSERT INTO iotmeasure   (DATATIME, "      + measureField + "CT_IOT) "+
														"VALUES(NOW(),"      + measureValue + str(recordIOT["ID"]) + ")")
				mydb.commit()
				print(recordIOTContact["DESCNAME"] + ' Log' + measureField )
				measure = False
					
			clientOPCUA.disconnect()
			print("clientOPCUA Disconnected " + recordIOT["DESCNAME"])
	
	time.sleep(10)