/*
 * title: A tokenizer that returns token structs
 * level: 3
 * about: Splits arithmetic expressions into an array of token structs (kind, value, position), then evaluates them with operator precedence.
 * input: 3 + 4 * 2\n(1 + 2) * (3 + 4) - 5\n10 / 4 * 2\n7 $ 2\n2 * (3 + 4\n
 */
#include <stdio.h>
#include <ctype.h>
#include <string.h>

enum tkind { T_NUM, T_PLUS, T_MINUS, T_STAR, T_SLASH, T_LPAREN, T_RPAREN, T_END, T_BAD };

/* A token remembers what it is, its number if it is one, and where it was
   found so error messages can point at it. */
struct token {
    enum tkind kind;
    double value;
    int column;
};

#define MAXTOK 64

/* Fill toks[] from the text. Returns the number of tokens, including T_END. */
int tokenize(const char *s, struct token *toks)
{
    int n = 0, col = 0;
    while (n < MAXTOK - 1) {
        /* Initialised in full so that the padding bytes the compiler puts
           around the double get a value too: toks[n++] = t copies them. */
        struct token t = { T_BAD, 0.0, 0 };
        while (s[col] == ' ')
            col++;
        t.column = col;
        t.value = 0.0;
        if (s[col] == '\0' || s[col] == '\n') {
            t.kind = T_END;
            toks[n++] = t;
            return n;
        }
        if (isdigit((unsigned char)s[col])) {
            t.kind = T_NUM;
            while (isdigit((unsigned char)s[col]))
                t.value = t.value * 10 + (s[col++] - '0');
        } else {
            switch (s[col]) {
            case '+': t.kind = T_PLUS; break;
            case '-': t.kind = T_MINUS; break;
            case '*': t.kind = T_STAR; break;
            case '/': t.kind = T_SLASH; break;
            case '(': t.kind = T_LPAREN; break;
            case ')': t.kind = T_RPAREN; break;
            default:  t.kind = T_BAD; break;
            }
            col++;
        }
        toks[n++] = t;
    }
    toks[n].kind = T_END;
    toks[n].column = col;
    toks[n].value = 0.0;
    return n + 1;
}

/* A tiny recursive-descent evaluator over the token array.
     expr   = term { (+|-) term }
     term   = factor { (*|/) factor }
     factor = number | ( expr )
   The token array and the position pos are file-level statics shared by all
   three functions; they appear in the globals panel. */
static const struct token *tk;
static int pos, error_at;

double expr(void);

double factor(void)
{
    double v;
    if (tk[pos].kind == T_NUM)
        return tk[pos++].value;
    if (tk[pos].kind == T_LPAREN) {
        pos++;
        v = expr();
        if (tk[pos].kind == T_RPAREN)
            pos++;
        else if (error_at < 0)
            error_at = tk[pos].column;
        return v;
    }
    if (error_at < 0)
        error_at = tk[pos].column;
    return 0.0;
}

double term(void)
{
    double v = factor();
    while (tk[pos].kind == T_STAR || tk[pos].kind == T_SLASH) {
        enum tkind op = tk[pos++].kind;
        double r = factor();
        v = (op == T_STAR) ? v * r : v / r;
    }
    return v;
}

double expr(void)
{
    double v = term();
    while (tk[pos].kind == T_PLUS || tk[pos].kind == T_MINUS) {
        enum tkind op = tk[pos++].kind;
        double r = term();
        v = (op == T_PLUS) ? v + r : v - r;
    }
    return v;
}

int main(void)
{
    static const char *names[] = { "NUM", "+", "-", "*", "/", "(", ")", "END", "BAD" };
    char line[100];
    struct token toks[MAXTOK];
    int i, n;
    double v;

    while (fgets(line, sizeof line, stdin) != NULL) {
        line[strcspn(line, "\n")] = '\0';
        n = tokenize(line, toks);
        printf("%s\n  tokens:", line);
        for (i = 0; i < n; i++) {
            if (toks[i].kind == T_NUM)
                printf(" %g", toks[i].value);
            else
                printf(" %s", names[toks[i].kind]);
        }
        printf("\n");

        tk = toks;
        pos = 0;
        error_at = -1;
        v = expr();
        if (error_at < 0 && tk[pos].kind != T_END)
            error_at = tk[pos].column;
        if (error_at >= 0)
            printf("  error at column %d:\n  %s\n  %*s^\n", error_at + 1, line, error_at, "");
        else
            printf("  = %g\n", v);
    }
    return 0;
}
