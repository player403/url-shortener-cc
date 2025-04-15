import db from "pg";

export class ShortURLClient{
    constructor(config, keyLength = 6){
        this._client = new db.Client(config);
        this._keyLength = keyLength < 4 ? 4 : keyLength;
        //Error handler
    }

    async init(){
        await this._client.connect();
        await this._client.query(`ALTER TABLE urls ALTER COLUMN id SET DEFAULT generate_alphanumerical(${this._keyLength});`);
    }

    async addShortURL(url, expireDate = null){
        if (expireDate === null){
            expireDate = new Date();
            expireDate.setFullYear(expireDate.getFullYear() + 1);
        }
        const query = await this._client.query(`
            INSERT INTO urls (url, expire_date)
            VALUES ($1, $2)
            RETURNING *;`, [url, expireDate]);
        if (query.rows.length !== 1)
            throw Error(`Could not create entry for url '${url}'`);
        const entry = query.rows[0];
        
        return {shortURLKey: entry.id, url: entry.url, expireDate: entry.expire_date };
    }

    async getEntryByURL(url){
        const query = await this._client.query(`
            SELECT *
            FROM urls
            WHERE url = $1;`, [url]);
        if (query.rows.length !== 1)
            throw Error(`No entry found under the url '${url}'`);
        const entry = query.rows[0];
        return {shortURLKey: entry.id, url: entry.url, expireDate: entry.expire_date };
    }

    async getEntryByShortURL(shortURL){
        const query = await this._client.query(`
            SELECT *
            FROM urls
            WHERE id = $1;`, [shortURL]);
        if (query.rows.length !== 1)
            throw Error(`No entry found under the url '${shortURL}'`);
        const entry = query.rows[0];
        return {shortURLKey: entry.id, url: entry.url, expireDate: entry.expire_date };
    }

    async deleteEntryByURL(url){
        const query = await this._client.query(`
            DELETE FROM urls
            WHERE url = $1;`, [url]);
    }

    async deleteEntryByShortURL(shortURL){
        const query = await this._client.query(`
            DELETE FROM urls
            WHERE id = $1;`, [shortURL]);
    }

    async deleteExpired(date = null){
        if (date === null)
            date = new Date();
        const query = await this._client.query(`
            DELETE FROM urls
            WHERE expire_date <= $1;`, [date]);
    }
}

export default ShortURLClient;