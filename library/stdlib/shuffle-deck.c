/*
 * title: Shuffling a deck fairly
 * level: 2
 * about: Builds a 52-card deck, shuffles it with the Fisher-Yates method and a fixed seed, deals four hands and counts the points in each.
 */
#include <stdio.h>
#include <stdlib.h>

#define CARDS 52

static const char *ranks = "23456789TJQKA";
static const char *suits = "CDHS";   /* clubs, diamonds, hearts, spades */

/* A random integer from 0 to n - 1, using the high bits of rand(). */
static int random_below(int n)
{
    return (int)(rand() / (RAND_MAX + 1.0) * n);
}

/*
 * Fisher-Yates: walk from the end; swap each card with a random card
 * at or before it. Every one of the 52! orders is equally likely.
 * The tempting "swap each card with any random card" is NOT fair:
 * it has 52^52 equally likely paths, which cannot split evenly into
 * 52! outcomes.
 */
static void shuffle(int *deck, int n)
{
    int i, j, t;
    for (i = n - 1; i > 0; i--) {
        j = random_below(i + 1);
        t = deck[i];
        deck[i] = deck[j];
        deck[j] = t;
    }
}

/* Bridge high-card points: A 4, K 3, Q 2, J 1. */
static int points(int card)
{
    int rank = card % 13;
    return rank > 8 ? rank - 8 : 0;
}

int main(void)
{
    int deck[CARDS];
    int i, p, hand;
    const char *seat[4];

    seat[0] = "North"; seat[1] = "East"; seat[2] = "South"; seat[3] = "West";

    /* Card c is rank c % 13 of suit c / 13. */
    for (i = 0; i < CARDS; i++)
        deck[i] = i;

    srand(1989);
    shuffle(deck, CARDS);

    /* Deal round the table: card i goes to player i % 4. */
    for (hand = 0; hand < 4; hand++) {
        p = 0;
        printf("%-5s ", seat[hand]);
        for (i = hand; i < CARDS; i += 4) {
            printf(" %c%c", ranks[deck[i] % 13], suits[deck[i] / 13]);
            p += points(deck[i]);
        }
        printf("  (%d points)\n", p);
    }

    /*
     * The four point totals always add up to 40, whatever the shuffle.
     * In See, deck is 52 ints in main's frame; step through shuffle and
     * watch two cells trade values on each pass.
     */
    return 0;
}
