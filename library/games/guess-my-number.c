/*
 * title: Guess my number, higher or lower
 * level: 1
 * about: The computer picks a number from 1 to 100 with a fixed seed and answers each guess with higher or lower until you find it.
 * input: 50\n75\n62\n68\n65\n
 */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int secret, guess, tries = 0;

    /* srand fixes the starting point of rand's sequence, so the secret is
       the same every run. A real game would use srand(time(NULL)). */
    srand(7);
    /* rand() % 100 is 0..99; adding 1 gives 1..100. */
    secret = rand() % 100 + 1;

    printf("I am thinking of a number from 1 to 100.\n");
    for (;;) {
        printf("Your guess: ");
        /* scanf returns 1 when it read a number. If the input runs out
           (or is not a number), stop instead of looping forever. */
        if (scanf("%d", &guess) != 1) {
            printf("\nGiving up? It was %d.\n", secret);
            break;
        }
        printf("%d\n", guess);      /* echo, since canned input is invisible */
        tries++;
        if (guess < secret) {
            printf("Higher!\n");
        } else if (guess > secret) {
            printf("Lower!\n");
        } else {
            printf("Got it in %d tries.\n", tries);
            /* Halving the range each time needs at most 7 guesses for
               100 numbers, because 2 to the 7th is 128. */
            if (tries <= 7)
                printf("That is as good as binary search.\n");
            break;
        }
    }
    return 0;
}
