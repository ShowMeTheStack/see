/* The C reference: <signal.h> */
SEE.RefText = Object.assign(SEE.RefText || {}, {
  signal: {
    text: 'signal(sig, func) chooses what happens when signal number sig arrives. func is either SIG_DFL (the default action, usually ending the program), SIG_IGN (ignore the signal) or a pointer to your own handler, a function taking the signal number as an int and returning nothing.\n\nIt returns the previous setting for that signal, or SIG_ERR if the request failed, for example for a signal number that does not exist. The declaration looks frightening because signal both takes and returns a pointer to a function; with typedef void (*handler)(int); it reads handler signal(int sig, handler func).\n\nA handler should do very little: setting a variable of type volatile sig_atomic_t is the one thing the standard fully allows. Calling printf or malloc from a handler is not safe in general. When the handler is entered the setting may be reset to SIG_DFL, so a handler that wants to stay installed calls signal again.',
    example: `#include <stdio.h>
#include <signal.h>

static volatile sig_atomic_t seen = 0;

static void on_signal(int sig)
{
    seen = sig;
}

int main(void)
{
    if (signal(SIGINT, on_signal) == SIG_ERR) {
        printf("could not install the handler\\n");
        return 1;
    }
    raise(SIGINT);
    printf("the handler saw signal %d\\n", (int)seen);
    return 0;
}
`,
    see: ['raise', 'SIG_DFL', 'SIG_IGN', 'SIG_ERR', 'sig_atomic_t'],
  },
  raise: {
    text: 'raise(sig) sends signal sig to the program itself. It returns 0 on success and non-zero on failure.\n\nWhat happens next depends on the setting made with signal: the handler runs and then raise returns, or the signal is ignored, or the default action happens, which for most signals ends the program. abort() is in effect raise(SIGABRT).\n\nraise is the portable way to try out a signal handler without waiting for a real event.',
    example: `#include <stdio.h>
#include <signal.h>

static volatile sig_atomic_t count = 0;

static void handler(int sig)
{
    (void)sig;
    count++;
    signal(SIGTERM, handler);
}

int main(void)
{
    signal(SIGTERM, handler);
    raise(SIGTERM);
    raise(SIGTERM);
    signal(SIGTERM, SIG_IGN);
    raise(SIGTERM);
    printf("handled %d times, the third was ignored\\n", (int)count);
    return 0;
}
`,
    see: ['signal', 'abort', 'SIGABRT'],
  },
  sig_atomic_t: {
    text: 'sig_atomic_t is an integer type that can be read and written in one indivisible step, even when a signal arrives in the middle of the program. Here it is an int.\n\nDeclare a variable shared between a signal handler and the rest of the program as volatile sig_atomic_t. volatile tells the compiler that the value can change behind its back, so it is read from memory every time. Only store small values in it; the standard guarantees at least 0 to 127.',
    example: `#include <stdio.h>
#include <signal.h>

static volatile sig_atomic_t stop = 0;

static void on_term(int sig)
{
    (void)sig;
    stop = 1;
}

int main(void)
{
    int steps = 0;

    signal(SIGTERM, on_term);
    while (!stop) {
        steps++;
        if (steps == 5)
            raise(SIGTERM);
    }
    printf("stopped after %d steps\\n", steps);
    return 0;
}
`,
    see: ['signal', 'volatile'],
  },
  SIG_DFL: {
    text: 'SIG_DFL, passed as the handler to signal, restores the default action for a signal. For the signals in C89 the default is to end the program abnormally: SIGINT, SIGTERM, SIGABRT, SIGFPE, SIGSEGV and SIGILL all terminate.\n\nIt is a function pointer value that no real function has, so it can be compared with what signal returns.',
    example: `#include <stdio.h>
#include <signal.h>

static void mine(int sig)
{
    (void)sig;
}

int main(void)
{
    void (*old)(int);

    signal(SIGINT, mine);
    old = signal(SIGINT, SIG_DFL);
    printf("previous handler was %s\\n", old == mine ? "mine" : "something else");
    printf("SIGINT is back to the default action\\n");
    return 0;
}
`,
    see: ['signal', 'SIG_IGN', 'SIG_ERR'],
  },
  SIG_ERR: {
    text: 'SIG_ERR is the value signal returns when it cannot do what was asked, for example for a signal number that does not exist. Always compare the result of signal with SIG_ERR rather than with NULL.\n\nNever pass SIG_ERR to signal yourself; it is only ever a return value.',
    example: `#include <stdio.h>
#include <signal.h>

int main(void)
{
    if (signal(12345, SIG_IGN) == SIG_ERR)
        printf("signal 12345 does not exist\\n");
    if (signal(SIGINT, SIG_IGN) != SIG_ERR)
        printf("SIGINT will now be ignored\\n");
    return 0;
}
`,
    see: ['signal', 'SIG_DFL', 'SIG_IGN'],
  },
  SIG_IGN: {
    text: 'SIG_IGN, passed as the handler to signal, makes the program ignore that signal: raising it does nothing.\n\nSome signals cannot sensibly be ignored. Ignoring SIGSEGV or SIGFPE caused by a real fault leaves the program with nowhere to go; the result is undefined.',
    example: `#include <stdio.h>
#include <signal.h>

int main(void)
{
    signal(SIGINT, SIG_IGN);
    raise(SIGINT);
    printf("still running after SIGINT\\n");
    return 0;
}
`,
    see: ['signal', 'SIG_DFL', 'raise'],
  },
  SIGINT: {
    text: 'SIGINT (2) is the interactive attention signal: on a terminal it is what Ctrl+C sends. Its default action ends the program.\n\nA program that wants to finish cleanly on Ctrl+C installs a handler that sets a volatile sig_atomic_t flag, and its main loop checks the flag.',
    example: `#include <stdio.h>
#include <signal.h>

static volatile sig_atomic_t interrupted = 0;

static void on_int(int sig)
{
    (void)sig;
    interrupted = 1;
}

int main(void)
{
    signal(SIGINT, on_int);
    raise(SIGINT);
    if (interrupted)
        printf("interrupted: saving work and leaving\\n");
    return 0;
}
`,
    see: ['signal', 'SIGTERM', 'sig_atomic_t'],
  },
  SIGILL: {
    text: 'SIGILL (4) signals an illegal instruction: the processor met something it cannot execute, typically because a function pointer pointed at data, or memory holding code was overwritten. The default action ends the program.\n\nThere is rarely anything sensible a handler can do; the program has lost track of what it is running.',
    example: `#include <stdio.h>
#include <signal.h>

int main(void)
{
    printf("SIGILL is signal number %d\\n", SIGILL);
    return 0;
}
`,
    see: ['signal', 'SIGSEGV'],
  },
  SIGABRT: {
    text: 'SIGABRT (6) is the abnormal termination signal. abort() raises it, and so does a failed assert.\n\nA handler for SIGABRT may run some last-moment logging, but if it returns, abort still ends the program.',
    example: `#include <stdio.h>
#include <signal.h>

static void on_abort(int sig)
{
    (void)sig;
}

int main(void)
{
    signal(SIGABRT, on_abort);
    raise(SIGABRT);
    printf("raise(SIGABRT) with a handler came back; abort() would not\\n");
    return 0;
}
`,
    see: ['abort', 'assert', 'raise'],
  },
  SIGFPE: {
    text: 'SIGFPE (8) signals an erroneous arithmetic operation. Despite the name ("floating-point exception") the usual cause is integer division by zero, or dividing INT_MIN by -1. Floating-point division by zero normally gives inf or nan without any signal.\n\nThe default action ends the program. See stops at the division and reports "integer division by zero".',
    example: `#include <stdio.h>
#include <signal.h>

int main(void)
{
    int a = 7, b = 0;

    if (b != 0)
        printf("%d\\n", a / b);
    else
        printf("checked first: dividing by zero would raise SIGFPE (%d)\\n", SIGFPE);
    return 0;
}
`,
    see: ['signal', '/', 'undefined behaviour'],
  },
  SIGSEGV: {
    text: 'SIGSEGV (11) is the segmentation violation: an access to memory the program does not own, such as dereferencing a NULL or dangling pointer or running far off the end of an array. The default action ends the program.\n\nIn See this is the fault you will meet most often. The debugger stops at the offending line, and the memory picture shows where the pointer was pointing.',
    example: `#include <stdio.h>
#include <signal.h>

int main(void)
{
    int *p = NULL;

    if (p == NULL)
        printf("p is NULL; *p would raise SIGSEGV (%d)\\n", SIGSEGV);
    return 0;
}
`,
    see: ['NULL', 'dangling pointer', 'buffer overflow', 'signal'],
  },
  SIGTERM: {
    text: 'SIGTERM (15) is a termination request sent to the program from outside, for example by the kill command on Unix. Its default action ends the program.\n\nUnlike SIGSEGV or SIGFPE it does not mean anything went wrong, so it is a good candidate for a handler that saves state and exits cleanly.',
    example: `#include <stdio.h>
#include <signal.h>

static volatile sig_atomic_t quit = 0;

static void on_term(int sig)
{
    (void)sig;
    quit = 1;
}

int main(void)
{
    signal(SIGTERM, on_term);
    raise(SIGTERM);
    printf(quit ? "asked to stop: stopping cleanly\\n" : "running\\n");
    return 0;
}
`,
    see: ['signal', 'SIGINT', 'raise'],
  },
});
