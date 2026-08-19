/*
 * title: Morse code translator
 * level: 2
 * about: Encodes text to Morse with a table indexed by letter, and decodes it back by searching the table for each dot-dash group.
 */
#include <stdio.h>
#include <string.h>
#include <ctype.h>

/* code[0] is A, code[25] is Z, then the digits 0 to 9. A letter's place
   in the table is worked out from its character code, so encoding needs
   no search at all. */
static const char *code[36] = {
    ".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..", ".---",
    "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.", "...", "-",
    "..-", "...-", ".--", "-..-", "-.--", "--..",
    "-----", ".----", "..---", "...--", "....-", ".....", "-....", "--...", "---..", "----."
};

static void encode(const char *s, char *out)
{
    int c, first = 1;
    out[0] = '\0';
    for (; *s; s++) {
        c = toupper((unsigned char)*s);
        if (c == ' ') {
            strcat(out, " /");   /* a slash separates words */
            continue;
        }
        if (!first)
            strcat(out, " ");
        first = 0;
        if (c >= 'A' && c <= 'Z')
            strcat(out, code[c - 'A']);
        else if (c >= '0' && c <= '9')
            strcat(out, code[26 + c - '0']);
        else
            strcat(out, "?");
    }
}

/* Decoding has to search: walk the table until a code matches. */
static char lookup(const char *group)
{
    int i;
    for (i = 0; i < 36; i++)
        if (strcmp(code[i], group) == 0)
            return (char)(i < 26 ? 'A' + i : '0' + i - 26);
    return '?';
}

static void decode(const char *m, char *out)
{
    char group[8];
    int g;
    while (*m) {
        if (*m == ' ') { m++; continue; }
        if (*m == '/') { *out++ = ' '; m++; continue; }
        /* Copy one group of dots and dashes, never more than fits. */
        g = 0;
        while (*m && *m != ' ' && *m != '/') {
            if (g < 7)
                group[g++] = *m;
            m++;
        }
        group[g] = '\0';
        *out++ = lookup(group);
    }
    *out = '\0';
}

int main(void)
{
    char morse[200], back[50];
    const char *msgs[3] = { "SOS", "Hello World", "Apollo 11" };
    int i;

    for (i = 0; i < 3; i++) {
        encode(msgs[i], morse);
        decode(morse, back);
        printf("%-12s %s\n%12s -> %s\n", msgs[i], morse, "", back);
    }
    decode("- .... . / . -. -..", back);
    printf("secret: %s\n", back);
    return 0;
}
