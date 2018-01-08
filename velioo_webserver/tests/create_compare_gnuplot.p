set terminal png size 1280,720
set output "benchmark.png"
set title "Benchmark for blog.secaserver.com"
set size 1,1
set grid y
set xlabel 'Request'
set ylabel 'Response Time (ms)'
plot "ab_test_application_async7.p" using 9 smooth sbezier with lines title "Async Server:", "ab_test_application9.p" using 9 smooth sbezier with lines title "Sync server:"
