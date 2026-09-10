/*
 * title: Exit codes, exit and EXIT_SUCCESS
 * level: 2
 * about: Runs a batch of checks that each produce an exit status, combines them the way shell tools do, and finishes with exit called from inside a function.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/*
 * When a program ends it hands a small number back to whoever ran it:
 * the exit status. 0, or EXIT_SUCCESS, means all went well; EXIT_FAILURE
 * means something did not. Shell scripts test it with && and ||, and
 * make stops a build when a compiler returns non-zero.
 *
 * Returning n from main is the same as calling exit(n). exit can be
 * called from any function, and it still runs atexit handlers and
 * flushes open files; the stack frames above it simply never return.
 */
static int check_name(const char *name)
{
    if (name[0] == '\0')
        return EXIT_FAILURE;
    return EXIT_SUCCESS;
}

static int check_age(int age)
{
    return age >= 0 && age <= 150 ? EXIT_SUCCESS : EXIT_FAILURE;
}

/*
 * Many tools use more than two codes: 0 for success, 1 for "the answer
 * is no", 2 for real trouble. grep works that way.
 */
static int find_word(const char *text, const char *word)
{
    if (word == NULL || word[0] == '\0')
        return 2;
    return strstr(text, word) != NULL ? 0 : 1;
}

static void finish(int status)
{
    printf("finish: calling exit(%d)\n", status);
    exit(status);
    /* Nothing here ever runs. */
}

static void last_words(void)
{
    printf("atexit handler: the program is ending\n");
}

int main(void)
{
    const char *text = "the quick brown fox";
    int failures = 0, status;

    printf("EXIT_SUCCESS is %d, EXIT_FAILURE is %d\n", EXIT_SUCCESS, EXIT_FAILURE);
    atexit(last_words);

    status = check_name("Ada");
    printf("check_name(\"Ada\")    -> %d\n", status);
    failures += status != EXIT_SUCCESS;

    status = check_name("");
    printf("check_name(\"\")       -> %d\n", status);
    failures += status != EXIT_SUCCESS;

    status = check_age(200);
    printf("check_age(200)       -> %d\n", status);
    failures += status != EXIT_SUCCESS;

    printf("find_word(\"fox\")     -> %d (found)\n", find_word(text, "fox"));
    printf("find_word(\"cat\")     -> %d (not found)\n", find_word(text, "cat"));
    printf("find_word(\"\")        -> %d (bad request)\n", find_word(text, ""));

    printf("%d checks failed; a real tool would now exit with %d\n",
           failures, failures ? EXIT_FAILURE : EXIT_SUCCESS);

    /*
     * This demonstration ends successfully, so that See reports a clean
     * run. Change the argument to EXIT_FAILURE and See shows the
     * program ending with status 1.
     */
    finish(EXIT_SUCCESS);
    printf("never printed\n");
    return 0;
}
