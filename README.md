
# PDF Flipbook
Convert your PDFs into interactive flipbooks using the Pdf flipbook converter powered by turnjs and pdfjs libraries.

 ## Installation

1. **Node.js and npm:**
   - Make sure you have Node.js and npm installed. You can download them from [here](https://nodejs.org/).

2. **Install http-server:**
   - Open your terminal and run the following command to install `http-server` globally:
     ```bash
     npm install -g http-server
     ```

## Usage

1. **Navigate to Your Project Directory:**
   - Open the terminal and go to the directory where your index.html, CSS, and JS files are located:
     ```bash
     cd /path/to/your/project
     ```

2. **Start http-server:**
   - Run the following command to start the server:
     ```bash
     http-server
     ```
   - The server will provide you with a URL (e.g., http://127.0.0.1:8080) where your project is being served.

3. **Access Your Project:**
   - Open your web browser and navigate to the provided URL.

4. **Stop http-server:**
   - To stop the server, go back to the terminal where it is running and press `Ctrl+C`.

## Source File

#### Define PDF Src

to define the src, open pdfjs/viewer.js and change to line 30.
```javascript
var DEFAULT_URL =  "compressed.tracemonkey-pldi-09.pdf";
```
