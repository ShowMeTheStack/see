int main(void)
{
    char buf[4];
    const char *s = buf;
    *s = 'x';
    return 0;
}
/* ERROR: assignment of read-only location '*s' */
