/*
 * title: dcl, reading C declarations aloud
 * level: 4
 * about: The recursive-descent parser of section 5.12 that turns declarations like char (*(*x())[])() into English, and reports the ones that do not parse.
 * input: char **argv\nint (*daytab)[13]\nint *daytab[13]\nvoid *comp()\nvoid (*comp)()\nchar (*(*x())[])()\nchar (*(*x[3])())[5]\nint (*pf)(\n
 */
#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define MAXTOKEN 100

enum { NAME, PARENS, BRACKETS };

/* The grammar, straight from the book:
       dcl:        optional *'s  direct-dcl
       direct-dcl: name
                   (dcl)
                   direct-dcl()
                   direct-dcl[optional size]
   dcl and dirdcl call each other, so the recursion depth follows the
   nesting of the brackets in the declaration. Step into the last good
   example and watch the stack panel: dcl, dirdcl, dcl, dirdcl... */
void dcl(void);
void dirdcl(void);

int gettoken(void);
int tokentype;              /* type of the last token */
char token[MAXTOKEN];       /* the last token's text */
char name[MAXTOKEN];        /* the identifier being declared */
char datatype[MAXTOKEN];    /* char, int, ... */
char out[1000];             /* the English, built up as we go */
int error;                  /* set when the input does not parse */

/* Pushback of one character, like getch/ungetch. */
static int pushed = EOF + 1;  /* EOF + 1 is never a real character here */
static int saved;

int getch(void)
{
    if (pushed != EOF + 1) {
        saved = pushed;
        pushed = EOF + 1;
        return saved;
    }
    return getchar();
}

void ungetch(int c)
{
    pushed = c;
}

/* The lexer: skip blanks, then return one token. () becomes PARENS,
   [anything] becomes BRACKETS with its text, a word becomes NAME, and
   any other character is returned as itself. */
int gettoken(void)
{
    int c;
    char *p = token;

    while ((c = getch()) == ' ' || c == '\t')
        ;
    if (c == '(') {
        if ((c = getch()) == ')') {
            strcpy(token, "()");
            return tokentype = PARENS;
        }
        ungetch(c);
        return tokentype = '(';
    } else if (c == '[') {
        for (*p++ = (char)c; p < token + MAXTOKEN - 2 && (c = getch()) != ']' && c != '\n' && c != EOF; )
            *p++ = (char)c;
        if (c != ']') {
            if (c != EOF)
                ungetch(c);
            *p = '\0';
            return tokentype = '[';      /* unclosed: let the parser complain */
        }
        *p++ = ']';
        *p = '\0';
        return tokentype = BRACKETS;
    } else if (isalpha(c)) {
        for (*p++ = (char)c; isalnum(c = getch()) && p < token + MAXTOKEN - 1; )
            *p++ = (char)c;
        *p = '\0';
        ungetch(c);
        return tokentype = NAME;
    }
    return tokentype = c;
}

void dcl(void)
{
    int ns;

    for (ns = 0; gettoken() == '*'; )   /* count the stars */
        ns++;
    dirdcl();
    /* The stars are read first but said last: "pointer to" comes after
       whatever the direct declarator said. */
    while (ns-- > 0)
        strcat(out, " pointer to");
}

void dirdcl(void)
{
    int type;

    if (tokentype == '(') {             /* ( dcl ) */
        dcl();
        if (tokentype != ')') {
            printf("error: missing )\n");
            error = 1;
        }
    } else if (tokentype == NAME)       /* the variable's name */
        strcpy(name, token);
    else {
        printf("error: expected a name or (dcl)\n");
        error = 1;
    }
    while (!error && ((type = gettoken()) == PARENS || type == BRACKETS)) {
        if (type == PARENS)
            strcat(out, " function returning");
        else {
            strcat(out, " array");
            strcat(out, token);
            strcat(out, " of");
        }
    }
}

/* Throw away the rest of a bad line so the next one starts clean. */
void skip_line(void)
{
    int c;

    if (tokentype == '\n')
        return;
    while ((c = getch()) != '\n' && c != EOF)
        ;
}

int main(void)
{
    while (gettoken() != EOF) {
        if (tokentype == '\n')
            continue;
        strcpy(datatype, token);        /* first word: the base type */
        out[0] = '\0';
        name[0] = '\0';
        error = 0;
        dcl();
        if (!error && tokentype != '\n') {
            printf("syntax error\n");
            error = 1;
        }
        if (error)
            skip_line();
        else
            printf("%s:%s %s\n", name, out, datatype);
    }
    return 0;
}
