export default class ShortURLEntries {
    constructor(length){
        this.shortURLs = new Map();
        if (length < 4)
            length = 4;
        this.shortURLLength = length;
    }
    

    #generateShortURL(){
        var maxTries = 1000;
        var shortURL = '';
        do{
            maxTries--;
            shortURL = '';
            for (let i = 0; i < this.shortURLLength; i++){
                shortURL += this.#getCharacter(Math.floor(Math.random() * 62));
            }
        }while(this.shortURLs.has(shortURL) && maxTries > 0)
        //In case random generation doesn't work, choose next in order
        if(maxTries < 1)
            throw Error('Did not generate shortURL. Process took too long');
        return shortURL;
    }

    #getCharacter(code){
        if(code < 10){
            return String.fromCharCode(48 + code); //Numbers 0-9
        }else if(code < 36){
            return String.fromCharCode(55 + code); //Uppercase Letters A-Z
        }else if(code < 62){
            return String.fromCharCode(61 + code); //Lowercase Letters a-z
        }
        return null;
    }

    addShortURL(url, expireDate = null){
        if (expireDate === null){
            expireDate = new Date();
            expireDate.setFullYear(expireDate.getFullYear() + 1);
        }
        if(typeof(expireDate) === 'string')
            expireDate = new Date(expireDate);
        if(expireDate < new Date())
            throw Error('Did not add entry, expire date in past.')
        const shortURL = this.#generateShortURL();
        this.shortURLs.set(shortURL, {url: url, expireDate: expireDate});
        return {shortURL: shortURL, ...this.shortURLs.get(shortURL)};
    }

    getEntryByURL(url){
        var entry = null;
        this.shortURLs.forEach((value, key) => {if (value.url === url) entry = {shortURL: key, ...value};});
        return entry;
    }

    getEntryByShortURL(shortURL){
        var entry = null;
        const data = this.shortURLs.get(shortURL);
        if (data)
            entry = {shortURL: shortURL, ...data}
        return entry;   
    }


    deleteEntryByURL(url){
        var entryKey = null;
        this.shortURLs.forEach((value, key) => {if (value.url === url) entryKey = key;});
        return this.deleteEntryByShortURL(entryKey);
    }

    deleteEntryByShortURL(shortURL){
        return this.shortURLs.delete(shortURL);
    }

    deleteExpired(expireDate = null){
        var keys = [];
        if (expireDate === null)
            expireDate = new Date();
        this.shortURLs.forEach((value, key) => {if(value.expireDate < expireDate) keys.push(key);});
        keys.forEach(value => {this.shortURLs.delete(value);});
    }

}

