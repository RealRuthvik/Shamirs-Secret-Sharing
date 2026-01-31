import random

mersenneExponent = 521
fieldPrime = 2**mersenneExponent - 1

def stringToInt(textData):
    return int.from_bytes(textData.encode('utf-8'), 'big')

def intToString(integerData):
    byteLength = (integerData.bit_length() + 7) // 8
    return integerData.to_bytes(byteLength, 'big').decode('utf-8')

def evaluatePolynomial(coefficients, xValue):
    total = 0
    for power in range(len(coefficients)):
        coeff = coefficients[power]
        term = coeff * (xValue ** power)
        total = (total + term) % fieldPrime
    return total

def createShares(secretInt, threshold, totalShares):
    if secretInt >= fieldPrime:
        print("Error: Secret is too large")
        return []
        
    coeffs = [secretInt]
    for i in range(threshold - 1):
        coeffs.append(random.randint(0, fieldPrime - 1))
    
    sharesList = []
    for i in range(1, totalShares + 1):
        x = i
        y = evaluatePolynomial(coeffs, x)
        sharesList.append((x, y))
    return sharesList

def reconstructSecret(shares):
    numShares = len(shares)
    secretResult = 0
    
    for i in range(numShares):
        xi, yi = shares[i]
        numerator = 1
        denominator = 1
        
        for j in range(numShares):
            if i == j:
                continue
            xj, yj = shares[j]
            
            numerator = (numerator * (0 - xj)) % fieldPrime
            denominator = (denominator * (xi - xj)) % fieldPrime
            
        lagrangeCoefficient = (numerator * pow(denominator, -1, fieldPrime)) % fieldPrime
        secretResult = (secretResult + yi * lagrangeCoefficient) % fieldPrime
        
    return secretResult

secretMessage = "Kim Jong Un is secretly gay"
print("Original:", secretMessage)

secretAsInt = stringToInt(secretMessage)

allShares = createShares(secretAsInt, 3, 5)
print(allShares)
subset = allShares[0:3]
recoveredInt = reconstructSecret(subset)
finalText = intToString(recoveredInt)

print("Recovered:", finalText)
