import { Router } from "express"
const router = Router();
import { ApiError } from "../errors/errors"
import facade from "../facades/DummyDB-Facade"

//Authentication
import authMiddleware from "../middleware/basic-auth"
router.use(authMiddleware)


router.get("/all", async (req, res) => {
  const friends = await facade.getAllFriends();
  const friendsDTO = friends.map(friend => {
    const { firstName, lastName } = friend
    return { firstName, lastName }
  })
  res.json(friendsDTO);
})

//find any user by id
router.get("/findby-username/:userid", async (req, res, next) => {
  const userId = req.params.userid;
  try {
    const friend = await facade.getFrind(userId);
    if (friend == null) {
      return next(new ApiError("user not found", 404))
    }
    const { firstName, lastName, email } = friend;
    const friendDTO = { firstName, lastName, email }
    res.json(friendDTO);
  } catch (err) {
    next(err)
  }
})

//find info for my user
router.get("/me", async (req:any, res, next) => {
  const userId = req.credentials.userName;
  try {
    const friend = await facade.getFrind(userId);
    if (friend == null) {
      return next(new ApiError("user not found", 404))
    }
    const { firstName, lastName, email } = friend;
    const friendDTO = { firstName, lastName, email }
    res.json(friendDTO);
  } catch (err) {
    next(err)
  }
})

export default router