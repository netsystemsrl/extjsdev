import mysql.connector
import pdfplumber
import os.path
from pathlib import Path
from os.path import exists
import re

FOLDER_PATH = '/var/www/html/archive/ideologica/'

def getWords(text):
    textme = re.sub("[^A-Za-z]", " ", text.strip())
    textme = textme.lower()
    
    textme = textme.replace("  ", " ")
    textme = textme.replace("  ", " ")
    textme = textme.replace("  ", " ")
    textme = textme.replace("  ", " ")
    
    textme = textme.replace(" io ", " ")
    textme = textme.replace(" tu ", " ")
    textme = textme.replace(" egli ", " ")
    textme = textme.replace(" noi ", " ")
    textme = textme.replace(" voi ", " ")
    textme = textme.replace(" essi ", " ")
    
    textme = textme.replace(" il ", " ")
    textme = textme.replace(" lo ", " ")
    textme = textme.replace(" la ", " ")
    textme = textme.replace(" i ", " ")
    textme = textme.replace(" gli ", " ")
    textme = textme.replace(" le ", " ")
    
    textme = textme.replace(" di ", " ")
    textme = textme.replace(" a ", " ")
    textme = textme.replace(" da ", " ")
    textme = textme.replace(" in ", " ")
    textme = textme.replace(" con ", " ")
    textme = textme.replace(" su ", " ")
    textme = textme.replace(" per ", " ")
    textme = textme.replace(" fra ", " ")
    textme = textme.replace(" tra ", " ")
    
    textme = textme.replace(" l' ", " ")
    textme = textme.replace(" del ", " ")
    textme = textme.replace(" dello ", " ")
    textme = textme.replace(" della ", " ")
    textme = textme.replace(" dell' ", " ")
    textme = textme.replace(" dei ", " ")
    textme = textme.replace(" degli ", " ")
    textme = textme.replace(" delle ", " ")
    
    textme = textme.replace(" al ", " ")
    textme = textme.replace(" allo ", " ")
    textme = textme.replace(" alla ", " ")
    textme = textme.replace(" all' ", " ")
    textme = textme.replace(" ai ", " ")
    textme = textme.replace(" agli ", " ")
    textme = textme.replace(" alle ", " ")
    
    textme = textme.replace(" dal ", " ")
    textme = textme.replace(" dallo ", " ")
    textme = textme.replace(" dalla ", " ")
    textme = textme.replace(" dall' ", " ")
    textme = textme.replace(" dai ", " ")
    textme = textme.replace(" dagli ", " ")
    textme = textme.replace(" dalle ", " ")
    
    textme = textme.replace(" nel ", " ")
    textme = textme.replace(" nello ", " ")
    textme = textme.replace(" nella ", " ")
    textme = textme.replace(" nell' ", " ")
    textme = textme.replace(" nei ", " ")
    textme = textme.replace(" negli ", " ")
    textme = textme.replace(" nelle ", " ")
    
    textme = textme.replace(" col ", " ")
    textme = textme.replace(" coi ", " ")
    textme = textme.replace(" sul ", " ")
    textme = textme.replace(" sullo ", " ")
    textme = textme.replace(" sulla ", " ")
    textme = textme.replace(" sull' ", " ")
    textme = textme.replace(" sui ", " ")
    textme = textme.replace(" sugli ", " ")
    textme = textme.replace(" sulle ", " ")
    textme = textme.replace(" pei ", " ")
    
    textme = textme.replace(" e ", " ")
    textme = textme.replace(" ma ", " ")
    textme = textme.replace(" come ", " ")
    textme = textme.replace(" pero ", " ")
    textme = textme.replace(" però ", " ")
    textme = textme.replace(" o ", " ")
    textme = textme.replace(" quindi ", " ")
    textme = textme.replace(" perchè ", " ")
    textme = textme.replace(" che ", " ")
    textme = textme.replace(" qualunque ", " ")
    textme = textme.replace(" qualcosa ", " ")
    textme = textme.replace(" prima ", " ")
    textme = textme.replace(" poi ", " ")
    textme = textme.replace(" subito ", " ")
    textme = textme.replace(" recentemente ", " ")
    textme = textme.replace(" puntualmente ", " ")
    textme = textme.replace(" spesso ", " ")
    textme = textme.replace(" spesso ", " ")
    textme = textme.replace(" adesso ", " ")
    textme = textme.replace(" mai ", " ")
    textme = textme.replace(" ultimamente ", " ")
    textme = textme.replace(" dopo ", " ")
    textme = textme.replace(" dopodiche ", " ")
    textme = textme.replace(" molto ", " ")
    textme = textme.replace(" sempre ", " ")
    textme = textme.replace(" annualmente ", " ")
    textme = textme.replace(" costantemente ", " ")
    textme = textme.replace(" giornalmente ", " ")
    textme = textme.replace(" mensilmente ", " ")
    textme = textme.replace(" occasionalmente ", " ")
    textme = textme.replace(" regolarmente ", " ")
    textme = textme.replace(" ripetutamente ", " ")
    textme = textme.replace(" volte ", " ")
    textme = textme.replace(" generalmente ", " ")
    textme = textme.replace(" inoltre ", " ")
    textme = textme.replace(" piu ", " ")
    textme = textme.replace(" più ", " ")
    textme = textme.replace(" ovviamente ", " ")
    textme = textme.replace(" forse ", " ")
    textme = textme.replace(" cioe ", " ")
    
    textme = textme.replace(" sopra ", " ")
    textme = textme.replace(" intorno ", " ")
    textme = textme.replace(" lontano ", " ")
    textme = textme.replace(" sotto ", " ")
    textme = textme.replace(" giu ", " ")
    textme = textme.replace(" ovunque ", " ")
    textme = textme.replace(" dovunque ", " ")
    textme = textme.replace(" qui ", " ")
    textme = textme.replace(" dentro ", " ")
    textme = textme.replace(" fuori ", " ")
    textme = textme.replace(" li ", " ")
    textme = textme.replace(" su ", " ")
    
    textme = textme.replace(" totalmente ", " ")
    textme = textme.replace(" tanto ", " ")
    textme = textme.replace(" quasi ", " ")
    
    textme = textme.replace(" forte ", " ")
    textme = textme.replace(" debole ", " ")
    
    textme = textme.replace(" altro ", " ")
    textme = textme.replace(" oggi ", " ")
    textme = textme.replace(" domani ", " ")
    textme = textme.replace(" ieri ", " ")
    
    textme = textme.replace(" direzione ", " ")
    textme = textme.replace(" coordinamento ", " ")
    textme = textme.replace(" Codice Fiscale ", " ")
    textme = textme.replace(" Partita ", " ")
    textme = textme.replace(" IMPORTO ", " ")
    textme = textme.replace(" pagare ", " ")
    textme = textme.replace(" emessa ", " ")
    
    return textme


conn = mysql.connector.connect(
  host="localhost",
  user="root",
  password="xW6hy6V1u9",
  database='ideologica'
)
connUPD = mysql.connector.connect(
  host="localhost",
  user="root",
  password="xW6hy6V1u9",
  database='ideologica'
)
cursor = conn.cursor()
cursorUPD = connUPD.cursor()

sql = "SELECT ID, FILENAME, CT_ID, CT_TABLE FROM aaadocuments WHERE FILENAME LIKE '%.pdf' AND (ARCHIVE <> 'ERR' OR ARCHIVE IS NULL)"
try:
    cursor.execute(sql)
except:
   print ("Error: unable to SQL data")
   
for row in cursor:
    ID = row[0]
    FILENAME = row[1]
    CT_ID = row[2]
    CT_TABLE = row[3]
    filepdf = FOLDER_PATH + "repository/" + FILENAME
    
    #FIND AND MOVE FROM TEMP
    print('PDF file' +filepdf)
    if (os.path.exists(filepdf) == False):
        filepdftemp = FOLDER_PATH + "temp/" + FILENAME
        if (os.path.exists(filepdftemp)):
            print('MV')
            os.rename(filepdftemp, filepdf)
            
    #LINKED TABLE UPDATE FLAG
    print('LINKED')
    if (os.path.exists(filepdf)):
        print('OK' + CT_TABLE )
        sql_stmt =   "UPDATE " + CT_TABLE + " SET SD = 1 WHERE ID = " + str(CT_ID)
        try:
            cursorUPD.execute(sql_stmt)
            connUPD.commit()
        except mysql.connector.Error as err:
            print("LINK Something went wrong: {}".format(err))
            
        sql_stmt =  "UPDATE aaadocuments SET ARCHIVE = 'OK', FILEEXT = 'pdf' WHERE ID = " + str(CT_ID)
        try:
            cursorUPD.execute(sql_stmt)
            connUPD.commit()
        except mysql.connector.Error as err:
            print("DOC Something went wrong: {}".format(err))
    else:
        print('KO')
        sql_stmt =   "UPDATE " + CT_TABLE + " SET SD = 0 WHERE ID = " + str(CT_ID)
        try:
            cursorUPD.execute(sql_stmt)
            connUPD.commit()
        except mysql.connector.Error as err:
            print("LINK Something went wrong: {}".format(err))
        
        sql_stmt =  "UPDATE aaadocuments SET ARCHIVE = 'ERR', FILEEXT = 'pdf' WHERE ID = " + str(CT_ID)
        try:
            cursorUPD.execute(sql_stmt)
            connUPD.commit()
        except mysql.connector.Error as err:
            print("DOC Something went wrong: {}".format(err))
        
        
    #INNER SEARCH
    print('INNERSEARCH')
    if (os.path.exists(filepdf)):
        try:
            pdf = pdfplumber.open(filepdf)
        except: 
            print(f'Error. not PDF')
            first_page = "";
            continue
            
        page = pdf.pages[0]
        first_page = page.extract_text()
        if not first_page is None:
            first_page = getWords(first_page)
            sql_stmt =   "UPDATE aaadocuments SET FILECONTENT = %s, FILEEXT = 'pdf' WHERE ID = %s "
            sql_data = (first_page, ID)
            try:
                cursorUPD.execute(sql_stmt, sql_data)
                connUPD.commit()
            except mysql.connector.Error as err:
                print("Something went wrong: {}".format(err))
        else:
            #OCR ...
            sql_data = ''
    else:
       print ("Error: unable READ ID:" + str(ID) + "FILE:" + FILENAME )
    
    
    print('-----------------------------')
    
# Closing the connection
conn.close()
connUPD.close()

class Vocabulary:
    PAD_token = 0   # Used for padding short sentences
    SOS_token = 1   # Start-of-sentence token
    EOS_token = 2   # End-of-sentence token

    def __init__(self, name):
        self.name = name
        self.word2index = {}
        self.word2count = {}
        self.index2word = {PAD_token: "PAD", SOS_token: "SOS", EOS_token: "EOS"}
        self.num_words = 3
        self.num_sentences = 0
        self.longest_sentence = 0

    def add_word(self, word):
        if word not in self.word2index:
            # First entry of word into vocabulary
            self.word2index[word] = self.num_words
            self.word2count[word] = 1
            self.index2word[self.num_words] = word
            self.num_words += 1
        else:
            # Word exists; increase word count
            self.word2count[word] += 1
            
    def add_sentence(self, sentence):
        sentence_len = 0
        for word in sentence.split(' '):
            sentence_len += 1
            self.add_word(word)
        if sentence_len > self.longest_sentence:
            # This is the longest sentence
            self.longest_sentence = sentence_len
        # Count the number of sentences
        self.num_sentences += 1

    def to_word(self, index):
        return self.index2word[index]

    def to_index(self, word):
        return self.word2index[word]