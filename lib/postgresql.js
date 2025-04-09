import db from "pg";

export class ShortURLClient{
    constructor(config){
        this._client = new db.Client(config);
        //Error handler
    }

    async init(){
        return await this._client.connect();
    }

    async addShortURL(url, expireDate = null){
        if (expireDate === null){
            expireDate = new Date();
            expireDate.setFullYear(expireDate.getFullYear() + 1);
        }
        const query = await this._client.query(`
            INSERT INTO url_references (url, expire_date)
            VALUES ($1, $2)
            RETURNING *;`, [url, expireDate]);
        if (query.rows.length !== 1)
            throw Error(`Could not create entry for url '${url}'`);
        const entry = query.rows[0];
        return {shortURL: entry.short_url, url: entry.url, expireDate: entry.expire_date };
    }

    async getEntryByURL(url){
        const query = await this._client.query(`
            SELECT *
            FROM url_references
            WHERE url = $1;`, [url]);
        if (query.rows.length !== 1)
            throw Error(`No entry found under the url '${url}'`);
        const entry = query.rows[0];
        return {shortURL: entry.short_url, url: entry.url, expireDate: entry.expire_date };
    }

    async getEntryByShortURL(shortURL){
        const query = await this._client.query(`
            SELECT *
            FROM url_references
            WHERE short_url = $1;`, [shortURL]);
        if (query.rows.length !== 1)
            throw Error(`No entry found under the url '${shortURL}'`);
        const entry = query.rows[0];
        return {shortURL: entry.short_url, url: entry.url, expireDate: entry.expire_date };
    }

    async deleteEntryByURL(url){
        const query = await this._client.query(`
            DELETE FROM url_references
            WHERE url = $1;`, [url]);
    }

    async deleteEntryByShortURL(shortURL){
        const query = await this._client.query(`
            DELETE FROM url_references
            WHERE short_url = $1;`, [shortURL]);
    }

    async deleteExpired(date = null){
        if (date === null)
            date = new Date();
        const query = await this._client.query(`
            DELETE FROM url_references
            WHERE expire_date <= $1;`, [date]);
    }
}

export default ShortURLClient;