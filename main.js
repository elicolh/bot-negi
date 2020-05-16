const discord = require("discord.js")
const fs = require("fs")
const client = new discord.Client()
var guild;var scoreChannel;var members
var fileSave = __dirname + "/save.json";
var saveDir = __dirname + "/saves/"
const roles = [{seuil:0,id:"711003903642042401"},{seuil:.5,id:"711003936672186400"},{seuil:1,id:"711003955341295636"}]
client.on("ready",()=>{
    console.log("bot started...")
    guild = client.guilds.cache.find(e=>e.id=="544953131205918720");
    scoreChannel = guild.channels.cache.array().find(e=>e.name=="points")
    members = loadMemb()
    checkMemb()
    setInterval(()=>save(),30*1000);
    setInterval(()=>savefile(),1000*60*60)//toutes les heures
    setInterval(()=>up(),1000) 
    setInterval(()=>uproles(),1000);
    sendUpdateMessage();
})
client.on("guildMemberAdd",()=>{
    checkMemb()
})
function loadMemb(){
    try{
        var txt = fs.readFileSync(fileSave,"utf8");
        var m = JSON.parse(txt)
    }
    catch{
        try{
            var files = fs.readdirSync(saveDir)
            var m = JSON.parse(saveDir + files[0],"utf8")
        }catch{
            var m = [];
        }
    }
    return m;
}
function checkMemb(){
    guild.members.cache.forEach(e => {
        if(!members.map(me=>me.id).includes(e.id)&&!e.user.bot){
            var name = e.nickname || e.user.username
            members.push({name:name,score:0,id:e.id});
        }
    });
}
function save(){
    fs.writeFileSync(fileSave,JSON.stringify(members));
}
function savefile(){
    fs.writeFileSync(
        saveDir + new Date().toLocaleString().replace(/ /gi, '_').replace(/:/gi, '.').replace(/\//gi,'-') + ".json",
        JSON.stringify(members))
}
function up(){
    members.forEach(memb=>{
        if(inVocal(memb))
            memb.score += 1/60;
    })
    console.log(members.map(e=>e.score))
}
function uproles(){
    members.forEach(memb=>{
        var guildmember = guild.members.cache.find(e=>e.id==memb.id)
        for(var i=0;i<roles.length;i++){
            var role = roles[i]
            if(!guildmember.roles.cache.some(e=>e.id==role.id)){//si role pas inclut
                if(memb.score >= role.seuil){
                    console.log("ajout:")
                    console.log(guildmember.user.username, guild.roles.cache.find(e=>e.id==role.id).name)//prochain
                    guildmember.roles.cache.array().forEach(e=>{
                        if(roles.map(e=>e.id).includes(e.id))
                            guildmember.roles.remove(e)
                    })
                    guildmember.roles.add(guild.roles.cache.find(e=>e.id==role.id));
                }
                break;//on garde que le 1er role pas inclu
            }
        }
    })
}

function sendUpdateMessage(){
    members.sort((a,b)=>b.score-a.score);
    var noms = []
    for(var i=0;i<15;i++){
        // var nom = 
    }

    var msg = new discord.MessageEmbed()
    msg.addField("osef","text");
    scoreChannel.send(msg)
}

function inVocal(memb){
    var guildmember = guild.members.cache.find(e=>e.id==memb.id)
    if(!guildmember.voice)return false
    if(guildmember.voice.channel == null) return false//pas dans un channel
    if(!guildmember.voice.type == "voice") return false//si pas dans vocal
    if(guildmember.voice.channel.members.array().filter(e=>!e.user.bot).length == 1) return false //si tout seul dans channel ou tt seul avec bot(s)
    if(guildmember.voice.selfMute || guildmember.voice.selfDeaf)return false//si sourd ou muet
    return true
}
client.login("NzEwOTg0ODA1MDYzNDU4ODM3.Xr87Gw.DLFzukxD9yxV0LLgg4WOSc-lo1s")