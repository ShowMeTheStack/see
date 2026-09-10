/*
 * title: Domain and range errors in math.h
 * level: 3
 * about: Calls sqrt, log, acos, pow and exp with bad arguments and reports each failure through errno, EDOM, ERANGE and HUGE_VAL.
 */
#include <stdio.h>
#include <math.h>
#include <errno.h>
#include <string.h>

/*
 * The math functions cannot return an error code, because every double
 * is a possible answer. Instead C89 uses the global errno:
 *   EDOM    the argument is outside the function's domain, as in
 *           sqrt(-1); the result is not meaningful.
 *   ERANGE  the true answer is too big for a double; the function
 *           returns HUGE_VAL (with the right sign) instead.
 * Library functions never set errno to 0 themselves, so the caller
 * clears it before the call and inspects it straight after.
 */

static void report(const char *call, double result)
{
    int e = errno;    /* copy it at once: printf may change errno */

    printf("%-14s ", call);
    if (e == EDOM)
        printf("domain error (%s)\n", strerror(e));
    else if (e == ERANGE)
        printf("range error, result %s (%s)\n",
               result == HUGE_VAL ? "HUGE_VAL" :
               result == -HUGE_VAL ? "-HUGE_VAL" : "tiny", strerror(e));
    else
        printf("= %g\n", result);
}

/* A guarded square root: checking the argument first is usually
   clearer than letting the library complain. */
static double safe_sqrt(double x, int *ok)
{
    *ok = x >= 0.0;
    return *ok ? sqrt(x) : 0.0;
}

int main(void)
{
    double r;
    int ok;

    errno = 0; r = sqrt(16.0);         report("sqrt(16)", r);
    errno = 0; r = sqrt(-1.0);         report("sqrt(-1)", r);
    errno = 0; r = log(-5.0);          report("log(-5)", r);
    errno = 0; r = acos(2.0);          report("acos(2)", r);
    errno = 0; r = pow(-8.0, 0.5);     report("pow(-8, 0.5)", r);
    errno = 0; r = exp(1000.0);        report("exp(1000)", r);
    errno = 0; r = pow(10.0, 400.0);   report("pow(10, 400)", r);
    errno = 0; r = exp(2.0);           report("exp(2)", r);

    r = safe_sqrt(-9.0, &ok);
    printf("safe_sqrt(-9): %s\n", ok ? "fine" : "refused before calling sqrt");
    r = safe_sqrt(2.25, &ok);
    printf("safe_sqrt(2.25): %g\n", r);

    /*
     * In See, errno is one of the globals. Watch it change from 0 to 33
     * (EDOM) or 34 (ERANGE) as you step over the bad calls, and back to
     * 0 on each errno = 0 line.
     */
    printf("EDOM is %d, ERANGE is %d on this system\n", EDOM, ERANGE);
    return 0;
}
