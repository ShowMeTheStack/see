/*
 * title: Every arrangement of a word
 * level: 3
 * about: Prints all permutations of a short word by swapping each letter into the front position and recursing on the rest.
 */
#include <stdio.h>
#include <string.h>

int count = 0;

void swap(char *a, char *b)
{
    char t = *a;

    *a = *b;
    *b = t;
}

/* Fix positions 0..k-1, then try every remaining letter in position k.
   The swap before the call chooses; the swap after it puts the word
   back exactly as it was, so the next choice starts clean. That undo
   step is the heart of backtracking. */
void permute(char *s, int k, int n)
{
    int i;

    if (k == n) {
        printf("%s%s", s, ++count % 6 == 0 ? "\n" : "  ");
        return;
    }
    for (i = k; i < n; i++) {
        swap(&s[k], &s[i]);
        permute(s, k + 1, n);
        swap(&s[k], &s[i]);   /* undo */
    }
}

/* A variant that skips repeated letters: a letter is only tried in
   position k if the same letter has not already been tried there. */
void permute_unique(char *s, int k, int n)
{
    int i, j, seen;

    if (k == n) {
        printf("%s ", s);
        count++;
        return;
    }
    for (i = k; i < n; i++) {
        seen = 0;
        for (j = k; j < i; j++)
            if (s[j] == s[i])
                seen = 1;
        if (seen)
            continue;
        swap(&s[k], &s[i]);
        permute_unique(s, k + 1, n);
        swap(&s[k], &s[i]);
    }
}

int main(void)
{
    /* word is an array in main's frame. Every frame of permute holds a
       pointer s back to it: one shared word, rearranged in place. */
    char word[8] = "ABCD";
    char repeat[8] = "BOOK";

    permute(word, 0, (int)strlen(word));
    printf("%d arrangements of %s\n\n", count, word);

    count = 0;
    permute_unique(repeat, 0, (int)strlen(repeat));
    printf("\n%d different arrangements of %s\n", count, repeat);
    return 0;
}
