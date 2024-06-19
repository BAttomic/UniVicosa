#include<stdio.h>
#include<conio.h>

int main() {
    int i = 0, x = 0;
    while(i <= 100) {
            x = x + i;
            i++;
    }

    printf("X = %d",x);
    getch();
    return 0;
}
