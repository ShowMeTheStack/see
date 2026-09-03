/*
 * title: Longest stretch without a repeat
 * level: 3
 * about: Finds the longest substring with no repeated character in each input line, using a window that grows on the right and shrinks on the left.
 * input: abcabcbb\npwwkew\nthe quick brown fox\naaaa
 */
#include <stdio.h>

#define LINE 200

/*
 * The window is s[left..right]. last_seen[c] remembers the last index
 * where character c appeared. When s[right] was already inside the
 * window, left jumps just past that earlier copy. Neither end ever
 * moves backwards, so the work is linear in the length of the line.
 */
void longest_unique(const char *s, int *start, int *len)
{
    int last_seen[256];
    int left = 0, right, c;

    for (c = 0; c < 256; c++)
        last_seen[c] = -1;
    *start = 0;
    *len = 0;

    for (right = 0; s[right] != '\0'; right++) {
        c = (unsigned char)s[right];    /* char is signed here; index with unsigned */
        if (last_seen[c] >= left)
            left = last_seen[c] + 1;
        last_seen[c] = right;
        if (right - left + 1 > *len) {
            *len = right - left + 1;
            *start = left;
        }
    }
}

/*
 * Read one line into buf (without the newline). Returns 0 at end of
 * input. Characters beyond size-1 are read and dropped.
 */
int read_line(char *buf, int size)
{
    int c, n = 0;
    while ((c = getchar()) != EOF && c != '\n')
        if (n < size - 1)
            buf[n++] = (char)c;
    buf[n] = '\0';
    return c != EOF || n > 0;
}

int main(void)
{
    char line[LINE];
    int start, len;

    while (read_line(line, sizeof line)) {
        longest_unique(line, &start, &len);
        /*
         * %.*s prints exactly len characters starting at line + start:
         * a neat way to print a slice without copying it.
         */
        printf("\"%s\": \"%.*s\" (length %d, from index %d)\n",
               line, len, line + start, len, start);
    }
    return 0;
}
