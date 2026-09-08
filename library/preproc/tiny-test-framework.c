/*
 * title: A tiny unit test framework from macros
 * level: 3
 * about: Builds EXPECT and EXPECT_EQ macros that report the failing expression, its value and its line, and uses them to test a string reversing function.
 */
#include <stdio.h>
#include <string.h>

static int tests_run = 0;
static int tests_failed = 0;

/*
 * EXPECT records one check. #cond puts the condition's own text in the
 * message, __LINE__ says where it is. Multi-line macros need a
 * backslash at the end of every line but the last.
 */
#define EXPECT(cond)                                              \
    do {                                                          \
        tests_run++;                                              \
        if (!(cond)) {                                            \
            tests_failed++;                                       \
            printf("    FAIL line %d: %s\n", __LINE__, #cond);    \
        }                                                         \
    } while (0)

/* For ints, also show the two values, which is what you need first
   when a test fails. Each argument is evaluated once, into a local. */
#define EXPECT_EQ(actual, expected)                               \
    do {                                                          \
        int a_ = (actual), e_ = (expected);                       \
        tests_run++;                                              \
        if (a_ != e_) {                                           \
            tests_failed++;                                       \
            printf("    FAIL line %d: %s is %d, expected %d\n",   \
                   __LINE__, #actual, a_, e_);                    \
        }                                                         \
    } while (0)

#define EXPECT_STR(actual, expected) EXPECT(strcmp((actual), (expected)) == 0)

/* RUN calls a test function and prints its name using #. */
#define RUN(test)                                                 \
    do {                                                          \
        int before_ = tests_failed;                               \
        test();                                                   \
        printf("  %-20s %s\n", #test,                             \
               tests_failed == before_ ? "ok" : "FAILED");        \
    } while (0)

/* The code under test. reverse() is correct; count_vowels() has a bug
   on purpose: it forgets capital letters. */
static void reverse(char *s)
{
    size_t i, j;
    char t;
    if (*s == '\0')
        return;
    for (i = 0, j = strlen(s) - 1; i < j; i++, j--) {
        t = s[i];
        s[i] = s[j];
        s[j] = t;
    }
}

static int count_vowels(const char *s)
{
    int n = 0;
    for (; *s; s++)
        if (strchr("aeiou", *s) != NULL)
            n++;
    return n;
}

static void test_reverse(void)
{
    char buf[16];
    strcpy(buf, "stressed");
    reverse(buf);
    EXPECT_STR(buf, "desserts");
    strcpy(buf, "");
    reverse(buf);
    EXPECT_STR(buf, "");
    strcpy(buf, "x");
    reverse(buf);
    EXPECT_STR(buf, "x");
    EXPECT_EQ((int)strlen(buf), 1);
}

static void test_vowels(void)
{
    EXPECT_EQ(count_vowels("banana"), 3);
    EXPECT_EQ(count_vowels("rhythm"), 0);
    EXPECT_EQ(count_vowels("Apple"), 2);
    EXPECT(count_vowels("AEIOU") == 5);
}

int main(void)
{
    printf("running tests\n");
    RUN(test_reverse);
    RUN(test_vowels);
    printf("%d checks, %d failed\n", tests_run, tests_failed);

    /*
     * A real test runner would return 1 here when tests fail. This one
     * returns 0 so the run counts as finished in See; the two failures
     * are the point of the demonstration.
     */
    return 0;
}
