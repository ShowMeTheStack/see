/*
 * title: Object-like macros as named constants
 * level: 1
 * about: Uses #define names for the sizes and limits of a small marks table, then prints a report.
 */
#include <stdio.h>

/*
 * An object-like macro is a name the preprocessor swaps for its text
 * before the compiler ever sees the program. By the time See builds
 * the code, every STUDENTS below has already become 5.
 *
 * Writing the number once, at the top, means that changing the class
 * size is a one-line edit instead of a hunt through the whole file.
 * Upper-case names are only a habit, but a very useful one: they warn
 * the reader "this is a macro, not a variable".
 */
#define STUDENTS   5
#define PASS_MARK  40
#define MAX_MARK   100
#define BAR_WIDTH  20

/* A macro can be any text, including a string literal. */
#define TITLE "Term marks"

int main(void)
{
    /* The array size is a macro, so the loop bounds and the
       declaration can never disagree. */
    int marks[STUDENTS];
    int i, j, passed = 0, bar;

    marks[0] = 72;
    marks[1] = 35;
    marks[2] = 90;
    marks[3] = 41;
    marks[4] = 18;

    printf("%s (pass mark %d out of %d)\n", TITLE, PASS_MARK, MAX_MARK);

    for (i = 0; i < STUDENTS; i++) {
        /* Scale the mark to a bar of at most BAR_WIDTH characters. */
        bar = marks[i] * BAR_WIDTH / MAX_MARK;
        printf("student %d %3d |", i + 1, marks[i]);
        for (j = 0; j < bar; j++)
            putchar('#');
        for (; j < BAR_WIDTH; j++)
            putchar(' ');
        if (marks[i] >= PASS_MARK) {
            printf("| pass\n");
            passed++;
        } else {
            printf("| -\n");
        }
    }

    printf("%d of %d passed\n", passed, STUDENTS);

    /*
     * Look at the globals and locals panes in See: there is no variable
     * called STUDENTS or PASS_MARK anywhere. Macros leave no trace in
     * memory, because they vanish before compilation. The string TITLE
     * does appear, though, among the string literals, since the macro
     * turned into an ordinary "Term marks" literal.
     */
    return 0;
}
