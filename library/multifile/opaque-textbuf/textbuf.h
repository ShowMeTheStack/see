/* textbuf.h - a growable text buffer whose insides are a secret.
 *
 * "struct textbuf" is declared here but not defined: it is an incomplete
 * type. Code that includes this header can hold a pointer to one and pass
 * it around, but cannot see its fields, cannot declare a struct textbuf
 * variable, and cannot take sizeof of it. Only textbuf.c knows the layout,
 * so it can change the layout without breaking any other file. */
#ifndef TEXTBUF_H
#define TEXTBUF_H

#include <stddef.h>

typedef struct textbuf TextBuf;

void textbuf_init(void);              /* call once before anything else */
TextBuf *textbuf_new(void);
void textbuf_free(TextBuf *tb);
int textbuf_append(TextBuf *tb, const char *s);
int textbuf_append_char(TextBuf *tb, char c);
size_t textbuf_length(const TextBuf *tb);
const char *textbuf_text(const TextBuf *tb);
void textbuf_stats(void);

#endif
