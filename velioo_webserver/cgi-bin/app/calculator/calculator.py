#!/usr/bin/python3.6

import sys
import operator
import cgi, cgitb
cgitb.enable(display=0, logdir="logs")

def main():
    print("Content-Type: text/plain\r\n")
    
    form = cgi.FieldStorage()

    ops = { "+": operator.add, "-": operator.sub, "*": operator.mul, "/": operator.truediv, "//": operator.floordiv }
        
    first_num = form.getvalue('first_num')
    second_num = form.getvalue('second_num')
    op = form.getvalue('operator')
    print(first_num)
    print(op)
    print(second_num)
    
    if op not in ops:
        print("Operation not supported")
        return
        
    try:
        result = ops[op](float(first_num), float(second_num))
        print("Result is " + str(result))
    except ZeroDivisionError as e:
        print("Division by zero !!!")
    except Exception as e:
        print("A problem occured while processing your request")

if __name__ == '__main__':
    main()
