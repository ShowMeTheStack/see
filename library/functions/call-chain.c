/*
 * title: Watching frames stack up
 * level: 1
 * about: Calls a chain of four functions to make breakfast, so four stack frames are alive at once.
 */
#include <stdio.h>

/* Each function below calls the next one. While toast() is running,
   frames for main, breakfast, kitchen and toast all sit on the stack,
   newest on top. Step into each call with F11 and watch the pile grow;
   step out with Shift+F11 and watch it shrink again. */

int toast(int slices)
{
    int minutes = 2 * slices;

    printf("      toast: %d slices take %d minutes\n", slices, minutes);
    return minutes;
}

int eggs(int count)
{
    int minutes = 4 + count;

    printf("      eggs: %d eggs take %d minutes\n", count, minutes);
    return minutes;
}

int kitchen(int people)
{
    int t1, t2;

    printf("    kitchen: cooking for %d\n", people);
    t1 = toast(people * 2);   /* frame for toast lands on top of kitchen */
    t2 = eggs(people);        /* toast's frame is gone; eggs reuses that space */
    printf("    kitchen: done\n");
    return t1 > t2 ? t1 : t2; /* the pans run at the same time */
}

int breakfast(int people)
{
    int wait;

    printf("  breakfast: starting\n");
    wait = kitchen(people);
    printf("  breakfast: ready after %d minutes\n", wait);
    return wait;
}

int main(void)
{
    int total;

    printf("main: hungry\n");
    total = breakfast(3);
    printf("main: ate after %d minutes\n", total);
    return 0;
}
