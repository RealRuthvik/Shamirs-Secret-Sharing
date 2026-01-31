import secrets

mersenneExponent = 521
fieldPrime = 2**mersenneExponent - 1

def stringToInt(textData):
    dataBytes = b'\x01' + textData.encode('utf-8')
    return int.from_bytes(dataBytes, 'big')

def intToString(integerData):
    byteLength = (integerData.bit_length() + 7) // 8
    return integerData.to_bytes(byteLength, 'big')[1:].decode('utf-8')

def evaluatePolynomial(coefficients, xValue):
    total = 0
    for power in range(len(coefficients)):
        coeff = coefficients[power]
        term = coeff * pow(xValue, power, fieldPrime)
        total = (total + term) % fieldPrime
    return total

def createShares(secretInt, threshold, totalShares):
    if secretInt >= fieldPrime:
        raise ValueError("Secret too large for prime field")
    coeffs = [secretInt]
    for i in range(threshold - 1):
        if i == threshold - 2:
            coeffs.append(secrets.randbelow(fieldPrime - 1) + 1)
        else:
            coeffs.append(secrets.randbelow(fieldPrime))
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
            if i == j: continue
            xj, yj = shares[j]
            numerator = (numerator * (0 - xj)) % fieldPrime
            denominator = (denominator * (xi - xj)) % fieldPrime
        lagrangeCoefficient = (numerator * pow(denominator, -1, fieldPrime)) % fieldPrime
        secretResult = (secretResult + yi * lagrangeCoefficient) % fieldPrime
    return secretResult