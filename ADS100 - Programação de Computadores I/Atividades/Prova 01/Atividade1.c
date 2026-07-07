#include <stdio.h>
#include <math.h>

int main() {
    int A = 6, B = 12, C = -7;
    float D = 1.5;
    
    // a) 2*A mod 3-C
    float result_a = (2 * A % 3) - C;
    printf("Resultado a): %.2f\n", result_a);
    
    // b) rad(-2*C) div 4
    float result_b = sqrt(-2 * C) / 4;
    printf("Resultado b): %.2f\n", result_b);
    
    // c) ((20 div 3) div 3) + pot(8,2)/2
    float result_c = ((20 / 3) / 3) + pow(8, 2) / 2;
    printf("Resultado c): %.2f\n", result_c);
    
    // d) (30 mod 4 * pot(3,3))*(-1)
    float result_d = (30 % 4 * pow(3, 3)) * (-1);
    printf("Resultado d): %.2f\n", result_d);
    
    // e) pot(-C,2) + D(*10)/A
    float result_e = pow(-C, 2) + D * 10 / A;
    printf("Resultado e): %.2f\n", result_e);
    
    getch();
    return 0;
}
