const storageService = require("../../services/storage.service");
const { v4: uuid } = require("uuid");

async function uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).json({
      message: "File Needed",
    });
  }
  try {
    const uploadedFile = await storageService.uploadFile(
      req.file.buffer,
      uuid()
    );
    res.status(200).json({
      message: "File Uploaded Successfully",
      file: uploadedFile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Couldn't Upload File",
      error: error,
    });
  }
}

module.exports = uploadFile;
