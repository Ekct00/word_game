const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const targetSize = 50 * 1024; // 50KB
const imgDir = path.join(__dirname, 'img');

async function compressImage(filePath) {
    let quality = 80;
    let compressed;
    
    do {
        compressed = await sharp(filePath)
            .resize(800, 800, { // 限制最大尺寸
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality }) // 转换为 JPEG 格式
            .toBuffer();
        
        quality -= 5; // 如果文件仍然太大，降低质量继续尝试
    } while (compressed.length > targetSize && quality > 20);

    await sharp(compressed).toFile(filePath);
    console.log(`压缩完成: ${filePath} (${Math.round(compressed.length / 1024)}KB)`);
}

async function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            await processDirectory(filePath);
        } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
            await compressImage(filePath);
        }
    }
}

processDirectory(imgDir).catch(console.error);