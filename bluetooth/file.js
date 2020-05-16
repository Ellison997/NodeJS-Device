//index.js
const fs = require('fs')

function isFileExisted(path) {
	return new Promise(function (resolve, reject) {
		fs.access(path, (err) => {
			if (err) {
				reject({
					result: false,
					msg: "未发现文件"
				});
			} else {
				resolve({
					result: true,
					msg: "文件存在"
				});
			}
		})
	})
}

(async () => {
	try {
		var res = await isFileExisted('/dev/rfcomm0');
		console.log(res.result);
	} catch (error) {
		console.log(error);
	}
})();