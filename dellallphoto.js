'use strict'

/** Auto Delete Media Instagram **/
/** CODE BY CCOCOT | CCOCOT.CO **/
/** ccocot@bc0de.net **/
/** BC0DE.NET - NAONLAH.NET - WingKocoli **/

const Client = require('instagram-private-api').V1;
const delay = require('delay');
const chalk = require('chalk');
const _ = require('lodash');
const inquirer = require('inquirer');

const User = [
	{
		type:'input',
		name:'username',
		message:'Insert Username'
	},
	{
		type:'password',
		name:'password',
		message:'Insert Password',
		mask:'*'
	},
	{
		type:'input',
		name:'sleep',
		message:'Insert Sleep (In MiliSeconds)',
		validate: function(value){
			value = value.match(/[0-9]/);
			if (value) return true;
			return 'Delay is number';
		}
	}
]

const Login = async function(User){

    const Device = new Client.Device(User.username);
    const Storage = new Client.CookieMemoryStorage();
    const session = new Client.Session(Device, Storage);

    try {
        await Client.Session.create(Device, Storage, User.username, User.password)
        const account = await session.getAccount();
        return Promise.resolve({session,account});
    } catch (err) {
        return Promise.reject(err);
    }

}

const Media = async function(session, id){
	const Media = new Client.Feed.UserMedia(session, id);

	try {
		const Poto = [];
		var cursor;
		do {
			if (cursor) Media.setCursor(cursor);
			const getPoto = await Media.get();
			await Promise.all(getPoto.map(async(poto) => {
				Poto.push({
					id:poto.id,
					link:poto.params.webLink
				});
			}))
			cursor = await Media.getCursor()
		} while (Media.isMoreAvailable());
		return Promise.resolve(Poto);
	} catch (err){
		return Promise.reject(err);
	}
}

const Delete = async function(session, id){
	try {
		await Client.Media.delete(session,id);
		return true;
	} catch (err) {
		return false;
	}
}


const Excute = async function(User,sleep){
	try {
		
		/** TRY TO LOGIN **/
		console.log('\n[?] Try to login ..');
		const doLogin = await Login(User);
		console.log(chalk`{bold.green [+] Login Succsess}`);

		/** TRY TO GET ALL MEDIA **/		
		console.log('[?] Try to get media ..')
		var getMedia = await Media(doLogin.session, doLogin.account.id);
		console.log(chalk`{bold.green [+] Succsess to get Media. Media Length : ${getMedia.length}}\n`);
		getMedia = _.chunk(getMedia, 5);

		/** TRY TO DELETE ALL MEDIA **/
		for (let i = 0; i < getMedia.length; i++) {
			console.log('[?] Try to delete 5 photo\n')
			await Promise.all(getMedia[i].map(async(media) => {
				const doDelete = await Delete(doLogin.session, media.id);
				const PrintOut = chalk`> ${media.link} => ${doDelete ? chalk`{bold.green Sukses}` : chalk`{bold.red Gagal}`}`
				console.log(PrintOut);
			}))
			console.log(chalk`>> {yellow Delay For ${sleep} MiliSeconds}`)
			await delay(sleep)
		}

	} catch (err) {
		console.log(err);
	}
}

console.log(chalk`
{bold.blue
            ######                           #####        
            ######                           #####        
            ######                           #####        
            ##########                  ##########        
                ######                  ######            
                ######                  ######            
                ######                  ######            
            ######################################        
            ######################################        
            ######################################        
        ##############################################    
        ##########   ####################    #########    
        ##########   ####################    #########    
    ######################################################
    ######################################################
    ######################################################
    ######################################################
    #####   ######################################   #####
    #####   ######################################   #####
    #####   ######################################   #####
    #####   ######                           #####   #####
    #####   ######                           #####   #####
    #####   ######                           #####   #####
    #####   ##################   #################   #####
                ##############   #############            
                ##############   #############            
                ##############   #############
    ------------------------------------------------------
      {bold.green MASS DELETE ALL PHOTO IG *SET SLEEP!}
      Code By {bold.red Cyber Screamer Aka Ccocot}
      Fixing & Testing by {bold.red Putu Syntax}
      {bold.red CCOCOT.CO | BC0DE.NET | NAONLAH.NET | WingkoColi
      ccocot@bc0de.net and Thank's To SGB TEAM}
    ------------------------------------------------------}
`)
inquirer.prompt(User)
	.then(answers => {
		Excute({
			username:answers.username,
			password:answers.password
		},answers.sleep);
	})
