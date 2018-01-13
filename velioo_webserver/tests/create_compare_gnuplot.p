set terminal png size 1280,720
set output "Async_Server_with_without_python_magic.png"
set title "Async Server with and without python-magic library. Concurrency level: 100"
set size 1,1
set grid y
set xlabel 'Request'
set ylabel 'Response Time (ms)'
plot "ab_test_application_async12.p" using 9 smooth sbezier with lines title "With:", "ab_test_application_async20.p" using 9 smooth sbezier with lines title "Without:"
