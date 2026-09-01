/*
 * title: The Josephus problem on a circular list
 * level: 2
 * about: Seats people in a circular linked list, removes every k-th one until one survives, and checks the answer against the classic formula.
 * input: 7 3\n10 2\n
 */
#include <stdio.h>
#include <stdlib.h>

/* In a circular list the last node points back to the first, so there is
   no end: walking "next" goes round and round, like counting around a ring
   of people. In the memory picture the arrows form a loop. */
struct seat {
    int person;
    struct seat *next;
};

/* Build 1..n in a ring and return the LAST seat. Holding the last seat is
   handy: its next is the first, and it is the node before the first. */
struct seat *make_ring(int n)
{
    struct seat *first = NULL, *last = NULL;
    int i;
    for (i = 1; i <= n; i++) {
        struct seat *s = malloc(sizeof *s);
        if (s == NULL)
            exit(1);
        s->person = i;
        if (first == NULL)
            first = s;
        else
            last->next = s;
        last = s;
    }
    last->next = first;          /* close the circle */
    return last;
}

int survivor(int n, int k)
{
    struct seat *before = make_ring(n), *out;
    int i, survivor_id;

    printf("n=%d k=%d  out:", n, k);
    /* While more than one remains (a node pointing to itself is alone). */
    while (before->next != before) {
        /* Move k-1 places so that `before` sits just in front of the victim. */
        for (i = 1; i < k; i++)
            before = before->next;
        out = before->next;
        before->next = out->next;    /* unhook the victim from the ring */
        printf(" %d", out->person);
        free(out);
    }
    survivor_id = before->person;
    free(before);
    printf("\n");
    return survivor_id;
}

/* The recurrence J(1) = 0, J(n) = (J(n-1) + k) mod n, numbered from 0. */
int formula(int n, int k)
{
    int j = 0, m;
    for (m = 2; m <= n; m++)
        j = (j + k) % m;
    return j + 1;
}

int main(void)
{
    int n, k;
    while (scanf("%d %d", &n, &k) == 2 && n > 0 && k > 0) {
        int s = survivor(n, k);
        printf("survivor %d, formula says %d\n", s, formula(n, k));
    }
    return 0;
}
