/*
 * title: Tail recursion and the loop inside it
 * level: 3
 * about: Writes sum, gcd and digit count three ways, plain recursive, tail recursive with an accumulator, and as a loop, and compares the stack depth each needs.
 */
#include <stdio.h>

int depth, deepest;

#define ENTER() (deepest = ++depth > deepest ? depth : deepest)
#define LEAVE() (depth--)

/* Plain recursion: the addition happens AFTER the inner call returns,
   so every frame must stay alive to finish its own "n +". */
long sum_plain(int n)
{
    long r;

    ENTER();
    r = n == 0 ? 0 : n + sum_plain(n - 1);
    LEAVE();
    return r;
}

/* Tail recursion: the work is done BEFORE the call, carried along in
   acc, and the call's answer is returned untouched. Nothing is left to
   do in this frame once the call is made. Many compilers reuse the
   frame for such calls; See does not, so watch the stack still grow. */
long sum_tail(int n, long acc)
{
    long r;

    ENTER();
    r = n == 0 ? acc : sum_tail(n - 1, acc + n);
    LEAVE();
    return r;
}

/* A tail call is a disguised jump back to the top with new arguments.
   Writing that jump as a loop gives this, which needs one frame. */
long sum_loop(int n)
{
    long acc = 0;

    while (n != 0) {
        acc += n;      /* the same two updates as the tail call made */
        n -= 1;
    }
    return acc;
}

/* Euclid is naturally tail recursive ... */
int gcd_tail(int a, int b)
{
    int r;

    ENTER();
    r = b == 0 ? a : gcd_tail(b, a % b);
    LEAVE();
    return r;
}

/* ... and turns into a loop the same mechanical way. */
int gcd_loop(int a, int b)
{
    int t;

    while (b != 0) {
        t = a % b;
        a = b;
        b = t;
    }
    return a;
}

int main(void)
{
    long r;
    int g;

    depth = deepest = 0;
    r = sum_plain(200);
    printf("sum_plain(200)  = %ld, deepest stack %d frames\n", r, deepest);

    depth = deepest = 0;
    r = sum_tail(200, 0);
    printf("sum_tail(200)   = %ld, deepest stack %d frames\n", r, deepest);

    r = sum_loop(200);
    printf("sum_loop(200)   = %ld, one frame\n", r);

    depth = deepest = 0;
    g = gcd_tail(832040, 514229);   /* consecutive Fibonacci: worst case */
    printf("gcd_tail        = %d, deepest stack %d frames\n", g, deepest);
    printf("gcd_loop        = %d\n", gcd_loop(832040, 514229));

    /* Try it in See: put a breakpoint on the base case of sum_tail and
       look at the 201 frames. Each has its own n and acc, but none of
       them has any work left to do. */
    return 0;
}
