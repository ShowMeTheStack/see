/* rng.c - a linear congruential generator.
   state and calls are "static" at file level: they keep their values
   for the whole run, but no other .c file can name them. Only the three
   functions below can reach them. That is how C hides data. */
#include "rng.h"

static unsigned long state = 1;
static long calls = 0;

void rng_seed(unsigned long seed)
{
    state = seed;
    calls = 0;
}

/* Private helper: not in rng.h, and static, so main.c cannot call it. */
static unsigned long step(void)
{
    /* The constants are the classic ones from the C standard's example
       rand(). unsigned arithmetic wraps around safely at 2^32. */
    state = state * 1103515245UL + 12345UL;
    calls++;
    return (state / 65536UL) % 32768UL;
}

int rng_range(int lo, int hi)
{
    return lo + (int)(step() % (unsigned long)(hi - lo + 1));
}

long rng_calls(void)
{
    return calls;
}
