/*
 * title: Functions that hand back a pointer into your array
 * level: 2
 * about: Writes find_max and find_value functions that return the address of an element, so the caller can read or change that very element.
 */
#include <stdio.h>

/* Returning an index would work too, but returning a pointer lets the
   caller use the answer directly: *p to read it, *p = ... to change it.
   It is safe because the pointer leads into the caller's own array,
   which is still alive after this function returns. */
int *find_max(int *a, int n)
{
    int *best = a, *p;

    for (p = a + 1; p < a + n; p++)
        if (*p > *best)
            best = p;
    return best;
}

/* Returns NULL when the value is absent: the usual way for a
   pointer-returning function to say "not found". */
int *find_value(int *a, int n, int value)
{
    int i;

    for (i = 0; i < n; i++)
        if (a[i] == value)
            return &a[i];
    return NULL;
}

void show(const char *label, const int *a, int n)
{
    int i;

    printf("%-28s", label);
    for (i = 0; i < n; i++)
        printf(" %3d", a[i]);
    printf("\n");
}

int main(void)
{
    int scores[8];
    int *top, *hit;
    int i;

    scores[0] = 41; scores[1] = 87; scores[2] = 12; scores[3] = 87;
    scores[4] = 66; scores[5] = 93; scores[6] = 5;  scores[7] = 70;
    show("scores:", scores, 8);

    /* After this line, top is an arrow from main's frame to one cell of
       scores. Pointer minus array start gives the index. */
    top = find_max(scores, 8);
    printf("highest is %d, at index %d\n", *top, (int)(top - scores));

    *top = 0;   /* change the element itself, through the pointer */
    show("after zeroing the top one:", scores, 8);

    /* Repeatedly cap the biggest score at 50. */
    for (i = 0; i < 3; i++) {
        top = find_max(scores, 8);
        if (*top > 50)
            *top = 50;
    }
    show("three biggest capped at 50:", scores, 8);

    hit = find_value(scores, 8, 12);
    if (hit != NULL) {
        printf("found 12 at index %d; doubling it\n", (int)(hit - scores));
        *hit *= 2;
    }
    hit = find_value(scores, 8, 99);
    printf("99 is %s\n", hit == NULL ? "not there (NULL came back)" : "there");

    /* Searching only the second half: pass the address of element 4. */
    top = find_max(scores + 4, 4);
    printf("highest of the last four is %d, at index %d\n", *top, (int)(top - scores));
    show("final:", scores, 8);
    return 0;
}
