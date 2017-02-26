
import sys

f = open('input.txt', "r")
newfile = open('output.txt', "w")

for line in f:
	newcontent ='' # where I start storing url
	#stores count for .com letter
	countMatches = 0
	for letter in line:
		if countMatches == 4:
			if letter == '/':
				break
			if letter != '-':
				newcontent += letter
		elif letter == 'c':
			countMatches+=1
		elif letter == 'o' and countMatches == 1:
			countMatches+=1
		elif letter == 'm' and countMatches == 2:
			countMatches+=1
		elif letter == '/' and countMatches == 3:
			countMatches+=1
		else:
			countMatches = 0

	if newcontent == '':
		newcontent = line
	sys.stdout.write('http://www.'+newcontent+'.com\n')
	#print newcontent
	newfile.write('http://www.'+newcontent+'.com\n')


f.close()
newfile.close()
