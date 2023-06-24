#!/usr/local/bin/python

import numpy as np
import re
import sys
import os.path

if len(sys.argv) != 2:
    print ("Syntax Index-Validation.py <index-file>")
    sys.exit(0);

basepath=os.path.dirname(__file__)

myInFile= basepath + "\myIndex.txt";

tmplogfile=basepath + "\\assets\\Index-Validation.log"
if os.path.exists(tmplogfile):
    os.remove(tmplogfile)

inFileText = sys.argv[1];

infile = open(myInFile, "w", encoding='utf-8');
infile.write(inFileText);

infile.close()

# Pre-process the file
myIdx = open(myInFile, encoding="utf8", errors='ignore');
#encoding="utf8"

#Expand elided page ranges
myIdxTxt = myIdx.read();
myFindings = '\n'
myImproperRanges = ''
counter = 1
newIdxTxt = ''
newIdxTxtTemp = ''
start = 0
pattern = '(\d+)[–|-](\d+)'
RmPattern = '([xivlcdm]+)[–|-]([xivlcdm]+)'

for match in re.finditer(pattern, myIdxTxt):
    end, newstart = match.span()
    newIdxTxt += myIdxTxt[start:end]
    if len(match[1]) > len(match[2]):
        expandedNumber = match[1][0:len(match[1]) - len(match[2])] + match[2]
        rep = match[1] + ', ' + expandedNumber
        #rep = m.group(1).upper() + str(counter)
        if int(match[1]) > int(expandedNumber): myImproperRanges += match.group() + "\t"
    else:
        rep = match[1] + ', ' + match[2]
        if int(match[1]) > int(match[2]): myImproperRanges += match.group() + "\t"
        
    newIdxTxt += rep
    start = newstart
    counter += 1

newIdxTxt += myIdxTxt[start:]

start = 0
for match in re.finditer(RmPattern, newIdxTxt):
    end, newstart = match.span()
    newIdxTxtTemp += newIdxTxt[start:end]
    rep = match[1] + ', ' + match[2]
    #if int(match[1]) > int(match[2]): myImproperRanges += match.group() + "\t"
        
    newIdxTxtTemp += rep
    start = newstart
    counter += 1

newIdxTxtTemp += newIdxTxt[start:]
#print(newIdxTxtTemp)

tempFile= basepath + "\myIndex-Temp.txt";

myTempIdx = open(tempFile, "w", encoding='utf-8');
myTempIdx.write(newIdxTxtTemp);

myTempIdx.close()

######## Roman numbers treatment starts #########

RmA = RmEnA = []
rom_val = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}  # mapping of Roman numeral symbols to their decimal values

######## Convert Roman numbers to Integers #########

def is_valid_roman_numeral(num):
    pattern = re.compile(r"""   
                                ^M{0,3}
                                (CM|CD|D?C{0,3})?
                                (XC|XL|L?X{0,3})?
                                (IX|IV|V?I{0,3})?$
            """, re.VERBOSE)
    if re.match(pattern, num.strip().upper()):
        return True
    return False

def roman_to_int(myRomanS):
    s = myRomanS.strip().upper()
    int_val = 0
    for i in range(len(s)):
        if i > 0 and rom_val[s[i]] > rom_val[s[i - 1]]:
            int_val += rom_val[s[i]] - 2 * rom_val[s[i - 1]]
        else:
            int_val += rom_val[s[i]]
    return int_val
    
def arabic_to_roman(num):
    roman_map = {1: 'I', 4: 'IV', 5: 'V', 9: 'IX', 10: 'X', 40: 'XL',
                 50: 'L', 90: 'XC', 100: 'C', 400: 'CD', 500: 'D', 900: 'CM', 1000: 'M'}
    roman_numeral = ''
    for value, numeral in sorted(roman_map.items(), reverse=True):
        while num >= value:
            roman_numeral += numeral
            num -= value
    return roman_numeral

######## Roman numbers treatment ends #########

######## Part B #########
# Find order of pages in each line and max of all pages

myTempIdx = tmpfo=open(tempFile, encoding='utf-8')
myIdxEns = myTempIdx.readlines()

# Close and remove remporary file
tmpfo.close()
#os.remove(tempFile)

ArA = np.array([[]], dtype='i2', ndmin=2)
#y = []
ArReg = "^ (\d+).*"
RmReg = "^ ([xivlcdm]+).*"
SaReg = '[Ss]ee (also)?'
myIdxTxtFiltered = re.sub("[()\"“”]","",newIdxTxt)

for idxEn in myIdxEns:
    RmNs = re.findall(RmReg, idxEn)
    SaTx = re.search(SaReg, idxEn)
    if SaTx != None:
        SaBA = re.split(SaTx.group(), idxEn)
        mySeeEnt = re.sub("[()\"“”]","",SaBA[1].strip())
        SaR = re.findall(mySeeEnt, myIdxTxtFiltered, re.IGNORECASE)
        if len(SaR) > 1:
            pass
        else:
            myFindings += "Warning: " + SaTx.group().strip() + " reference not found for \"" + idxEn.strip() +"\"\n" #mySeeEnt

    idxSubEntries = idxEn.split(";")
    for idxSubEn in idxSubEntries:
        idxEnTokens = idxSubEn.split(",")
        ArNs = []
        ArNsArray = []
        RmNsArray = []
        for idxEnTkn in idxEnTokens:
            ArNsArray = np.array(re.findall(ArReg,idxEnTkn), dtype='i2')
            RmNs = re.findall(RmReg, idxEnTkn)
            if len(ArNsArray):
                ArNs = np.append(ArNs, ArNsArray)
            elif len(RmNs):
                if is_valid_roman_numeral(idxEnTkn):
                    RmNsArray.append(roman_to_int(idxEnTkn.strip()))
                    RmA.append(roman_to_int(idxEnTkn.strip()))
                    #print(idxEn + " : " + idxEnTkn)
                else:
                    myFindings += f"Error: invalid roman number: \"{idxEnTkn.strip()}\" in {idxEn.strip()}\n"

        if np.all(np.diff(RmNsArray) >= 0):
            pass
        else:
            myFindings += f"Error: Roman pages out of order in: {idxEn.strip()}\n"

        ArA = np.append(ArA, ArNs)
        if np.all(np.diff(ArNs) >= 0):
            #myFindings += "No Error in: \n" + idxEn + str(ArNs) + '\n' + '\n'
            continue
        else:
            myFindings += f"Error: Arabic pages out of order in: {idxSubEn.strip()}\n"

if len(myImproperRanges) > 0:
    myFindings += "Error: List of improper ranges: \n" + myImproperRanges + "\n\n"

if len(RmA) > 0:
    myFindings += "Info: Prelims roman pages indexed from " + arabic_to_roman(min(RmA)) + ":" + str(min(RmA)) + " to " + arabic_to_roman(max(RmA)) + ":" + str(max(RmA)) + "\n"

myFindings += "Info: Max body text page indexed is " + str(round(np.amax(ArA))) + "\n"

f = open(tmplogfile, "w", encoding='utf-8')
f.write(myFindings)
f.close()

print ("~~~~~~~~~ INDEX VALIDATOR LOG ~~~~~~~~~")
print (myFindings)
print("Please verify the error and warnings from LOG file: " + tmplogfile + "\n")
#val = input("Press enter key to exit...")

######## Part B Ends #########
