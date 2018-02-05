set terminal png size 1280,720
set output "Async_Server_with_keep_alive.png"
set title "Asynchronous Server benchmark with keep-alive feature. File size = 136 bytes. Requests = 100000"
set size 1,1
set grid y
set xlabel 'Request'
set ylabel 'Response Time (ms)'
plot "ab_test_application_async38.p" using 9 smooth sbezier with lines title "Concurrency level: 50", "ab_test_application_async36.p" using 9 smooth sbezier with lines title "Concurrency level: 100", "ab_test_application_async37.p" using 9 smooth sbezier with lines title "Concurrency level: 150"
