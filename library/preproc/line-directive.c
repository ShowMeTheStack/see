/*
 * title: Renumbering lines with #line
 * level: 3
 * about: Uses #line to change what __LINE__ and __FILE__ report, the way code generators point errors back at their own input file.
 */
#include <stdio.h>

#define HERE() printf("  now at %s line %d\n", __FILE__, __LINE__)

/*
 * Tools such as parser generators write C code from another file, say
 * grammar.y. They put #line directives in the C they produce, so an
 * error message names the line in grammar.y the human actually wrote,
 * not a line in a machine-made .c file.
 */
static void generated_rule(int n)
{
#line 12 "grammar.y"
    printf("rule from grammar.y, reached with n = %d\n", n);
    HERE();
    if (n < 0) {
        printf("  error at %s:%d: negative count\n", __FILE__, __LINE__);
    }
}

/* Switch back. #line with only a number keeps the current file name,
   so the name has to be given again here. */
#line 200 "line-directive.c"
int main(void)
{
    printf("main starts\n");
    HERE();
    generated_rule(3);
    generated_rule(-1);
    HERE();

    /*
     * The debugger in See follows the real source, so stepping still
     * highlights the true lines; only the values of __LINE__ and
     * __FILE__ were changed.
     */
    return 0;
}
