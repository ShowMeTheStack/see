/*
 * title: Splitting a string into a heap array of words
 * level: 3
 * about: Splits a sentence into a NULL-terminated array of separately allocated words, without modifying the original, and frees the whole structure with one helper.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Count the words first, so the pointer array can be allocated once. */
static int count_words(const char *s, const char *seps)
{
    int n = 0;
    while (*s != '\0') {
        s += strspn(s, seps);          /* skip separators */
        if (*s == '\0')
            break;
        n++;
        s += strcspn(s, seps);         /* skip the word */
    }
    return n;
}

static void free_words(char **words)
{
    int i;
    if (words == NULL)
        return;
    for (i = 0; words[i] != NULL; i++)
        free(words[i]);
    free(words);
}

/*
 * Returns an array of n + 1 pointers; the last is NULL so the caller can
 * loop without knowing n, the way argv works. The caller frees it with
 * free_words. Unlike strtok, the input string is left untouched.
 */
static char **split(const char *s, const char *seps)
{
    int n = count_words(s, seps), i = 0;
    char **words = malloc((n + 1) * sizeof *words);
    size_t len;

    if (words == NULL)
        return NULL;
    while (i < n) {
        s += strspn(s, seps);
        len = strcspn(s, seps);
        words[i] = malloc(len + 1);
        if (words[i] == NULL) {
            free_words(words);   /* words[i] is NULL, so this frees 0..i-1 */
            return NULL;
        }
        memcpy(words[i], s, len);
        words[i][len] = '\0';
        s += len;
        i++;
    }
    words[n] = NULL;
    return words;
}

int main(void)
{
    const char *sentence = "  the  heap, the stack,and   the globals ";
    char **words = split(sentence, " ,");
    int i;

    if (words == NULL)
        return 0;

    /*
     * The heap panel shows one block of pointers ending in NULL, each
     * pointer leading to a small block holding one word.
     */
    for (i = 0; words[i] != NULL; i++)
        printf("%d: [%s]\n", i, words[i]);
    printf("original still intact: [%s]\n", sentence);

    free_words(words);
    return 0;
}
