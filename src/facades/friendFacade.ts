import { IFriend } from '../interfaces/IFriend';
import { Db, Collection } from "mongodb";
import bcrypt from "bcryptjs";
import { ApiError } from '../errors/errors';
import Joi, { ValidationError } from "joi"
import { updateDecorator } from 'typescript';

const BCRYPT_ROUNDS = 10;

const USER_INPUT_SCHEMA = Joi.object({
  firstName: Joi.string().min(2).max(40).required(),
  lastName: Joi.string().min(2).max(50).required(),
  password: Joi.string().min(4).max(30).required(),
  email: Joi.string().email().required()
})

class FriendsFacade {
  db: Db
  friendCollection: Collection

  constructor(db: Db) {
    this.db = db;
    this.friendCollection = db.collection("friends");
  }

  /**
   * 
   * @param friend 
   * @throws ApiError if validation fails
   */
  async addFriend(friend: IFriend): Promise<{ id: string }> {
    const status = USER_INPUT_SCHEMA.validate(friend);
    if (status.error) {
      throw new ApiError(status.error.message, 400)
    }
    const hashedpw = await bcrypt.hash(friend.password, BCRYPT_ROUNDS);
    const f = { ...friend, password: hashedpw }

    const dbFriend = await this.friendCollection.insertOne({firstName: f.firstName, lastName: f.lastName, email: f.email, password: f.password, role: "user"})
    return dbFriend.insertedId
  }

  /**
   * TODO
   * @param email 
   * @param friend 
   * @throws ApiError if validation fails or friend was not found
   */
  async editFriend(email: string, friend: IFriend): Promise<{ modifiedCount: number }> {
    const status = USER_INPUT_SCHEMA.validate(friend);
    if (status.error) {
      throw new ApiError(status.error.message, 400)
    }
    const hashedpw = await bcrypt.hash(friend.password, BCRYPT_ROUNDS);
    const f = { ...friend, password: hashedpw }

    const filter = {email};
    const upDoc = {
      $set: { firstName: f.firstName, lastName: f.lastName, email: f.email, password: f.password}
    }
    const update = await this.friendCollection.updateOne(filter, upDoc)

    return {modifiedCount: update.modifiedCount}
  }

  /**
   * 
   * @param friendEmail 
   * @returns true if deleted otherwise false
   */
  async deleteFriend(friendEmail: string): Promise<boolean> {
    const f: IFriend = await this.friendCollection.findOne({email: friendEmail})
    if (f) {
      this.friendCollection.deleteOne({email: friendEmail})
      return true
    }
    return false
    
  }

  async getAllFriends(): Promise<Array<IFriend>> {
    const users: unknown = await this.friendCollection.find({}).toArray();
    return users as Array<IFriend>
  }
  
  /**
   * 
   * @param friendEmail 
   * @returns 
   * @throws ApiError if not found
   */
  async getFrind(friendEmail: string): Promise<IFriend> {
     const user: IFriend = await this.friendCollection.findOne({email: friendEmail})
     return user
  }

  /**
   * Use this method for authentication
   * @param friendEmail 
   * @param password 
   * @returns the user if he could be authenticated, otherwise null
   */
  async getVerifiedUser(friendEmail: string, password: string): Promise<IFriend | null> {
    const friend: IFriend = await this.friendCollection.findOne({ email: friendEmail })
    if (friend && await bcrypt.compare(password, friend.password)) {
      return friend
    }
    return Promise.resolve(null)
  }

}

export default FriendsFacade;