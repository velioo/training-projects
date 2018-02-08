set terminal png size 1280,720
set output "Fork_Server.png"
set title "Fork server. File size = 136 bytes. Requests = 100000"
set size 1,1
set grid y
set xlabel 'Request'
set ylabel 'Response Time (ms)'
plot "ab_test_application_1.p" using 9 smooth sbezier with lines title "Concurrency level: 100" 
