#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
void bye(void) { printf("bye\n"); }
void later(void) { printf("later\n"); }
void onint(int s) { printf("caught %d\n", s); }
int main(void)
{
    atexit(bye);
    atexit(later);
    signal(SIGINT, onint);
    raise(SIGINT);
    printf("main ends\n");
    exit(3);
}
/* EXIT: 3 */
/* OUTPUT
caught 2
main ends
later
bye
*/
