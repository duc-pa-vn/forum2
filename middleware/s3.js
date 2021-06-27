const s3 = require('../common/s3');

const upload = async (req, res, next) => {
    try{
        const file = req.file;
        console.log(file);
        const result = await s3.uploadFile(file);
        console.log(result);
        req.body.key = result.key;
        next()
    }
    catch(err){
        console.log(err);
        return;
    }
    
}

module.exports ={
    upload
}