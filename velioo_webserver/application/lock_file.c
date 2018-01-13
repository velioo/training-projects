#include <fcntl.h>
#include <stdio.h>
#include <unistd.h>

int main(int argc, char **argv) {

struct flock fl;
int fd;

fl.l_type   = F_WRLCK;  /* read/write lock */
fl.l_whence = SEEK_SET; /* beginning of file */
fl.l_start  = 0;        /* offset from l_whence */
fl.l_len    = 0;        /* length, 0 = to EOF */
fl.l_pid    = getpid(); /* PID */

fd = open(argv[1], O_RDWR | O_EXCL); /* not 100% sure if O_EXCL needed */

fcntl(fd, F_SETLKW, &fl); /* set lock */

sleep(10000000);

printf("\n release lock \n");

fl.l_type   = F_UNLCK;
fcntl(fd, F_SETLK, &fl); /* unset lock */

}
