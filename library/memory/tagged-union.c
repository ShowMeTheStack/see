/*
 * title: A tagged union for mixed values
 * level: 3
 * about: Stores ints, doubles and short strings in one array of tagged unions, showing that all members share the same address and the union is as big as its largest member.
 */
#include <stdio.h>

enum kind { INT, REAL, TEXT };

struct value {
    enum kind kind;          /* the tag: which member is valid right now */
    union {
        long i;
        double d;
        char s[12];
    } as;
};

static void print_value(const struct value *v)
{
    /* Always read the member the tag says was last written. */
    switch (v->kind) {
    case INT:  printf("int    %ld\n", v->as.i); break;
    case REAL: printf("real   %g\n", v->as.d); break;
    case TEXT: printf("text   \"%s\"\n", v->as.s); break;
    }
}

static void set_int(struct value *v, long i)   { v->kind = INT;  v->as.i = i; }
static void set_real(struct value *v, double d) { v->kind = REAL; v->as.d = d; }
static void set_text(struct value *v, const char *s)
{
    size_t i;

    /* Copy at most 11 characters and always finish with '\0'. */
    v->kind = TEXT;
    for (i = 0; i < sizeof v->as.s - 1 && s[i] != '\0'; i++)
        v->as.s[i] = s[i];
    v->as.s[i] = '\0';
}

int main(void)
{
    struct value cells[4];
    int i;

    printf("sizeof long %u, double %u, char[12] %u -> union %u, struct %u\n",
           (unsigned)sizeof(long), (unsigned)sizeof(double), 12u,
           (unsigned)sizeof cells[0].as, (unsigned)sizeof cells[0]);
    printf("&as.i = %p, &as.d = %p, &as.s = %p  (all the same)\n\n",
           (void *)&cells[0].as.i, (void *)&cells[0].as.d, (void *)cells[0].as.s);

    set_int(&cells[0], 42);
    set_real(&cells[1], 3.25);
    set_text(&cells[2], "hello");
    set_text(&cells[3], "a long string that gets cut");

    for (i = 0; i < 4; i++)
        print_value(&cells[i]);

    /*
     * Reuse a cell: writing the double overwrites the bytes the text used.
     * In the stack panel, watch cells[2] change shape as its tag changes.
     */
    set_real(&cells[2], -0.5);
    printf("cells[2] is now ");
    print_value(&cells[2]);
    return 0;
}
