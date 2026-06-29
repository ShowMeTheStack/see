int main(void)
{
    const int k = 5;
    const char *s = "hi";
    char *const p = 0;
    k = 6;
    return 0;
}
/* ERROR: assignment of read-only variable 'k' */
