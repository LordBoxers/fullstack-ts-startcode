import path from "path"
require('dotenv').config({ path: path.join(__dirname, "..", "..", '.env') })
import { Db, Collection, ObjectID } from "mongodb";
import IPosition from '../interfaces/IPosition'
import FriendsFacade from './friendFacade';
import { DbConnector } from "../config/dbConnector"
import { ApiError } from "../errors/errors";
import { IpOptions } from "joi";

class PositionFacade {
  db: Db
  positionCollection: Collection
  friendFacade: FriendsFacade;

  constructor(db: Db) {
    this.db = db;
    this.positionCollection = db.collection("positions");
    this.friendFacade = new FriendsFacade(db);
  }

  async addOrUpdatePosition(email: string, longitude: number, latitude: number): Promise<IPosition> {
    // Find friend i friend collection
    const friend = await this.friendFacade.getFriendFromEmail(email)
    const fullName = friend.firstName + " " + friend.lastName
    const query = {email}
    const pos:IPosition = {lastUpdated: new Date(), email, name:fullName, location:{type:"Point",coordinates:[longitude, latitude]}}
    const update = {
      $set: {...pos}
    }
    const options = {upsert:true, returnOriginal:false} //opretter position hvis der ikke er en
    const result = await this.positionCollection.findOneAndUpdate(query, update, options)
    return result.value;
  }

  async findNearbyFriends(email: string, longitude: number, latitude: number, distance: number, password?: string, ): Promise<Array<IPosition>> {
    // tjek om bruger findes
    const friend = await this.friendFacade.getFriendFromEmail(email)
    await this.addOrUpdatePosition(email, longitude, latitude)
    //this.friendFacade.getVerifiedUser
    
    // updatere / tilføjer position
    return this.positionCollection.find(
      {
        email : {$ne:email},
        location : {
          $near: {
            $geometry: {
               type: "Point" ,
               coordinates: [ longitude , latitude ]
            },
            $maxDistance: distance
          }
        }
     }
    ).toArray()

    //
    throw new Error("Not Implemented")
  }

  async getAllPositions(): Promise<Array<IPosition>> {
    return this.positionCollection.find({}).toArray();
  }


}

export default PositionFacade;

async function tester() {
  const client = await DbConnector.connect()
  const db = client.db(process.env.DB_NAME)
  const positionFacade = new PositionFacade(db)
  await positionFacade.addOrUpdatePosition("pp@b.dk", 5, 5)
  process.exit(0)
}

//tester()