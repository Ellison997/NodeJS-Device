var exec = require('child_process').exec;
	var cmd = 'sudo /home/pi/nodev8/bin/node     /home/pi/bleno/examples/pizza/fj550.js ';

	
	console.log(cmd);
	exec(cmd, function(error, stdout, stderr) {
		// ��ȡ����ִ�е����
		console.log('out put ')
		let result = {
			success: true,
			msg: ''
		}
		if(stdout)
		{
			result.msg=stdout
		}
		if(error)
		{
			result.msg=error;
		}
		
		//log.info(result);
		//res.send(result);
		
	});