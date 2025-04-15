import express from 'express';
import ejs from 'ejs';
import {ShortURLClient} from './lib/postgresql.js';
import localClient from './lib/local.js';
import env from 'dotenv';

env.config();

var client = new localClient(process.env.SURL_URL_LENGTH);
if(process.env.SURL_DATA_HANDLER === 'PostgreSQL'){
    client = new ShortURLClient({
        user: process.env.SURL_POSTGRESQL_USER, 
        password: process.env.SURL_POSTGRESQL_PASSWORD, 
        host: process.env.SURL_POSTGRESQL_HOST, 
        port: process.env.SURL_POSTGRESQL_PORT, 
        database: 'short_url_db'}, 
        process.env.SURL_URL_LENGTH);
    await client.init();
}
    
const app = express();
const port = 8080;
var lastExpireCheck = new Date();

app.use(express.urlencoded({'extended': true}));
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.render('./index.ejs');
});

app.get('/view/:shortURL', async (req, res) => {
    try{
        const entry = await client.getEntryByShortURL(req.params.shortURL);
        if(entry.expireDate < new Date()){
            await client.deleteEntryByShortURL(entry.url);
            throw Error(`Expired: Deleting entry ${entry.shortURLKey}`);
        }
        res.render('view.ejs', {entry: entry, domain: process.env.SURL_DOMAIN, port: process.env.SURL_PORT});
    }catch (e){
        console.log(e.message);
        res.sendStatus(404);
    }
});

app.get('/:shortURL', async (req, res) => {
    try{
        const entry = await client.getEntryByShortURL(req.params.shortURL);
        if(!entry)
            res.sendStatus(404);
        if(entry.expireDate < new Date()){
            await client.deleteEntryByShortURL(entry.url);
            throw Error(`Expired: Deleting entry ${entry.shortURLKey}`);
        }
        res.redirect(entry.url);
        console.log(`Redirecting ${req.params.shortURL} to ${entry.url}`);
    }catch(e){    
        res.sendStatus(404);
        console.log(e.message);
    }
});

app.post('/add', async (req, res) => {
    const now = new Date();
    if(Math.abs(now - lastExpireCheck) > process.env.SURL_EXPIRE_CHECK_TIMEOUT){
        lastExpireCheck = now;
        client.deleteExpired(now);
        console.log(`Expire Check Timer triggered: Deleting old entries`);
    }
    try{
        //TODO: Check if url (has http)
        const entry = await client.addShortURL(req.body.url, req.body.expireDate === '' ? null : req.body.expireDate);
        res.redirect(`view/${entry.shortURLKey}`);
        console.log(`Created: ${entry.shortURLKey} to ${entry.url}`);
    }
    catch (e){
        res.redirect('/');
        console.log(e.message);
    }  
});

app.post('/del/:shortURL', async (req, res) => {
    await client.deleteEntryByShortURL(req.body.shortURL);
    console.log(`Deleted: ${req.body.shortURL}`);
    res.sendStatus(200);
});


app.listen(process.env.SURL_PORT, (err) => {
    if (err)
        console.log(err.message);
    else
        console.log(`Server running on port ${port}`);
})