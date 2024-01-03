#!/usr/bin/python
#pip install web.py
#pip install python-escpos
#python -m pip install web.py
import configparser
import glob
import os

import argparse
import web
import socket
import threading
from threading import Thread, Event
import subprocess
import sys
import time
import pickle
import os.path
import json
from pprint import pprint

import six
#https://github.com/python-escpos/python-escpos
from escpos import printer
from escpos.printer import Usb
from escpos.printer import Network

#CONFIGURATION COMMAND LINE
HidDeviceNum = '0'
if len(sys.argv) > 1: HidDeviceNum = sys.argv[1]

#CONFIGURATION REST.INI
Config = configparser.ConfigParser()
Config._interpolation = configparser.ExtendedInterpolation()
Config.read(os.path.join(os.path.dirname(__file__) ,'cfg.ini'))



def ConfigSectionMap(section):
    dict1 = {}
    options = Config.options(section)
    for option in options:
        try:
            dict1[option] = Config.get(section, option)
            if dict1[option] == -1:
                DebugPrint("skip: %s" % option)
        except:
            print("exception on %s!" % option)
            dict1[option] = None
    return dict1


urls = (
    '/set/(.*)', 'set',
    '/send', 'send',
    '/receive/(.*)', 'receive',
)

#SERIAL CODE
STX = '\x02'
ETX = '\x03'
Progressivo = 1

#WEB
class send:
    def GET(self):
        
        command = ''
        trynum = 0
        protocol = ''
        port = 0
        ip = ''
        printed = False
        connected = False
        myMessageReceived = ''
        
        StringPost = web.input()
        for key, val in StringPost.items():
            #print("send!" + key + "->" + val) 
            if (key == 'protocol'): 
                protocol = val
                if (protocol == 'customdll'):
                    if ip == '' : ip = Config.get("customdll","ip")
                    if port == 0 : port = int(Config.get("customdll","port"))
                if (protocol == 'ecr'):
                    if ip == '' : ip = Config.get("ecr","ip")
                    if port == 0 : port = int(Config.get("ecr","port"))
                if (protocol == 'scr'):
                    if ip == '' : ip = Config.get("scr","ip")
                    if port == 0 : port = int(Config.get("scr","port"))
            if (key == 'command'): 
                command = val
            if (key == 'ip'): 
                ip = val
            if (key == 'port'): 
                port = int(val)
            
        print("IP->" + ip + "<-")
        print("PORT->" + str(port) + "<-")
        print("protocol->" + protocol + "<-")
        print("command->" + command + "<-")
        
        if (protocol == 'customdll'):
            #CONNECT
            MySocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            MySocket.settimeout(5)
            while connected == False:
                if(not connected):
                    try:
                        MySocket.connect((ip, port))
                        print("Server connected")
                        connected = True
                    except TypeError as msg:
                        pass
                        print ("Type Error: %s" % msg)
                        print("IP " + ip + " not connected ... retry ...")
                        time.sleep(3)
                trynum = trynum +1
                if(trynum > 5): 
                    return '{"status":{"response": "ko"}}'
            
            #TRASM
            arraycommand = command.split('|')
            global Progressivo
            riga = 0
            rigaold = ""
            for current in range(len(arraycommand)-1):
                riga = riga + 1
                IDENT = '0'
                Progressivo = Progressivo + 1
                rigaold = arraycommand[current]
                if (Progressivo > 98) : Progressivo = 1
                myMessage = str(Progressivo).zfill(2) + IDENT + rigaold
                print("original->" + myMessage + "<-")
                ncks = 0
                for ch in myMessage:
                    ncks = ncks + ord(ch)
                CKS = ncks % 100;
                myMessage = STX +  myMessage + str(CKS).zfill(2) + ETX
                print("send!" + str(riga) +"->" + myMessage + "<-")
                print("sendcks!" + str(ncks) +"->" + str(CKS) + "<-")
                try:
                    MySocket.send(bytes(myMessage, "utf-8"))
                    myMessageReceived = MySocket.recv(1024)
                except:
                    print("Server not connected")
                    pass
                print( myMessageReceived )
                
                #RETRY FINE CARTA
                while printed == False and connected == True and (str(myMessageReceived).find('ERR16') != -1):
                    print("MANAGE FINE CARTA ERROR16")
                    time.sleep(2)
                    Progressivo = Progressivo + 1
                    if (Progressivo > 98) : Progressivo = 1
                    myMessage = str(Progressivo).zfill(2) + IDENT + arraycommand[current]
                    ncks = 0
                    for ch in myMessage:
                        ncks = ncks + ord(ch)
                    CKS = ncks % 100;
                    myMessage = STX +  myMessage + str(CKS).zfill(2) + ETX
                    print("Rsend!" + str(riga) +"->" + myMessage + "<-")
                    print("sendcks!" + str(ncks) +"->" + str(CKS) + "<-")
                    try:
                        MySocket.send(bytes(myMessage, "utf-8"))
                        myMessageReceived = MySocket.recv(1024)
                    except:
                        print("Server not connected")
                        pass
                    print( myMessageReceived )
                    
                    trynum = trynum +1
                    if(trynum > 30): break
                
                print('');
                time.sleep(0.2)
            
            #RESULT
            if(connected):
                MySocket.close()
                Appo = '{"status":{"response": "ok"}}'
            else:
                Appo = '{"status":{"response": "ko"}}'
            return Appo
            
        if (protocol == 'xonxoff'):
            #CONNECT
            MySocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            MySocket.settimeout(5)
            while connected == False:
                if(not connected):
                    try:
                        MySocket.connect((ip, port))
                        print("Server connected")
                        connected = True
                    except:
                        pass
                        print("IP not connected" + ip + " ... retry ...")
                        time.sleep(3)
                trynum = trynum +1
                if(trynum > 5): break
            
            #TRASM
            arraycommand = command.split('|')
            for current in range(len(arraycommand)-1):                
                myMessage =  arraycommand[current]
                print("send!->" + myMessage + "<-")
                try:
                    MySocket.send(bytes(myMessage, "utf-8"))
                    myMessageReceived = MySocket.recv(1024)
                except:
                    print("Server not connected")
                    pass
                print( myMessageReceived )
                print('');
                time.sleep(0.3)
        
            #RESULT
            if(connected):
                MySocket.close()
                Appo = '{"status":{"response": "ok"}}'
            else:
                Appo = '{"status":{"response": "ko"}}'
            return Appo
        
        if (protocol == 'zpl'):
            #CONNECT
            MySocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            MySocket.settimeout(5)
            while connected == False:
                if(not connected):
                    try:
                        MySocket.connect((ip, port))
                        print("Server connected")
                        connected = True
                    except:
                        pass
                        print("IP not connected" + ip + " ... retry ...")
                        time.sleep(3)
                trynum = trynum +1
                if(trynum > 5): break
            
            #TRASM
            arraycommand = command.split('|')
            for current in range(len(arraycommand)-1):                
                myMessage =  arraycommand[current]
                print("send!->" + myMessage + "<-")
                try:
                    MySocket.send(bytes(myMessage, "utf-8"))
                    myMessageReceived = MySocket.recv(1024)
                except:
                    print("Server not connected")
                    pass
                print( myMessageReceived )
                print('');
                time.sleep(0.3)
        
            #RESULT
            if(connected):
                MySocket.close()
                Appo = '{"status":{"response": "ok"}}'
            else:
                Appo = '{"status":{"response": "ko"}}'
            return Appo
            
        if (protocol == 'scr'):
            epson = Network(ip) #Printer IP Address
            #epson = Usb(0x04b8, 0x0202, 0, profile="TM-T88III")
            #epson = Serial(devfile='/dev/tty.usbserial',baudrate=9600,bytesize=8, parity='N', stopbits=1, timeout=1.00, dsrdtr=True)
            
            arraycommand = command.split('|')
            for current in range(len(arraycommand)-1):                
                myMessage =  arraycommand[current]
                print("cmd!->" + myMessage + "<-")
                print("subcmd!->" +myMessage[0:3] + "<-")
                if (myMessage[0:3] == 'EAN'):
                    myMessage = myMessage[3:len(myMessage)]
                    print("sendEAN!->" + myMessage + "<-")
                    epson.barcode     ('1324354657687', myMessage, 64, 2, '', '')
                    #epson.barcode("{B012ABCDabcd", "CODE128", function_type="B")
                elif (myMessage[0:3] == 'QRC'):
                    myMessage = myMessage[3:len(myMessage)]
                    print("sendQRC!->" + myMessage + "<-")
                    epson.qr          (myMessage, native=True, size=7)
                elif (myMessage[0:3] == 'BLD'):
                    myMessage = myMessage[3:len(myMessage)]
                    myMessage = myMessage + "\n"
                    print("sendBLD!->" + myMessage + "<-")
                    epson.set(align=u'left') 
                    epson.set(height=3) 
                    epson.set(width=3) 
                    epson.text(myMessage)
                elif (myMessage[0:3] == 'IMG'):
                    myMessage = myMessage[3:len(myMessage)]
                    print("sendIMG!->" + myMessage + "<-")
                    epson.image       (myMessage)
                else:
                    myMessage = myMessage + "\n"
                    print("sendNRM!->" + myMessage + "<-")
                    epson.set(align=u'left') 
                    epson.set(height=2) 
                    epson.set(width=2) 
                    epson.text(myMessage)
                    #epson.set(font='a', height=2, align='center', text_type='bold')
                    #epson.block_text(myMessage, 3)
                    #epson.text(myMessage)
                    #epson.writelines(myMessage, width=2)
                Appo = ""
            epson.cut()
             
            
            return Appo
        
        if (protocol == 'raw'):   
            #CONNECT
            MySocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            MySocket.settimeout(5)
            while connected == False:
                if(not connected):
                    try:
                        MySocket.connect((ip, port))
                        print("Server connected")
                        connected = True
                    except:
                        pass
                        print("IP not connected" + ip + " ... retry ...")
                        time.sleep(3)
                trynum = trynum +1
                if(trynum > 5): break
            
            #TRASM 
            arraycommand = command.split('|')
            for current in range(len(arraycommand)-1):                
                myMessage =  arraycommand[current]
                print("send!->" + myMessage + "<-")
                try:
                    MySocket.send(bytes(myMessage, "utf-8"))
                    myMessageReceived = MySocket.recv(1024)
                except:
                    print("Server not connected")
                    pass
                print( myMessageReceived )
                print('');
                time.sleep(0.3)
               
            #RESULT
            if(connected):
                MySocket.close()
                Appo = '{"status":{"response": "ok"}}'
            else:
                Appo = '{"status":{"response": "ko"}}'
            return Appo
        
            
if __name__ == "__main__":
    #START WEBAPP
    print (os.path.join(os.path.dirname(__file__) +'\config.ini'))
    print (Config.get("customdll","ip"))
    app = web.application(urls, globals())
    app.run()