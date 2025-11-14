//Interface with a database
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

const db = "data.db"
const flush = 'false'
export async function initDB(){
    console.log(`opening file ${db}`)
const database = await open({
    filename: `./${db}`,
    driver: sqlite3.Database

})
if(flush == 'true'){
    await database.exec("DROP TABLE data")
    await database.run("CREATE TABLE data(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT,balance INTEGER)");
    await database.run("INSERT into data (name,balance) values ('Bill Gates', '139000000000'")
}
return database;
};