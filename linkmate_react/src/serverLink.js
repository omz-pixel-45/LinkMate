export default function ServerLink(path){
    let url = window.location.href.split(':');
    if (url[2]) {
        url[2] = 3500;
        url = url.join(':');
        url += path
    }
    else url = 'https://member.darkchat.chat' + path;
    return url;
}


