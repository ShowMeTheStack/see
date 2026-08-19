/*
 * title: Pig Latin translator
 * level: 2
 * about: Translates each word of a sentence into Pig Latin by moving the leading consonants to the end and adding "ay", building the output with sprintf.
 * input: the quick brown fox jumps over a lazy dog\nstring theory is awesome\n
 */
#include <stdio.h>
#include <string.h>
#include <ctype.h>

static int is_vowel(char c)
{
    /* strchr on a short string of vowels is a neat membership test. The
       c != '\0' guard matters: strchr also finds the NUL at the end. */
    return c != '\0' && strchr("aeiou", tolower((unsigned char)c)) != NULL;
}

/* Write the Pig Latin for word into out. "string" -> "ingstray",
   "apple" -> "appleway". */
static void piggy(const char *word, char *out)
{
    int k = 0;
    if (is_vowel(word[0])) {
        sprintf(out, "%sway", word);
        return;
    }
    while (word[k] && !is_vowel(word[k])) {
        /* "qu" sticks together: "quick" -> "ickquay", not "uickqay". */
        if (tolower((unsigned char)word[k]) == 'q' && tolower((unsigned char)word[k + 1]) == 'u')
            k++;
        k++;
    }
    /* %s from word + k prints the rest; %.*s prints exactly k characters
       from the start. Two views of one string, no copying. */
    sprintf(out, "%s%.*say", word + k, k, word);
}

int main(void)
{
    char word[32], pig[40];
    int c;

    /* Read word by word; after each word peek at the next character to
       know whether the line ended. */
    while (scanf("%31s", word) == 1) {
        piggy(word, pig);
        printf("%s", pig);
        c = getchar();
        putchar(c == '\n' || c == EOF ? '\n' : ' ');
    }
    return 0;
}
