const s3 = require('../common/s3');

const upload = async (req, res) => {
    try{
        const file = req.file;
        console.log(file);
        const result = await s3.uploadFile(file);
        console.log(result);
    }
    catch(err){
        console.log(err);
    }
    
}

module.exports ={
    upload
}