A = [1, 3, 5, 7, 9]
B = [10, 5, 1, 2, 4]

C = set(A) & set(B)
D = [i for i in A if i in B]

print(C)
print(D)