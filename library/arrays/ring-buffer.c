/*
 * title: A ring buffer of recent readings
 * level: 3
 * about: Stores the last five sensor readings in a fixed array whose write position wraps around, and averages whatever it holds.
 */
#include <stdio.h>

#define CAP 5

int main(void)
{
    int ring[CAP];
    int next = 0;    /* where the next reading goes */
    int count = 0;   /* how many slots hold real data (at most CAP) */
    int readings[12] = { 20, 22, 21, 25, 30, 28, 27, 35, 40, 38, 36, 33 };
    int i, k, oldest;
    long sum;

    for (i = 0; i < 12; i++) {
        ring[next] = readings[i];
        /* The % makes the index wrap from 4 back to 0, so the newest
           reading overwrites the oldest. No shifting is ever needed.
           Watch 'next' cycle 0,1,2,3,4,0,1... in the locals panel. */
        next = (next + 1) % CAP;
        if (count < CAP)
            count++;

        /* The oldest reading sits 'count' places behind next. Adding CAP
           before the % keeps the result from going negative. */
        oldest = (next - count + CAP) % CAP;
        sum = 0;
        printf("after %2d: [", readings[i]);
        for (k = 0; k < count; k++) {
            int v = ring[(oldest + k) % CAP];
            printf(k ? " %d" : "%d", v);
            sum += v;
        }
        printf("]  average %.1f\n", (double)sum / count);
    }
    /* Slots are only read once written, since k < count. Reading all CAP
       slots early on would be an uninitialised read, and See would say so. */
    return 0;
}
