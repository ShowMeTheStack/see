/*
 * title: Guess the number
 * level: 2
 * about: A guessing game with a do-while loop that keeps asking until the secret number is found.
 * input: 50 75 62 68 65
 */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int secret;
    int guess;
    int tries = 0;

    /* A fixed seed makes rand() give the same sequence every run, so the
       canned guesses below always reach the secret. */
    srand(7);
    secret = rand() % 100 + 1;  /* 1 to 100 */

    printf("I am thinking of a number from 1 to 100.\n");

    /* The body must run at least once: there is no guess to test before
       the first one is read. That is exactly what do-while is for. */
    do {
        if (scanf("%d", &guess) != 1) {
            printf("Out of guesses. It was %d.\n", secret);
            return 0;
        }
        tries++;
        if (guess < secret)
            printf("%d is too low\n", guess);
        else if (guess > secret)
            printf("%d is too high\n", guess);
    } while (guess != secret);

    printf("%d is right! Found in %d tries.\n", guess, tries);
    return 0;
}
