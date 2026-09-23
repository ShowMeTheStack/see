/* lexer.c - the only file that looks at characters. The parser sees
 * nothing but tokens, which keeps it short. */
#include <ctype.h>
#include <stdlib.h>
#include "lexer.h"

void lexer_start(struct lexer *lx, const char *text)
{
    lx->text = text;
    lx->pos = 0;
    lexer_next(lx);     /* load the first token so the parser can peek at it */
}

void lexer_next(struct lexer *lx)
{
    const char *s = lx->text;
    char *end;
    char c;

    while (s[lx->pos] == ' ' || s[lx->pos] == '\t') {
        lx->pos++;
    }
    lx->current.pos = lx->pos;
    c = s[lx->pos];

    if (c == '\0' || c == '\n') {
        lx->current.kind = TOK_END;
        return;
    }
    if (isdigit((unsigned char)c) || c == '.') {
        /* strtod reads as much of a number as it can and tells us where it stopped. */
        lx->current.kind = TOK_NUM;
        lx->current.value = strtod(s + lx->pos, &end);
        lx->pos = (int)(end - s);
        return;
    }
    lx->pos++;
    switch (c) {
    case '+': lx->current.kind = TOK_PLUS; break;
    case '-': lx->current.kind = TOK_MINUS; break;
    case '*': lx->current.kind = TOK_STAR; break;
    case '/': lx->current.kind = TOK_SLASH; break;
    case '^': lx->current.kind = TOK_CARET; break;
    case '(': lx->current.kind = TOK_LPAREN; break;
    case ')': lx->current.kind = TOK_RPAREN; break;
    default:  lx->current.kind = TOK_BAD; break;
    }
}

const char *token_name(enum token_kind kind)
{
    static const char *names[] = { "number", "'+'", "'-'", "'*'", "'/'", "'^'", "'('", "')'", "end of line", "strange character" };
    return names[kind];
}
