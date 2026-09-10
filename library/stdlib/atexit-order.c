/*
 * title: Clean-up handlers with atexit
 * level: 2
 * about: Registers several clean-up functions with atexit as resources are opened, and shows that they run in reverse order when main returns.
 */
#include <stdio.h>
#include <stdlib.h>

/*
 * atexit(f) asks for f to be called when the program ends normally,
 * by returning from main or by calling exit. The functions run in the
 * REVERSE of the order they were registered, like a stack: the last
 * thing set up is the first thing torn down, which is exactly what you
 * want when later resources depend on earlier ones.
 */
static char *buffer = NULL;
static FILE *logfile = NULL;

static void close_log(void)
{
    printf("  close_log: closing /tmp/atexit.log\n");
    if (logfile != NULL)
        fclose(logfile);
    logfile = NULL;
}

static void free_buffer(void)
{
    printf("  free_buffer: releasing the heap block\n");
    free(buffer);
    buffer = NULL;
}

static void say_goodbye(void)
{
    printf("  say_goodbye: registered first, so it runs last\n");
}

static void report(void)
{
    printf("  report: registered last, so it runs first\n");
}

int main(void)
{
    if (atexit(say_goodbye) != 0)
        printf("could not register say_goodbye\n");

    logfile = fopen("/tmp/atexit.log", "w");
    if (logfile != NULL) {
        atexit(close_log);
        fprintf(logfile, "program started\n");
    }

    buffer = (char *)malloc(64);
    if (buffer != NULL)
        atexit(free_buffer);

    atexit(report);

    printf("main is working; 4 handlers are waiting\n");
    printf("main returns now\n");

    /*
     * Keep stepping (F10) past the closing brace of main in See: the
     * handlers appear on the call stack one by one, and the heap block
     * disappears when free_buffer runs.
     */
    return 0;
}
