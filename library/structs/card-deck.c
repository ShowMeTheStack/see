/*
 * title: Shuffling and dealing a deck of cards
 * level: 2
 * about: Builds a 52-card deck of structs with enum suits, shuffles it with Fisher-Yates, deals four hands and scores them in high-card points.
 */
#include <stdio.h>
#include <stdlib.h>

enum suit { CLUBS, DIAMONDS, HEARTS, SPADES };

struct card {
    enum suit suit;
    int rank;          /* 2..14, where 11 = J, 12 = Q, 13 = K, 14 = A */
};

void print_card(struct card c)
{
    static const char ranks[] = "23456789TJQKA";
    static const char suits[] = "CDHS";
    printf("%c%c ", ranks[c.rank - 2], suits[c.suit]);
}

/* Fisher-Yates: walk from the end, swap each card with a random one at or
   before it. Every ordering is equally likely. Swapping two structs is
   three whole-struct assignments. */
void shuffle(struct card *deck, int n)
{
    int i;
    for (i = n - 1; i > 0; i--) {
        int j = rand() % (i + 1);
        struct card tmp = deck[i];
        deck[i] = deck[j];
        deck[j] = tmp;
    }
}

int by_suit_then_rank(const void *a, const void *b)
{
    const struct card *x = (const struct card *)a;
    const struct card *y = (const struct card *)b;
    if (x->suit != y->suit)
        return (int)y->suit - (int)x->suit;     /* spades first, like bridge */
    return y->rank - x->rank;                   /* aces high, first */
}

/* Bridge "high card points": A=4 K=3 Q=2 J=1. */
int points(const struct card *hand, int n)
{
    int i, p = 0;
    for (i = 0; i < n; i++)
        if (hand[i].rank > 10)
            p += hand[i].rank - 10;
    return p;
}

int main(void)
{
    struct card deck[52];
    const char *player[4] = { "North", "East", "South", "West" };
    int s, r, k = 0, p;

    for (s = CLUBS; s <= SPADES; s++)
        for (r = 2; r <= 14; r++) {
            deck[k].suit = (enum suit)s;
            deck[k].rank = r;
            k++;
        }

    srand(2024);       /* a fixed seed deals the same hands every run */
    shuffle(deck, 52);

    /* Hand p is the 13 cards starting at deck + 13 * p. No copying: each
       hand is a window into the one array. */
    for (p = 0; p < 4; p++) {
        struct card *hand = deck + 13 * p;
        qsort(hand, 13, sizeof *hand, by_suit_then_rank);
        printf("%-6s ", player[p]);
        for (k = 0; k < 13; k++)
            print_card(hand[k]);
        printf(" %2d points\n", points(hand, 13));
    }
    return 0;
}
