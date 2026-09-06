/*
 * title: Recovering from a signal with longjmp
 * level: 4
 * about: Runs risky steps under a SIGFPE handler that longjmps back to a safe point, so a failing step is skipped instead of ending the program.
 */
#include <stdio.h>
#include <signal.h>
#include <setjmp.h>

static jmp_buf safe_point;
static volatile sig_atomic_t last_signal = 0;

/*
 * The handler cannot return normally after a real arithmetic fault (the
 * faulting instruction would run again), so it jumps back to the place
 * saved by setjmp in run_step. Here the "fault" is reported with raise,
 * which keeps the program well defined.
 */
void on_fpe(int sig)
{
    last_signal = sig;
    longjmp(safe_point, 1);
}

/* Each step is a function; a step reports bad input by raising SIGFPE. */
int safe_divide(int a, int b)
{
    if (b == 0)
        raise(SIGFPE);
    return a / b;
}

int step_average(void) { return safe_divide(10 + 20 + 30, 3); }
int step_empty(void)   { return safe_divide(0, 0); }
int step_ratio(void)   { return safe_divide(7, 2); }
int step_rate(void)    { return safe_divide(100, 10 - 2 * 5); }

typedef int (*step_fn)(void);

/*
 * setjmp returns 0 when it saves the point, and 1 when longjmp comes
 * back to it. Watch the call stack in See: when the handler jumps, the
 * frames of on_fpe, safe_divide and the step vanish in one go.
 */
int run_step(step_fn f, int *result)
{
    if (setjmp(safe_point) != 0)
        return 0;               /* we arrived here from the handler */
    *result = f();
    return 1;
}

int main(void)
{
    step_fn steps[4];
    const char *names[4];
    int i, value;

    steps[0] = step_average; names[0] = "average";
    steps[1] = step_empty;   names[1] = "empty";
    steps[2] = step_ratio;   names[2] = "ratio";
    steps[3] = step_rate;    names[3] = "rate";

    signal(SIGFPE, on_fpe);

    for (i = 0; i < 4; i++) {
        value = 0;
        if (run_step(steps[i], &value)) {
            printf("%-8s ok, result %d\n", names[i], value);
        } else {
            printf("%-8s failed with signal %d (SIGFPE), skipped\n",
                   names[i], (int)last_signal);
            signal(SIGFPE, on_fpe);     /* the handler may have been reset */
        }
    }
    signal(SIGFPE, SIG_DFL);
    return 0;
}
