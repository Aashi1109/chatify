import { ClientError, UnauthorizedError } from "@exceptions";
import { getJWTPayload } from "@lib/helpers";
import { User } from "@models";
import { RedisCommonCache } from "@redis";

const userCache = new RedisCommonCache();

const socketUserParser = async (socket, next) => {
  const cookies = socket.request.headers?.cookie;
  const jwtCookie = cookies
    ?.split(";")
    .find((c: string) => c.trim().startsWith("jwt="))
    ?.split("=")[1];

  let err: ClientError | UnauthorizedError;

  if (!jwtCookie) err = new ClientError(`Missing token`);
  try {
    const { _id, username } = (await getJWTPayload(jwtCookie)) || {};

    if (!_id && !username)
      err = new UnauthorizedError(`Forbidden: Insufficient permissions`);
    let user = await userCache.methods.getKey(`user:${_id}`);

    if (!user) {
      user = await User.findOne({ _id, username });
      user &&
        userCache.methods.setString(
          `user:${user?._id}`,
          user?.toObject(),
          24 * 60 * 60
        );
    }

    if (!user)
      err = new UnauthorizedError(`Forbidden: Insufficient permission`);

    next(err);
    socket.request.user = user;
  } catch (error) {
    next(new UnauthorizedError(`Forbidden: Insufficient permissions`));
  }
};

export default socketUserParser;
