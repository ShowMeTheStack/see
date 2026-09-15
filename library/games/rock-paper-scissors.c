/*
 * title: Rock, paper, scissors, best of five
 * level: 1
 * about: Plays rounds of rock, paper, scissors against a seeded random computer, deciding each round with one line of modular arithmetic.
 * input: r\np\nx\ns\np\nr\nr\n
 */
#include <stdio.h>
#include <stdlib.h>

/* Number the moves 0, 1, 2 so that each one beats the one before it:
   paper (1) beats rock (0), scissors (2) beats paper (1), and rock (0)
   beats scissors (2) - going round in a circle. */
static const char *name[3] = { "rock", "paper", "scissors" };

/* Returns 0 for a draw, 1 if a wins, 2 if b wins. (a - b + 3) % 3 does
   it in one go: the +3 keeps the left side from going negative. */
static int judge(int a, int b)
{
    return (a - b + 3) % 3;
}

int main(void)
{
    char ch;
    int you, cpu, result;
    int you_won = 0, cpu_won = 0, round = 0;

    srand(5);
    printf("Type r, p or s. First to three wins.\n");
    while (you_won < 3 && cpu_won < 3) {
        /* " %c" with a space skips the newline left from the last line. */
        if (scanf(" %c", &ch) != 1)
            break;
        if (ch == 'r')
            you = 0;
        else if (ch == 'p')
            you = 1;
        else if (ch == 's')
            you = 2;
        else {
            printf("'%c'? Use r, p or s.\n", ch);
            continue;
        }
        cpu = rand() % 3;
        round++;
        result = judge(you, cpu);
        printf("round %d: you %-8s computer %-8s -> ", round, name[you], name[cpu]);
        if (result == 0)
            printf("draw\n");
        else if (result == 1) {
            you_won++;
            printf("you win\n");
        } else {
            cpu_won++;
            printf("computer wins\n");
        }
    }
    printf("final score: you %d, computer %d\n", you_won, cpu_won);
    return 0;
}
