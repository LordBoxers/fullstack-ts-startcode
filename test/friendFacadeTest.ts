import * as mongo from "mongodb"
import FriendFacade from '../src/facades/friendFacade';

import chai from "chai";
const expect = chai.expect;

//use these two lines for more streamlined tests of promise operations
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import bcryptjs from "bcryptjs"
import { InMemoryDbConnector } from "../src/config/dbConnector"
import { ApiError } from "../src/errors/errors";

let friendCollection: mongo.Collection;
let facade: FriendFacade;

describe("## Verify the Friends Facade ##", () => {

  before(async function () {
    //Connect to inmemory test database
    const client = await InMemoryDbConnector.connect();
    //Get the database and initialize the facade
    const db = client.db();
    //Initialize friendCollection, to operate on the database without the facade
    friendCollection = db.collection("friends");
    facade = new FriendFacade(db)
  })

  beforeEach(async () => {
    const hashedPW = await bcryptjs.hash("secret", 4)
    await friendCollection.deleteMany({})
    //Create a few few testusers for ALL the tests
    await friendCollection.insertMany([
      {firstName: "Albert", lastName: "Albertsen", email: "albert@mail.com", password: hashedPW},
      {firstName: "Bertram", lastName: "Bertramsen", email: "Bertram@mail.com", password: hashedPW},
      {firstName: "Christian", lastName: "Christensen", email: "Christian@mail.com", password: hashedPW}
    ])
  })

  describe("Verify the addFriend method", () => {
    it("It should Add the user Jan", async () => {
      const newFriend = { firstName: "Jan", lastName: "Olsen", email: "jan@b.dk", password: "secret" }
      const status = await facade.addFriend(newFriend);
      expect(status).to.be.not.null
      const jan = await friendCollection.findOne({ email: "jan@b.dk" })
      expect(jan.firstName).to.be.equal("Jan")
    })

    xit("It should not add a user with a role (validation fails)", async () => {
      const newFriend = { firstName: "Jan", lastName: "Olsen", email: "jan@b.dk", password: "secret", role: "admin" }
      const status = await facade.addFriend(newFriend);
      await expect(status).to.be.rejectedWith(ApiError)
    })
  })

  describe("Verify the editFriend method", () => {
    it("It should change lastName to XXXX", async () => {
      const newFriend = { firstName: "Jan", lastName: "Olsen", email: "jan@b.dk", password: "secret"}
      await facade.editFriend("albert@mail.com", newFriend)
      const findJan = await friendCollection.findOne({email: newFriend.email})
      expect(findJan.firstName).to.be.equal("Jan")
    })
  })

  describe("Verify the deleteFriend method", () => {
    it("It should remove the user Christian", async () => {
      const delUser = await facade.deleteFriend("Christian@mail.com")
      expect(delUser).to.be.true;
    })
    it("It should return false, for a user that does not exist", async () => {
      const delUser = await facade.deleteFriend("1231236545")
      expect(delUser).to.be.false;
    })
  })

  describe("Verify the getAllFriends method", () => {
    it("It should get two friends", async () => {
      const allFriends = facade.getAllFriends();
      expect((await allFriends).length).to.be.above(1)
    })
  })

  describe("Verify the getFriend method", () => {

    it("It should find Albert", async () => {
      const friend1 = await facade.getFrind("albert@mail.com")
      expect(friend1.firstName).to.be.equal("Albert")
    })
    it("It should not find xxx.@.b.dk", async () => {
      const friend2 = await facade.getFrind("xxx.@.b.dk")
      expect(friend2).to.be.null
    })
  })

  describe("Verify the getVerifiedUser method", () => {
    it("It should correctly validate Albert's credential's", async () => {
      const veriefiedAlbert = await facade.getVerifiedUser("albert@mail.com", "secret")
      expect(veriefiedAlbert).to.be.not.null;
    })

    it("It should NOT validate Peter Pan's credential,s", async () => {
      const notVerified = await facade.getVerifiedUser("albert@mail.com", "forkert")
      expect(notVerified).to.be.null;
    })

    it("It should NOT validate a non-existing users credentials", async () => {
      const notUser = await facade.getVerifiedUser("scam@mail.com", "scampass")
      expect(notUser).to.be.null;
    })
  })

})