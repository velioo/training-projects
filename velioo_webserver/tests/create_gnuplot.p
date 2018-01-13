set terminal png size 1280,720
set output "Async_Server_without_python_magic_comparison.png"
set title "Asynchronous Server benchmark withot python-magic library. File size = 136 bytes. Requests = 100000"
set size 1,1
set grid y
set xlabel 'Request'
set ylabel 'Response Time (ms)'
plot "ab_test_application_async19.p" using 9 smooth sbezier with lines title "Benchmark 1", "ab_test_application_async20.p" using 9 smooth sbezier with lines title "Benchmark 2", "ab_test_application_async21.p" using 9 smooth sbezier with lines title "Benchmark 3"
