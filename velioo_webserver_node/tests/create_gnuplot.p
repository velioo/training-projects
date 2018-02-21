set terminal png size 1280,720
set output "Without_logger.png"
set title "Node.js webserver without logger. File size = 1000 bytes. Requests = 100000. Concurency level: 100"
set size 1,1
set grid y
set xlabel 'Request'
set ylabel 'Response Time (ms)'
plot "ab_test_application_14.p" using 9 smooth sbezier with lines title "Benchmark 1", "ab_test_application_15.p" using 9 smooth sbezier with lines title "Benchmark 2", "ab_test_application_16.p" using 9 smooth sbezier with lines title "Benchmark 3"
