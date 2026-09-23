/* lexer.h - turns a line of text into tokens, one at a time. */
#ifndef LEXER_H
#define LEXER_H

enum token_kind {
    TOK_NUM, TOK_PLUS, TOK_MINUS, TOK_STAR, TOK_SLASH, TOK_CARET,
    TOK_LPAREN, TOK_RPAREN, TOK_END, TOK_BAD
};

struct token {
    enum token_kind kind;
    double value;       /* only for TOK_NUM */
    int pos;            /* where in the line it started, for error messages */
};

struct lexer {
    const char *text;
    int pos;
    struct token current;   /* the token the parser is looking at */
};

void lexer_start(struct lexer *lx, const char *text);
void lexer_next(struct lexer *lx);
const char *token_name(enum token_kind kind);

#endif
