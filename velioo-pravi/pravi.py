import os
import sys
import re

MAX_NUM_VALUE = 100000

def convert_to_int(args):
    int_args = []
    
    for arg in args:
        int_arg = int(arg)

        if (int_arg >= MAX_NUM_VALUE or int_arg <= 0):
            raise ValueError()

        int_args.append(int_arg)
        
    return int_args

def do_add(s, x):
    return len(s) != (s.add(x) or len(s))   

def calc_distance(point_pairs, c):

    checked_pairs = []
    distance = 0
    
    for (a, b) in point_pairs:
        if not len(checked_pairs):
            distance = c
            checked_pairs.append((a, b))
        else:
            bad_distance = 0
            for (x, y) in checked_pairs:
                if(a >= x and a < y):
 
                    bad_distance += y - a
                    temp_a = y
                else:
                    temp_a = a
                    
                if (b <= y and b > x):
                    bad_distance += b - x
                    temp_b = x
                else:
                    temp_b = b
            
            distance += c - bad_distance
            checked_pairs.append((temp_a, temp_b))
        
        # print("Checked pairs: ", checked_pairs)
        # print("Red Distance: ", distance)
        
    return distance
    
def start(): 
    input_args = input("Enter n a b c:\n")
    input_args = re.split(r'\s+', input_args)

    if len(input_args) != 4:
        print("Wrong number of arguments, must be 4")
        return

    try:
        input_args = convert_to_int(input_args)
    except ValueError as err:
        print("Invalid args, all args must be integers < 100000 {}".format(str(err)))
        return

    n = input_args[0]
    a = input_args[1]
    b = input_args[2]
    c = input_args[3]
    
    point_pairs = set()
    
    left_points = []
    right_points = []
    
    for step in range(0, n + 1, a):
        left_points.append(step)
      
    
    for step in range(n, -1, -b):
        right_points.append(step)
        
    
    # print("Left points: ", left_points)
    # print("Right points: ", right_points)
    
    for l_point in left_points:
        for r_point in right_points:
            if abs(l_point - r_point) == c:
                if l_point <= r_point:
                    do_add(point_pairs, (l_point, r_point))
                else:
                    do_add(point_pairs, (r_point, l_point))
       
    distance = calc_distance(point_pairs, c)
    
    # print("Point pairs: ", point_pairs)
    # print("Blank Distance: ", n - distance)
    # print("Point pairs: ", point_pairs)
    print(n - distance)
    
    f = open('graphic.html','w')
    
    coef = 1000 / n
    move_dist = coef * c
    
    html_content = """
<html>
    <head></head>
    <body>
<canvas id="myCanvas" width="1000" height="500" style="border:1px solid #d3d3d3;">
</canvas>
<script>
var c=document.getElementById("myCanvas");
var ctx=c.getContext("2d");
ctx.lineWidth=5;
ctx.beginPath();
ctx.strokeStyle="#000000";
ctx.moveTo(0,200);
ctx.lineTo(1000,200);
ctx.stroke();
ctx.beginPath();
ctx.strokeStyle="#FF0000";
ctx.moveTo(0,200);
"""

    for (a, b) in point_pairs:
        html_content += "ctx.moveTo(" + str(coef * a) + ", 200);"
        html_content += "ctx.lineTo(" + str((coef * a) + move_dist) + ", 200);"

    html_content += """ctx.stroke();
</script>
    </body>
    </html>
"""

    f.write(html_content)
    f.close()
   
if __name__ == "__main__":
    start()
