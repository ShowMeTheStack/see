int main(void)
{
    char *s = "constant";
    s[0] = 'C';
    return 0;
}
/* FAULT: read-only */
