#include <stdio.h>
#include "stack.h"
int main(void)
{
    push(1); push(2); push(3);
    printf("%d %d\n", pop(), depth());
    printf("%d\n", calls);
    return 0;
}
