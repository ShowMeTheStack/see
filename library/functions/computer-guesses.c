/*
 * title: The computer guesses your number
 * level: 2
 * about: You think of a number from 1 to 100 and answer higher, lower or yes; the computer halves the range each time with a few small functions.
 * input: l\nh\nh\nl\nh\nh\ny\n
 */
#include <stdio.h>

/* You are thinking of 42 in the canned input. Each answer is one of
   h (my number is higher), l (lower) or y (yes, that's it). */

/* Middle of the range that is still possible. */
int pick(int lo, int hi)
{
    return lo + (hi - lo) / 2;
}

/* Reads the next answer, skipping spaces and newlines. */
char ask(int guess)
{
    char c;

    printf("is it %d? ", guess);
    if (scanf(" %c", &c) != 1)
        return '?';
    printf("%c\n", c);
    return c;
}

/* Narrows the range through pointers to the caller's lo and hi.
   Returns 0 if the answers contradict each other. */
int narrow(int *lo, int *hi, int guess, char answer)
{
    if (answer == 'h')
        *lo = guess + 1;
    else if (answer == 'l')
        *hi = guess - 1;
    return *lo <= *hi;
}

int main(void)
{
    int lo = 1, hi = 100, guess, tries = 0;
    char answer;

    printf("think of a number from 1 to 100\n");
    for (;;) {
        guess = pick(lo, hi);
        tries++;
        answer = ask(guess);
        if (answer == 'y') {
            printf("got it in %d tries\n", tries);
            break;
        }
        if (answer != 'h' && answer != 'l') {
            printf("no more answers, giving up\n");
            break;
        }
        /* lo and hi live in main; narrow changes them from its own
           frame. Watch the range shrink: about half each time, so no
           more than 7 guesses are ever needed for 100 numbers. */
        if (!narrow(&lo, &hi, guess, answer)) {
            printf("those answers do not fit any number!\n");
            break;
        }
        printf("  (now between %d and %d)\n", lo, hi);
    }
    return 0;
}
