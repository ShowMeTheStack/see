#include <stdio.h>
struct node { int v; struct node *next; };
int main(void)
{
    struct node *p = NULL;
    printf("before\n");
    printf("%d\n", p->v);
    return 0;
}
/* FAULT: NULL pointer dereference */
/* OUTPUT
before
*/
