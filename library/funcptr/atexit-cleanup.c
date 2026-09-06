/*
 * title: Cleanup functions with atexit
 * level: 2
 * about: Registers cleanup functions with atexit and shows that they run in reverse order when main returns, closing a file and freeing a buffer.
 */
#include <stdio.h>
#include <stdlib.h>

static FILE *log_file = NULL;
static char *buffer = NULL;

/*
 * atexit takes a pointer to a function with no arguments and no result.
 * The library keeps a list of them and calls them, newest first, after
 * main returns or when exit() is called.
 */
void say_goodbye(void)
{
    printf("cleanup 1: goodbye (registered first, runs last)\n");
}

void close_log(void)
{
    if (log_file != NULL) {
        fprintf(log_file, "log closed\n");
        fclose(log_file);
        log_file = NULL;
        printf("cleanup 2: log file closed\n");
    }
}

void free_buffer(void)
{
    free(buffer);
    buffer = NULL;
    printf("cleanup 3: buffer freed (registered last, runs first)\n");
}

int main(void)
{
    char line[64];

    if (atexit(say_goodbye) != 0)
        printf("could not register say_goodbye\n");

    log_file = fopen("/tmp/atexit-demo.log", "w");
    if (log_file != NULL)
        atexit(close_log);  /* register only once there is something to close */

    buffer = malloc(100);
    if (buffer != NULL)
        atexit(free_buffer);

    if (log_file != NULL)
        fprintf(log_file, "program started\n");
    if (buffer != NULL) {
        sprintf(buffer, "the buffer is in use");
        printf("main: %s\n", buffer);
    }

    /*
     * Check the log contents so far by opening a second stream on it.
     * fflush makes sure the first line has reached the file.
     */
    if (log_file != NULL) {
        FILE *check;
        fflush(log_file);
        check = fopen("/tmp/atexit-demo.log", "r");
        if (check != NULL) {
            if (fgets(line, sizeof line, check) != NULL)
                printf("main: the log says: %s", line);
            fclose(check);
        }
    }

    /*
     * main ends here, but the program does not: step past the closing
     * brace in See and watch the three cleanup functions run, and the
     * heap block disappear before the program finishes.
     */
    printf("main: returning\n");
    return 0;
}
