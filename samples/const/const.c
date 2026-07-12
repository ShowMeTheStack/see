/* const.c: what each const locks.
   Read every declaration from the name outwards.
   Take the comment marks off one of the "error" lines and build (Ctrl+B) to see the message. */
#include <stdio.h>

const int limit = 10;              /* a const global: it lives in read-only data */

int main(void)
{
    int n = 1, m = 2;
    const int *p = &n;             /* pointer to const int: *p is locked */
    int *const q = &n;             /* const pointer to int: q is locked */
    const int *const r = &n;       /* both */

    p = &m;                        /* allowed */
    /* *p = 5;                        error: assignment of read-only location '*p' */
    *q = 5;                        /* allowed: n becomes 5 */
    /* q = &m;                        error: assignment of read-only variable 'q' */
    /* limit = 20;                    error: assignment of read-only variable 'limit' */

    printf("n=%d m=%d *p=%d *q=%d *r=%d limit=%d\n", n, m, *p, *q, *r, limit);
    return 0;
}
