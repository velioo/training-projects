import sys

a = 2**9999
print("2**9999 = ", type(a), a)
a = -2**9999
print("-2**9999 = ", type(a), a)
a = int((0.1 + 0.7) * 10)
print("int((0.1 + 0.7) * 10) = ", a)
a = float('inf')
print("float('inf') = ", type(a), a)
a = 1 / a
print("1 / inf = ", a)
a = 1 + float('inf')
print("1 + inf = ", a)
#a = 1 / 0
a = float('nan') + 1
print("'nan' + 1 = ", type(a), a)
a = float('inf') / float('inf')
print("inf / inf = ", type(a), a)
a = 1 + 2.0
print("1 + 2.0 = ", type(a), a)
#a = '2' + 1
print("'2' + 1 = error")
a = int('2') + 1
print("int('2') + 1 = ", a)
a = int('1' + '2')
print("int('1' + '2') = ", a)
#a = int('2a') + 1
print("int('2a') + 1 = error")
a = int(float('1.0') + float('1.0'))
print("int(float('1.0') + float('1.0')) = ", a)
a = 0b101
print("Binary 0b101 = ", a)
a = 0o5
print("Octal 0o5 = ", a)
a = 0x5
print("Hexadecimal 0x5 = ", a)
print("----------Strings----------")
a = "1";
print("Before test(a): a = {}".format(a))
def test(a):
	print("Before assignment: a = {}".format(a))
	a = "2";
	print("After assignment: a = {}".format(a))
	
test(a)
print("After test(a): a = {}".format(a))
b = a;
print ("a = b = {}".format(b))
a = "3"
print("Changed: a = {}".format(a))
print("b = " + b)
print ("中文 español deutsch English हिन्दी العربية português বাংলা русский 日本語 ਪੰਜਾਬੀ 한국어 தமிழ் עברית");
print ("\u5c07\u63a2\u8a0e HTML5 \u53ca\u5176\u4ed6🐄");
print("{hello}, {there}".format(hello="Hello", there="there"))
print("{1}, {0}".format("there", "Hello"))

