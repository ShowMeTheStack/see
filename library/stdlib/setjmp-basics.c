/*
 * title: Jumping back with setjmp and longjmp
 * level: 3
 * about: Escapes from deep inside a chain of nested calls straight back to main with longjmp, and shows which local variables survive the jump.
 */
#include <stdio.h>
#include <setjmp.h>

/*
 * setjmp(env) saves "where we are": the stack position and the place
 * to resume. It returns 0 that first time. Later, longjmp(env, v)
 * from anywhere deeper in the call chain throws away all the frames
 * in between and makes that same setjmp return a second time, now
 * with the value v. It is C's nearest thing to an exception.
 */
static jmp_buf on_error;

static void level3(int n)
{
    printf("      level3(%d)\n", n);
    if (n > 2) {
        printf("      level3: n is too big, jumping out\n");
        longjmp(on_error, n);     /* never returns */
    }
    printf("      level3 returns normally\n");
}

static void level2(int n)
{
    printf("    level2(%d)\n", n);
    level3(n);
    printf("    level2 returns normally\n");   /* skipped by a longjmp */
}

static void level1(int n)
{
    printf("  level1(%d)\n", n);
    level2(n + 1);
    printf("  level1 returns normally\n");
}

int main(void)
{
    /*
     * A local changed between setjmp and longjmp has an unreliable
     * value after the jump, unless it is declared volatile. volatile
     * forces it to live in memory, where the jump cannot undo it.
     */
    volatile int attempts = 0;
    int code;

    code = setjmp(on_error);
    if (code != 0)
        printf("main: caught error code %d after %d attempts\n", code, attempts);

    while (attempts < 3) {
        attempts++;
        printf("attempt %d\n", attempts);
        level1(attempts);
    }

    /*
     * Run this with See's call stack pane open. During attempt 2 the
     * stack grows main, level1, level2, level3; at the longjmp all three
     * frames vanish in a single step and you are back in main at the
     * setjmp line.
     */
    printf("done\n");
    return 0;
}
