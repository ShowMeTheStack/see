int main(void)
{
    char a[4], b[4];
    char *const p = a;
    p = b;
    return 0;
}
/* ERROR: assignment of read-only variable 'p' */
