/*
 * title: Blackjack with a shuffled deck
 * level: 3
 * about: Shuffles 52 card structs with Fisher-Yates and plays hands of blackjack where you hit or stand and the dealer draws to 17, aces counting 1 or 11.
 * input: h\ns\nh\ns\nh\nh\n
 */
#include <stdio.h>
#include <stdlib.h>

struct card {
    int rank;           /* 1 = ace, 11..13 = jack, queen, king */
    char suit;          /* C D H S */
};

static struct card deck[52];
static int next_card = 0;

/* A hand does not copy cards: it holds pointers to cards in the deck.
   In the memory picture, each hand's arrows land on elements of deck[]. */
struct hand {
    const struct card *c[12];
    int n;
};

static void shuffle(void)
{
    static const char suits[] = "CDHS";
    int i, j;
    struct card t;

    for (i = 0; i < 52; i++) {
        deck[i].rank = i % 13 + 1;
        deck[i].suit = suits[i / 13];
    }
    /* Fisher-Yates: walk from the back, swap each card with a random one
       at or before it. Every order is equally likely, unlike the tempting
       "swap each card with any random card". */
    for (i = 51; i > 0; i--) {
        j = rand() % (i + 1);
        t = deck[i];
        deck[i] = deck[j];
        deck[j] = t;
    }
    next_card = 0;
}

static void deal(struct hand *h)
{
    if (next_card == 52)
        shuffle();
    h->c[h->n++] = &deck[next_card++];
}

/* Count aces as 1 first, then upgrade one ace to 11 if that does not
   bust. Two aces can never both be 11 (that would be 22). */
static int value(const struct hand *h)
{
    int i, total = 0, aces = 0, r;

    for (i = 0; i < h->n; i++) {
        r = h->c[i]->rank;
        total += r > 10 ? 10 : r;
        if (r == 1)
            aces++;
    }
    if (aces > 0 && total + 10 <= 21)
        total += 10;
    return total;
}

static void show(const char *who, const struct hand *h, int hide_second)
{
    static const char *face = "A23456789TJQK";
    int i;

    printf("%-7s", who);
    for (i = 0; i < h->n; i++) {
        if (i == 1 && hide_second)
            printf(" ??");
        else
            printf(" %c%c", face[h->c[i]->rank - 1], h->c[i]->suit);
    }
    if (!hide_second)
        printf("  = %d", value(h));
    printf("\n");
}

int main(void)
{
    struct hand you, dealer;
    char cmd;
    int round, chips = 100, bet = 10, pv, dv;

    srand(21);
    shuffle();
    for (round = 1; round <= 3; round++) {
        you.n = 0;
        dealer.n = 0;
        deal(&you); deal(&dealer); deal(&you); deal(&dealer);
        printf("--- hand %d, you have %d chips ---\n", round, chips);
        show("dealer", &dealer, 1);
        show("you", &you, 0);

        while (value(&you) < 21) {
            printf("hit or stand? ");
            if (scanf(" %c", &cmd) != 1)
                cmd = 's';
            printf("%c\n", cmd);
            if (cmd != 'h')
                break;
            deal(&you);
            show("you", &you, 0);
        }
        pv = value(&you);
        if (pv > 21) {
            printf("Bust!\n");
            chips -= bet;
            continue;
        }
        /* The dealer has no choices: hit below 17, stand on 17 or more. */
        show("dealer", &dealer, 0);
        while (value(&dealer) < 17) {
            deal(&dealer);
            show("dealer", &dealer, 0);
        }
        dv = value(&dealer);
        if (dv > 21 || pv > dv) {
            printf("You win.\n");
            chips += bet;
        } else if (pv < dv) {
            printf("Dealer wins.\n");
            chips -= bet;
        } else {
            printf("Push - nobody wins.\n");
        }
    }
    printf("You leave with %d chips.\n", chips);
    return 0;
}
