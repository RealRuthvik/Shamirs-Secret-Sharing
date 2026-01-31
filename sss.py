import secrets
import os

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
        print("Might get math error. Secret is too large")
        return []
        
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
            if i == j:
                continue
            xj, yj = shares[j]
            
            numerator = (numerator * (0 - xj)) % fieldPrime
            denominator = (denominator * (xi - xj)) % fieldPrime
            
        lagrangeCoefficient = (numerator * pow(denominator, -1, fieldPrime)) % fieldPrime
        secretResult = (secretResult + yi * lagrangeCoefficient) % fieldPrime
        
    return secretResult

def processText():
    secretMessage = input("Enter secret text: ")
    print("Original:", secretMessage)
    
    secretAsInt = stringToInt(secretMessage)
    
    if secretAsInt >= fieldPrime:
        print("Might get math error. Use shorter text.")
        return

    allShares = createShares(secretAsInt, 3, 5)
    print("Generated Shares:", allShares)
    
    subset = allShares[0:3]
    recoveredInt = reconstructSecret(subset)
    finalText = intToString(recoveredInt)
    
    print("Recovered:", finalText)

def processImage():
    inputPath = input("Enter path to image file: ")
    filename = os.path.basename(inputPath)
    outputPath = filename + "-sss-recovered"
    
    chunkSize = 64

    try:
        with open(inputPath, 'rb') as fIn, open(outputPath, 'wb') as fOut:
            print(f"Processing stream from {inputPath} to {outputPath}...")
            
            while True:
                chunk = fIn.read(chunkSize)
                if not chunk:
                    break
                
                chunkInt = int.from_bytes(b'\x01' + chunk, 'big')
                
                shares = createShares(chunkInt, 3, 5)
                
                subset = shares[0:3]
                recoveredInt = reconstructSecret(subset)
                
                totalBytes = (recoveredInt.bit_length() + 7) // 8
                chunkBytes = recoveredInt.to_bytes(totalBytes, 'big')[1:]
                
                fOut.write(chunkBytes)
                
        print("Processing complete.")
        
    except FileNotFoundError:
        print("File not found.")
    except Exception as e:
        print(f"Error: {e}")

mode = input("Select mode (text(1) or image(2)): ").strip().lower()
if mode == "text" or mode == "1":
    processText()
elif mode == "image" or mode == "2":
    processImage()
else:
    print("Invalid Choice")
