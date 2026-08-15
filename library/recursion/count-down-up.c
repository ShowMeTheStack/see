/*
 * title: Counting down and back up
 * level: 1
 * about: Shows that code before a recursive call runs on the way down and code after it runs on the way back up.
 */
#include <stdio.h>

/* One function, one recursive call, two printfs. The printf before the
   call happens as each new frame is created; the one after it waits
   until the deeper call has completely finished. So the numbers go
   down and then come back up in reverse order. */
void countdown(int n)
{
    if (n == 0) {
        printf("liftoff!\n");
        return;
    }
    printf("going down: %d\n", n);
    countdown(n - 1);
    /* When execution reaches here, the frame for n - 1 is already gone.
       This frame's own n is still exactly what it was. */
    printf("coming up:  %d\n", n);
}

/* Moving the print changes everything: printing only after the call
   gives the numbers in increasing order. */
void count_up_to(int n)
{
    if (n == 0)
        return;
    count_up_to(n - 1);
    printf("%d ", n);
}

/* A recursive sum. Each frame adds its own n to what the deeper
   frames worked out. */
int sum_to(int n)
{
    if (n == 0)
        return 0;
    return n + sum_to(n - 1);
}

int main(void)
{
    /* Press F11 repeatedly and watch the stack view: a new countdown
       frame appears for each call, each holding a different n. */
    countdown(4);

    printf("\ncounting up: ");
    count_up_to(10);
    printf("\n");

    printf("1 + 2 + ... + 10 = %d\n", sum_to(10));
    return 0;
}
