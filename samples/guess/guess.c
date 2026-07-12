/* guess.c: guess the number. It reads your guesses from the terminal:
   type a number and press Enter when the program waits. */
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main(void)
{
    int secret, guess, tries = 0;

    srand((unsigned)time(NULL));
    secret = rand() % 100 + 1;
    printf("I am thinking of a number from 1 to 100.\n");
    for (;;) {
        printf("your guess: ");
        fflush(stdout);              /* show the prompt before waiting for input */
        if (scanf("%d", &guess) != 1)
            break;
        tries++;
        if (guess < secret)
            printf("higher\n");
        else if (guess > secret)
            printf("lower\n");
        else {
            printf("yes! %d tries\n", tries);
            break;
        }
    }
    return 0;
}
