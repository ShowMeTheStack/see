/*
 * title: Rule 30, one function call per generation
 * level: 2
 * about: Grows the Rule 30 and Rule 90 cellular automata row by row, with a function that computes each new row from the old one.
 */
#include <stdio.h>

#define WIDTH 63
#define STEPS 24

/* A cell's next state depends on itself and its two neighbours: three
   bits, so eight cases. The rule number's binary digits give the
   answer for each case: bit k of the rule is the new state for the
   neighbourhood whose value is k. */
int next_state(int rule, int left, int self, int right)
{
    int k = left * 4 + self * 2 + right;

    return (rule >> k) & 1;
}

/* Computes a whole new row into "next" from "row". The edges see dead
   cells beyond them. Two separate arrays are needed: updating in place
   would mix old and new values. */
void step(int rule, const int *row, int *next)
{
    int i, left, right;

    for (i = 0; i < WIDTH; i++) {
        left = i > 0 ? row[i - 1] : 0;
        right = i < WIDTH - 1 ? row[i + 1] : 0;
        next[i] = next_state(rule, left, row[i], right);
    }
}

void print_row(const int *row)
{
    int i;

    for (i = 0; i < WIDTH; i++)
        putchar(row[i] ? '#' : ' ');
    putchar('\n');
}

void copy_row(const int *from, int *to)
{
    int i;

    for (i = 0; i < WIDTH; i++)
        to[i] = from[i];
}

/* Runs a whole automaton. The two rows are locals of this function, so
   each call to run starts with a fresh pair in a new frame. */
void run(int rule)
{
    int row[WIDTH], next[WIDTH];
    int i, g;

    for (i = 0; i < WIDTH; i++)
        row[i] = 0;
    row[WIDTH / 2] = 1;              /* one live cell in the middle */

    printf("rule %d:\n", rule);
    for (g = 0; g < STEPS; g++) {
        print_row(row);
        step(rule, row, next);
        copy_row(next, row);
    }
}

int main(void)
{
    run(30);    /* chaotic: used as a random number source */
    run(90);    /* orderly: the Sierpinski triangle again */
    return 0;
}
