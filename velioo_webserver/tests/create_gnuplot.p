set terminal png size 1920,1080
set output "Async_Server_STATIC_FILE_requests_comparison.png"
set title "Asynchronous Server static file requests benchmark. File size = 136 bytes. Requests = 100000"
set size 1,1
set grid y
set xlabel 'Request'
set ylabel 'Response Time (ms)'
plot "ab_test_application_async8.p" using 9 smooth sbezier with lines title "Concurrency Level: 10", "ab_test_application_async9.p" using 9 smooth sbezier with lines title "Concurrency Level: 30", "ab_test_application_async10.p" using 9 smooth sbezier with lines title "Concurrency Level: 50", "ab_test_application_async11.p" using 9 smooth sbezier with lines title "Concurrency Level: 70", "ab_test_application_async12.p" using 9 smooth sbezier with lines title "Concurreny Level: 100", "ab_test_application_async13.p" using 9 smooth sbezier with lines title "Concurreny Level: 120", "ab_test_application_async14.p" using 9 smooth sbezier with lines title "Concurreny Level: 150", "ab_test_application_async15.p" using 9 smooth sbezier with lines title "Concurreny Level: 200", "ab_test_application_async16.p" using 9 smooth sbezier with lines title "Concurreny Level: 300", "ab_test_application_async17.p" using 9 smooth sbezier with lines title "Concurreny Level: 500"
