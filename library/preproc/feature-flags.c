/*
 * title: Feature flags with #ifdef, #ifndef and #undef
 * level: 2
 * about: Builds a text statistics tool whose optional features are switched on and off by defining or undefining macros.
 */
#include <stdio.h>
#include <ctype.h>

/*
 * Each optional feature is controlled by whether a macro EXISTS, not
 * by its value. #ifdef asks "is it defined?", #ifndef "is it not?".
 */
#define WITH_VOWELS
#define WITH_WORDS
#define WITH_HISTOGRAM

/* Changed our minds: #undef removes a definition from here on. */
#undef WITH_HISTOGRAM

/* Give a default only if nobody set one already. This is the usual
   pattern for settings that may also come from the build command. */
#ifndef LINE_WIDTH
#  define LINE_WIDTH 40
#endif

static const char *text =
    "The quick brown fox jumps over the lazy dog. "
    "Pack my box with five dozen liquor jugs.";

int main(void)
{
    int i, letters = 0;
#ifdef WITH_VOWELS
    int vowels = 0;
#endif
#ifdef WITH_WORDS
    int words = 0, in_word = 0;
#endif
#ifdef WITH_HISTOGRAM
    int counts[26];
    for (i = 0; i < 26; i++)
        counts[i] = 0;
#endif

    for (i = 0; text[i] != '\0'; i++) {
        int c = tolower((unsigned char)text[i]);
        if (isalpha(c)) {
            letters++;
#ifdef WITH_VOWELS
            if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u')
                vowels++;
#endif
#ifdef WITH_HISTOGRAM
            counts[c - 'a']++;
#endif
        }
#ifdef WITH_WORDS
        if (isspace(c))
            in_word = 0;
        else if (!in_word) {
            in_word = 1;
            words++;
        }
#endif
    }

    /* Print the text wrapped at LINE_WIDTH characters. */
    for (i = 0; text[i] != '\0'; i++) {
        putchar(text[i]);
        if ((i + 1) % LINE_WIDTH == 0)
            putchar('\n');
    }
    putchar('\n');

    printf("letters: %d\n", letters);
#ifdef WITH_VOWELS
    printf("vowels: %d, consonants: %d\n", vowels, letters - vowels);
#endif
#ifdef WITH_WORDS
    printf("words: %d\n", words);
#endif
#ifdef WITH_HISTOGRAM
    for (i = 0; i < 26; i++)
        if (counts[i] > 0)
            printf("%c %d\n", 'a' + i, counts[i]);
#else
    printf("(histogram not built in)\n");
#endif

    /*
     * Compare the locals pane in See with the source: there is no
     * counts array, because its declaration was removed together with
     * the feature. Delete the #undef line and run again to get it back.
     */
    return 0;
}
