/*
 * title: An opaque text buffer with an init function
 * level: 3
 * about: Builds strings in a growable buffer whose struct is hidden inside its own .c file.
 */

/* See compiles main.c and textbuf.c separately and links them. While it
 * compiles main.c it has never seen the fields of struct textbuf, and that
 * is the point: main.c can only use the functions. In the memory picture
 * you can still see everything, because See shows memory as it really is. */
#include <stdio.h>
#include "textbuf.h"

int main(void)
{
    TextBuf *greeting;
    TextBuf *digits;
    int i;

    textbuf_init();

    greeting = textbuf_new();
    digits = textbuf_new();
    if (greeting == NULL || digits == NULL) {
        textbuf_free(greeting);
        textbuf_free(digits);
        return 1;
    }

    /* Each append may grow the hidden heap block. Watch its size double. */
    textbuf_append(greeting, "Hello");
    textbuf_append(greeting, ", ");
    textbuf_append(greeting, "opaque");
    textbuf_append(greeting, " world");
    printf("%s (%u chars)\n", textbuf_text(greeting), (unsigned)textbuf_length(greeting));

    for (i = 0; i < 20; i++) {
        textbuf_append_char(digits, (char)('0' + i % 10));
    }
    printf("%s (%u chars)\n", textbuf_text(digits), (unsigned)textbuf_length(digits));
    textbuf_stats();

    /* These lines would not compile here, which is exactly what we want:
     *     TextBuf t;          incomplete type
     *     greeting->len = 0;  no fields visible
     */

    textbuf_free(greeting);
    textbuf_free(digits);
    textbuf_stats();
    return 0;
}
