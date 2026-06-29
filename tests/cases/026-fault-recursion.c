int down(int n) { return down(n + 1) + 1; }
int main(void) { return down(0); }
/* FAULT: Stack overflow */
