const express = require("express");
const cors = require("cors")
import request from "request";
const PDFDocument  = require("pdfkit");
import sharp from 'sharp';
const { Readable } = require("stream"); // Node.js stream module
const { PDFDocument: PDFLibDocument } = require('pdf-lib');
const { PassThrough } = require('stream');
const { put } = require ('@vercel/blob')
const multer = require('multer');
const upload = multer(); // Configure as needed (e.g., file size limits, destination)
const { DOMParser } = require('xmldom');

const XHR = require("xmlhttprequest").XMLHttpRequest;
const targetUrl = "https://s3.ultimate-guitar.com/musescore.scoredata/g/c0251f563b2bcfa165121936c9e4ffeec0325429/score_4.svg?response-content-disposition=attachment%3B%20filename%3D%22score_4.svg%22&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=4SHNMJS3MTR9XKK7ULEP%2F20241110%2Fus-west%2Fs3%2Faws4_request&X-Amz-Date=20241110T062817Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Signature=ee974ae54e5469d86ca46ccf46b58729b192d2a56f3697395a5c3399afa3f315";
const encodedUrl = encodeURIComponent(targetUrl); 
// console.log(encodedUrl)
const extTypeMap = {
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'webp': 'image/webp'
};
export const getImageDataUri = async (url) => {
  try {
    const stream = request(url),
      buffer = await new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
      }),
      dataUri = `data:${extTypeMap[url.split(".").pop()] || "image/png"};base64,${buffer.toString("base64")}`;

    return dataUri;
  } catch {
    return "";
  }
}

const app = express();
app.use(
    cors({
      origin: "*",
    })
);
// app.use(express.json({ limit: '500mb' }));  // Increase the body size limit to 50mb
// app.use(upload.array('images')); // Handle multiple file uploads

app.get("/", (req, res) => {
  let url = req.query.url;
  console.log(url)
  if(!url){
    url = "https://jsonplaceholder.typicode.com/posts/1"
  }
  try{
    const decodedUrl = decodeURIComponent(url);
    fetch(decodedUrl).then((response) => response.text()).then((data) => {
      res.send(data)
    })
  }catch(e){
    res.send(e)
  }
  
});
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // Allow all methods
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); 
  next(); // Continue to the next middleware or route handler
});
app.get("/audio", async (req, res) => {
  console.log('audio')
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
  let url = req.query.url;
  url = decodeURIComponent(url);

  const response = await fetch(url);
  const nodeStream = Readable.from(response.body);
  nodeStream.pipe(res).on("error", (err) => {
    console.error("Error while streaming audio:", err);
    res.status(500).send("Error streaming audio");
  }).on("finish", () => {
    console.log('donies')
  });

  console.log('audio done')


});
app.post("/pdffrombatch",upload.array('images'), async (req, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="merged_pdf.pdf"');


  // console.log('batching')
  // const urls = req.files; 
  // console.log(urls)

  // if(Array.isArray(urls)){
  //   console.log('urls is an array')
  // }else{
  //   console.log('urls is an', typeof urls)
  // }
  console.log(req.query.urls)
  let urls = decodeURIComponent( req.query.urls).split(",");
console.log(urls)
  const mergedPdf = await PDFLibDocument.create();

  const CHUNK_SIZE = 5;
  for (let i = 0; i < urls.length; i += CHUNK_SIZE) {
    const chunk = urls.slice(i, i + CHUNK_SIZE);
    
    for (const file of chunk) {
      try {
        console.log('processing image')
        let bytes = null;
        await fetch(file).then((response) => response.blob()).then(async (blob) => {
          const arrayBuffer = await blob.arrayBuffer(); // Wait for the array buffer
          bytes = Buffer.from(arrayBuffer); // No need for 'base64' here; arrayBuffer is already binary data
        });
        // // Optimize the image before adding to PDF
        // const buffer = await file.buffer; 

        // doc.addPage({ size: [612, 792] });
        // doc.image(buffer, 0, 0, { 
        //   fit: [612, 792],
        //   align: 'center', 
        //   valign: 'center' 
        // });
        console.log(bytes)
        if (bytes.slice(0, 4).toString() !== '%PDF') {
          console.error('Invalid PDF file');
          continue;
        }
        const pdf = await PDFLibDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
        
        console.log(copiedPages)
        // Clear references to help with garbage collection
        // file.buffer = null;
      } catch (imageError) {
        console.error('Error processing image:', imageError);
        continue;
      }
    }

    // Force garbage collection between chunks if available
    if (global.gc) {
      global.gc();
    }
  }
  let mergedPDFBytes = await mergedPdf.save();
  console.log(mergedPDFBytes)
  res.end(mergedPDFBytes); // Directly send binary data to the client

});
app.get("/batch", async (req, res) => {
  console.log('batch')
  let urls = decodeURIComponent( req.query.urls).split(",");
  let quality = urls[urls.length-1]
  urls.pop()
  console.log(quality)
  let width = Number(quality.split(" ") [0])//for some reason vercel likes " " and local likes "+" 
  let height = Number(quality.split(" ") [1])
  // console.log(urls)
  const chunks = [];

  const stream = new PassThrough();
  stream.on('data', chunk => chunks.push(chunk));
  const bufferPromise = new Promise(resolve => {
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

  const doc = new PDFDocument({
    autoFirstPage: false // Prevent automatic first page creation
  });
  doc.pipe(stream);
  for(let img in urls){
    try{
      console.log(`Starting conversion ${img + 1}`);
      const response = await fetch(urls[img]);
      const data = await response.text();
      if (!data || !data.includes("<svg")) {
        throw new Error(`Invalid SVG content from ${urls[img]}`);
      }
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(data, "image/svg+xml");

      // Get the root SVG element
      const svgElement = svgDoc.documentElement;

      // Extract width and height attributes
      const widthTemp = svgElement.getAttribute("width");
      const heightTemp = svgElement.getAttribute("height");
      let scale = widthTemp/width;
      let height = heightTemp/scale;

      let png = await sharp(Buffer.from(data)).resize({ width: Math.ceil(width), height: Math.ceil(height) }).png().toBuffer();
      doc.addPage({ size: [612, 792] });
    doc.image(png, 0, 0, { 
      fit: [612, 792],
      align: 'center', 
      valign: 'center' 
    });
    if (global.gc) {
      global.gc();
    }

    }catch(e){
      console.log(e)
    }
  }
  // const processUrls = urls.map(async(url, index)=>{
  //   try{
  //     console.log(`Starting conversion ${index + 1}`);
  //     const response = await fetch(url);
  //     const data = await response.text();
  //     if (!data || !data.includes("<svg")) {
  //       throw new Error(`Invalid SVG content from ${url}`);
  //     }
  //     const parser = new DOMParser();
  //     const svgDoc = parser.parseFromString(data, "image/svg+xml");

  //     // Get the root SVG element
  //     const svgElement = svgDoc.documentElement;

  //     // Extract width and height attributes
  //     const widthTemp = svgElement.getAttribute("width");
  //     const heightTemp = svgElement.getAttribute("height");
  //     let scale = widthTemp/width;
  //     let height = heightTemp/scale;

  //     let png = await sharp(Buffer.from(data)).resize({ width: Math.ceil(width), height: Math.ceil(height) }).png().toBuffer();
  //   //   const base64String = png.toString('base64');

  //   //  png = `data:image/png;base64,${base64String}`;
      
  //     console.log(`Finished PNG ${index}`);
  //     return png;
      

  //   }catch(e){
  //     console.log(e)
  //   }
  // })
  // const results = await Promise.all(processUrls);
  // results.sort((a, b) => a.index - b.index);
  // for (const result of results) {
  //   doc.addPage({ size: [612, 792] });
  //   doc.image(result, 0, 0, { 
  //     fit: [612, 792],
  //     align: 'center', 
  //     valign: 'center' 
  //   });
  // }
  doc.end();

  const buffer = await bufferPromise;
  const url = await put('files/batch/test.pdf', buffer, {access: 'public'});
  res.json({url:url})
  // console.log('done')
  // res.send(results)

})
app.get("/proccess", async (req, res) => {

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="merged_pdf.pdf"');
  
    const doc = new PDFDocument({
      autoFirstPage: false // Prevent automatic first page creation
    });    

    let urls = decodeURIComponent( req.query.urls).split(",");
    if (!urls || urls.length === 0) {
      throw new Error("No URLs provided");
    }
    let index = 0;
    doc.pipe(res);
    let verification = Array.from({length: urls.length-2}, (_,i) => i+1);
    console.log(urls)
    let quality = urls[urls.length-1]
    let width = Number(quality.split(" ") [0])
    let height = Number(quality.split(" ") [1])
    urls.pop()
    const processUrls = urls.map(async(url, index)=>{
      
      if(url.includes(".svg")){
        try {
          console.log(`Starting conversion ${index + 1}`);
          const response = await fetch(url);
          const data = await response.text();
          
          if (!data || !data.includes("<svg")) {
            throw new Error(`Invalid SVG content from ${url}`);
          }
  
          // Optimize the conversion with reduced quality and size
          const png = await sharp(Buffer.from(data)).resize({ width: width, height: height }).png().toBuffer();   
          console.log(`Processing PNG ${index}`);
          verification = verification.filter(item => item !== (index+1));
          return { type: 'png', data: png, index };
        } catch (error) {
          console.error(`Error processing SVG ${index + 1}:`, error);
          return { type: 'error', index };
        }
  
      }else if(url.includes(".png")){
        try {
          const img = await getImageDataUri(url);
          console.log(`Processing PNG ${index}`);
          verification = verification.filter(item => item !== (index+1));

          return { type: 'uri', data: img, index };
        } catch (error) {
          console.error(`Error processing PNG ${index + 1}:`, error);
          return { type: 'error', index };
        }
      }
      return { type: 'error', index };
    })
    const results = await Promise.all(processUrls);
    console.log(verification)
   
    // Sort by index to maintain order
    results.sort((a, b) => a.index - b.index);
    for (const result of results) {
      if(result.type === 'error'){
        console.log('error')
        continue;
      }
      // doc.addPage({ size: [612, 792] });
      doc.addPage({ size: [612, 792] });

      if (result.type === 'png') {
        doc.image(result.data, 0, 0, { 
          fit: [612, 792],
          align: 'center', 
          valign: 'center' 
        });
      } else if (result.type === 'uri') {
        doc.image(result.data, 0, 0, { 
          fit: [612, 792] 
        });
      }

      
      doc.flushPages();
    }
    
    console.log('All files processed, ending document');
    doc.on('end', () => {
      console.log('PDF document ended successfully');
    });
    
    // Handle any errors during PDF creation
    doc.on('error', (err) => {
      console.error('Error during PDF creation:', err);
    });
    doc.end();


 
  // const buffer = await new Promise((resolve, reject) => {
  //   doc.pipe(res).on('finish', resolve).on('error', reject);
  // });

  // Set headers to indicate PDF content
});


const PORT = 1891;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use!`);
  } else {
    console.error(err);
  }
});
module.exports = app;
