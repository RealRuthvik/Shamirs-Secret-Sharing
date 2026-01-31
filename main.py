from fastapi import FastAPI, Form, UploadFile, File
from fastapi.responses import StreamingResponse, FileResponse
import io
import zipfile
import uvicorn
import sss

app = FastAPI()

@app.get("/")
def readRoot():
    return FileResponse("index.html")

@app.get("/recover")
def readRecover():
    return FileResponse("recover.html")

@app.get("/style.css")
def getStyle():
    return FileResponse("style.css", media_type="text/css")

@app.get("/script.js")
def getScript():
    return FileResponse("script.js", media_type="text/javascript")

@app.post("/text/generate")
def generateText(text: str = Form(...), n: int = Form(...), k: int = Form(...)):

    secretInt = sss.stringToInt(text)
    sharesList = sss.createShares(secretInt, k, n)

    formattedShares = []
    for share in sharesList:
        formattedShares.append(f"{share[0]}-{share[1]}")

    return {"shares": formattedShares}

@app.post("/text/recover")
def recoverText(shares: str = Form(...)):
    lines = shares.strip().split('\n')
    sharesList = []
    for line in lines:
        if '-' in line:
            parts = line.split('-')
            sharesList.append((int(parts[0]), int(parts[1])))

    recoveredInt = sss.reconstructSecret(sharesList)
    secretText = sss.intToString(recoveredInt)

    return {"secret": secretText}

@app.post("/image/generate")
async def generateImage(file: UploadFile = File(...), n: int = Form(...), k: int = Form(...)):
    fileContent = await file.read()
    shareBuffers = {i: io.BytesIO() for i in range(1, n + 1)}

    imageStream = io.BytesIO(fileContent)
    chunkSize = 64

    while True:
        chunk = imageStream.read(chunkSize)
        if not chunk: break

        chunkInt = int.from_bytes(b'\x01' + chunk, 'big')
        shares = sss.createShares(chunkInt, k, n)

        for share in shares:
            x = share[0]
            y = share[1]
            yBytes = y.to_bytes((y.bit_length() + 7) // 8, 'big')
            lengthBytes = len(yBytes).to_bytes(2, 'big')
            shareBuffers[x].write(lengthBytes)
            shareBuffers[x].write(yBytes)

    zipBuffer = io.BytesIO()
    with zipfile.ZipFile(zipBuffer, 'w') as zipFile:
        for x in shareBuffers:
            zipFile.writestr(f"share_{x}.sss", shareBuffers[x].getvalue())

    zipBuffer.seek(0)
    return StreamingResponse(
        zipBuffer, 
        media_type="application/zip", 
        headers={"Content-Disposition": "attachment; filename = shares.zip"}
    )

@app.post("/image/recover")
async def recoverImage(files: list[UploadFile] = File(...)):
    sharesMap = []
    for fileItem in files:
        filename = fileItem.filename
        digits = []
        for char in filename:
            if char.isdigit():
                digits.append(char)
        xIndex = int("".join(digits))

        fileBytes = await fileItem.read()
        sharesMap.append((xIndex, io.BytesIO(fileBytes)))

    outputBuffer = io.BytesIO()

    while True:
        chunkShares = []
        endOfFile = False

        for item in sharesMap:
            x = item[0]
            stream = item[1]
            lengthBytes = stream.read(2)
            if not lengthBytes:
                endOfFile = True
                break

            length = int.from_bytes(lengthBytes, 'big')
            yBytes = stream.read(length)
            y = int.from_bytes(yBytes, 'big')
            chunkShares.append((x, y))

        if endOfFile: break

        recoveredInt = sss.reconstructSecret(chunkShares)
        totalBytes = (recoveredInt.bit_length() + 7) // 8
        fullBytes = recoveredInt.to_bytes(totalBytes, 'big')
        outputBuffer.write(fullBytes[1:])

    outputBuffer.seek(0)
    return StreamingResponse(
        outputBuffer, 
        media_type="image/png", 
        headers={"Content-Disposition": "attachment; filename = recovered.png"}
    )
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port = 8000, reload = True)