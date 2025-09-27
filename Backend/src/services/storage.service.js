const ImageKit = require("imagekit");

if (!process.env.IMAGEKIT_PUBLICKEY || !process.env.IMAGEKIT_PRIVATEKEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    console.error('ImageKit configuration missing. Ensure IMAGEKIT_PUBLICKEY, IMAGEKIT_PRIVATEKEY, and IMAGEKIT_URL_ENDPOINT are set in .env');
    process.exit(1);
}
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLICKEY,
    privateKey: process.env.IMAGEKIT_PRIVATEKEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

async function uploadFile(file,fileName){
    return  result= await imagekit.upload({
        file : file, //required
        fileName : fileName,   //required
    })
}

module.exports={
    uploadFile
}
