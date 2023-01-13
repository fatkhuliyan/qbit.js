const exec = require('child_process').exec;
module.exports = {list_unchecked,auth,list_custom};

function parseError(err) {
    try {
      err = err.message.trim().split('\n');
      return {message: err[err.length -1]};
    } catch (e) {
      return err;
    }
}


function myExec(cmd) {
    return new Promise((resolve,reject) => {
        exec(cmd,{maxBuffer: 1024 * 5000}, (err, res) => {
            if(err) reject(parseError(err));
            resolve(res);
        })
    })
}

async function auth(){
    await myExec('curl -c torrent_server.txt -i --header "Referer: {IP}" --data "username=USERNAME&password=PASSWORD" {IP}/login');
}
async function prop(hash){
    return JSON.parse(await myExec('curl -b torrent_server.txt -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.100 Safari/537.36" "{IP}/query/propertiesFiles/'+hash+'"'));
}
async function list_data(category){
    return JSON.parse(await myExec(`curl -b torrent_server.txt -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.100 Safari/537.36" "{IP}/query/torrents?filter=completed&category=${category}"`));
}

auth();

function list_unchecked() {
    return new Promise(async(resolve,reject)=>{
        let data_raw = await list_data('unchecked');
        let data_res = [];
        // console.log(data_raw);
        try {
            data_raw.map(async(r,i) => {
            try {
                let d = await prop(r['hash']);
                let data_subs = [];
                d.map((data,index) => {
                let long_name = data["name"];
                let short_name = (long_name.split('/'))[1];
                // console.log(data)
                if(/\.mkv/.test(data['name']) || /\.mp4/.test(data['name'])){
                    if(!/Sample/.test(data['name']) || !/SAMPLE/.test(data['name'])){
                    // console.log('true')
                    data_res.push({
                        'hash'      : r["hash"],
                        'name'      : short_name,
                        'new_path'  : "/var/www/html/d/finish/"+short_name,
                        'save_path' : data["name"],
                        'path'      : r["save_path"]+long_name,
                    });
                    }
                }
                if(/\.srt/.test(data['name']) || /\.ass/.test(data['name'])){
                    data_subs.push({'path':r['save_path']+long_name})
                }
                })
                data_res[data_res.length-1]['subs'] = (data_subs.length>0?data_subs:null)
                if(data_raw.length == i+1){
                    resolve(data_res);
                }
            } catch (err) {
                reject(err);
            }
            })
        } catch (e) {
            reject(e);
        }
    })
}

function list_custom(cat) {
    return new Promise(async(resolve,reject)=>{
        let data_raw = await list_data('cat');
        let data_res = [];
        // console.log(data_raw);
        try {
            data_raw.map(async(r,i) => {
            try {
                let d = await prop(r['hash']);
                let data_subs = [];
                d.map((data,index) => {
                let long_name = data["name"];
                let short_name = (long_name.split('/'))[1];
                // console.log(data)
                if(/\.mkv/.test(data['name']) || /\.mp4/.test(data['name'])){
                    if(!/Sample/.test(data['name']) || !/SAMPLE/.test(data['name'])){
                    // console.log('true')
                    data_res.push({
                        'hash'      : r["hash"],
                        'name'      : short_name,
                        'new_path'  : "/var/www/html/d/finish/"+short_name,
                        'save_path' : data["name"],
                        'path'      : r["save_path"]+long_name,
                    });
                    }
                }
                if(/\.srt/.test(data['name']) || /\.ass/.test(data['name'])){
                    data_subs.push({'path':r['save_path']+long_name})
                }
                })
                data_res[data_res.length-1]['subs'] = (data_subs.length>0?data_subs:null)
                if(data_raw.length == i+1){
                    resolve(data_res);
                }
            } catch (err) {
                reject(err);
            }
            })
        } catch (e) {
            reject(e);
        }
    })
}
