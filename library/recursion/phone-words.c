/*
 * title: Words from phone keypad digits
 * level: 3
 * about: Reads digit strings and recursively expands every letter combination they spell on a phone keypad, flagging the ones in a small dictionary.
 * input: 228\n4663\n76\n
 */
#include <stdio.h>
#include <string.h>

static const char *keys[10] = {
    "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"
};

static const char *dictionary[] = {
    "act", "bat", "cat", "good", "gone", "home", "hood", "hoof", "hone",
    "so", "po"
};

int known(const char *w)
{
    int i, n = (int)(sizeof dictionary / sizeof dictionary[0]);

    for (i = 0; i < n; i++)
        if (strcmp(w, dictionary[i]) == 0)
            return 1;
    return 0;
}

int total;

/* Each level of recursion handles one digit and loops over that key's
   letters. The word being built lives in one buffer owned by main;
   each level writes its own position and calls the next level. The
   number of results is the product of the key sizes. */
void expand(const char *digits, int i, char *word)
{
    const char *letters;

    if (digits[i] == '\0') {
        word[i] = '\0';
        total++;
        printf(known(word) ? " [%s]" : " %s", word);
        return;
    }
    letters = keys[digits[i] - '0'];
    for (; *letters != '\0'; letters++) {
        word[i] = *letters;
        expand(digits, i + 1, word);
    }
}

int main(void)
{
    char digits[16], word[16];

    while (scanf("%15s", digits) == 1) {
        total = 0;
        printf("%s:", digits);
        expand(digits, 0, word);
        printf("\n  %d combinations; words in brackets are in the dictionary\n", total);
    }
    return 0;
}
