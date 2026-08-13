/* rng.h - the public face of a tiny random number module.
   Anything not declared here is private to rng.c. */
#ifndef RNG_H
#define RNG_H

void rng_seed(unsigned long seed);
int  rng_range(int lo, int hi);   /* a whole number in [lo, hi] */
long rng_calls(void);             /* how many numbers were drawn */

#endif
