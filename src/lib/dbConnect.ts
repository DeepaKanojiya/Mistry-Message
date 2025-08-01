import { log } from "console";
import mongoose from "mongoose";

type  ConnnectionObject = {
  isConnected?:number
}


const connection: ConnnectionObject = {}



async function dbConnect():Promise<void>{
  if(connection.isConnected){
       console.log("Already connected to database");
       return
  }

  try{
    const db =  await mongoose.connect(process.env.MONGODB_URI || "", {})
    
    connection.isConnected = db.connections[0].readyState

    console.log("DB connected Successfully");

  } catch (err){
     console.log("DataBase connection failed" , err)

      process.exit(1)
  }
}

export default dbConnect